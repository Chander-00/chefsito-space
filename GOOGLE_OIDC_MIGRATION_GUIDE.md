# From NextAuth to Go: Google + Discord Sign-In with OpenID Connect (Practical Guide)

If you're migrating from a Next.js + NextAuth app to a Go backend, authentication is usually the part that feels the most risky.

The good news: Google and Discord sign-in via OpenID Connect (OIDC) are standard flows, and both are very implementable in Go with a clean architecture.

---

## TL;DR

- **OIDC is authentication** (who is the user).
- **OAuth2 is authorization** (what can the app access).
- For app login, your source of truth is the **ID token** (`id_token`) and especially the provider user ID (`sub`).
- In your own DB, persist provider identity as: `provider = google|discord`, `providerAccountId = sub`.
- Then issue your own app session cookie.

---

## Why this matters in a migration

In NextAuth, much of this is abstracted away (providers, callbacks, account linking, session handling).
In Go, you'll wire these steps explicitly. That sounds scary, but it gives you total control and easier future portability.

---

## What is OpenID Connect in plain words?

OpenID Connect is a layer on top of OAuth2 that adds identity.

When a user signs in with Google (or Discord):

1. You redirect them to Google auth page.
2. User authenticates and approves.
3. Google redirects to your callback with a short-lived `code`.
4. Your backend exchanges that `code` for tokens.
5. You verify the `id_token`.
6. You extract claims (email, name, picture, `sub`, etc).
7. You create/link a local user.
8. You issue your own session.

---

## Sequence (mental model)

```text
Browser -> Your app: GET http://localhost:3000/auth/{provider}/login
Your app -> Provider: redirect to authorization endpoint (state + nonce + PKCE)
Provider -> Browser: login + consent
Provider -> Your app: GET http://localhost:3000/auth/{provider}/callback?code=...&state=...
Your app -> Provider: token exchange (code -> tokens)
Your app -> Provider JWKS/Issuer: verify id_token signature + claims
Your app -> DB: upsert user/account link
Your app -> Browser: set session cookie, redirect to app
```

Concrete examples:

- Google login start: `http://localhost:3000/auth/google/login`
- Google callback: `http://localhost:3000/auth/google/callback`
- Discord login start: `http://localhost:3000/auth/discord/login`
- Discord callback: `http://localhost:3000/auth/discord/callback`

---

## Go stack recommendation

- `golang.org/x/oauth2`
- `github.com/coreos/go-oidc/v3/oidc`
- Session management: `github.com/alexedwards/scs/v2` (or Gorilla sessions)
- Router: `chi` / `gin` / `echo` (any is fine)

---

## Environment variables you’ll typically need

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URL=http://localhost:3000/auth/google/callback
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URL=http://localhost:3000/auth/discord/callback
APP_BASE_URL=http://localhost:3000
SESSION_SECRET=
```

For production:
- use HTTPS redirect URL
- secure cookie config
- separate secrets per environment

---

## Minimal code example (Go)

> This is intentionally compact to show the core ideas.

```go
package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"os"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

type GoogleAuth struct {
	Provider     *oidc.Provider
	Verifier     *oidc.IDTokenVerifier
	OAuth2Config oauth2.Config
}

func NewGoogleAuth(ctx context.Context) (*GoogleAuth, error) {
	provider, err := oidc.NewProvider(ctx, "https://accounts.google.com")
	if err != nil {
		return nil, err
	}

	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	redirectURL := os.Getenv("GOOGLE_REDIRECT_URL")

	verifier := provider.Verifier(&oidc.Config{ClientID: clientID})

	oauthCfg := oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}

	return &GoogleAuth{Provider: provider, Verifier: verifier, OAuth2Config: oauthCfg}, nil
}

func randomString(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}

func (g *GoogleAuth) LoginHandler(w http.ResponseWriter, r *http.Request) {
	state := randomString(32)
	nonce := randomString(32)

	// Store state + nonce in server session (example uses cookies for brevity only)
	http.SetCookie(w, &http.Cookie{Name: "oidc_state", Value: state, Path: "/", HttpOnly: true, Secure: true, SameSite: http.SameSiteLaxMode})
	http.SetCookie(w, &http.Cookie{Name: "oidc_nonce", Value: nonce, Path: "/", HttpOnly: true, Secure: true, SameSite: http.SameSiteLaxMode})

	url := g.OAuth2Config.AuthCodeURL(
		state,
		oauth2.SetAuthURLParam("nonce", nonce),
	)
	http.Redirect(w, r, url, http.StatusFound)
}

type GoogleClaims struct {
	Subject       string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	Nonce         string `json:"nonce"`
}

func (g *GoogleAuth) CallbackHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	state := r.URL.Query().Get("state")
	code := r.URL.Query().Get("code")

	stateCookie, err := r.Cookie("oidc_state")
	if err != nil || stateCookie.Value == "" || state != stateCookie.Value {
		http.Error(w, "invalid state", http.StatusBadRequest)
		return
	}

	tok, err := g.OAuth2Config.Exchange(ctx, code)
	if err != nil {
		http.Error(w, "token exchange failed", http.StatusUnauthorized)
		return
	}

	rawIDToken, ok := tok.Extra("id_token").(string)
	if !ok {
		http.Error(w, "missing id_token", http.StatusUnauthorized)
		return
	}

	idToken, err := g.Verifier.Verify(ctx, rawIDToken)
	if err != nil {
		http.Error(w, "invalid id_token", http.StatusUnauthorized)
		return
	}

	var claims GoogleClaims
	if err := idToken.Claims(&claims); err != nil {
		http.Error(w, "invalid claims", http.StatusUnauthorized)
		return
	}

	nonceCookie, err := r.Cookie("oidc_nonce")
	if err != nil || claims.Nonce != nonceCookie.Value {
		http.Error(w, "invalid nonce", http.StatusBadRequest)
		return
	}

	if !claims.EmailVerified {
		http.Error(w, "email not verified", http.StatusForbidden)
		return
	}

	// 1) Upsert user/account link in DB:
	//    provider = "google", providerAccountId = claims.Subject
	// 2) Create app session (store local user ID)
	// 3) Redirect to app home

	_ = json.NewEncoder(w).Encode(map[string]any{
		"ok":      true,
		"sub":     claims.Subject,
		"email":   claims.Email,
		"name":    claims.Name,
		"picture": claims.Picture,
	})
}
```

---

## Discord OIDC example (Go)

Discord can be integrated with the exact same architecture. The biggest difference is provider endpoints and claim shape.

```go
type DiscordAuth struct {
	Provider     *oidc.Provider
	Verifier     *oidc.IDTokenVerifier
	OAuth2Config oauth2.Config
}

func NewDiscordAuth(ctx context.Context) (*DiscordAuth, error) {
	provider, err := oidc.NewProvider(ctx, "https://discord.com")
	if err != nil {
		return nil, err
	}

	clientID := os.Getenv("DISCORD_CLIENT_ID")
	clientSecret := os.Getenv("DISCORD_CLIENT_SECRET")
	redirectURL := os.Getenv("DISCORD_REDIRECT_URL")

	verifier := provider.Verifier(&oidc.Config{ClientID: clientID})

	oauthCfg := oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "identify", "email"},
	}

	return &DiscordAuth{Provider: provider, Verifier: verifier, OAuth2Config: oauthCfg}, nil
}

type DiscordClaims struct {
	Subject       string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	Nonce         string `json:"nonce"`
}
```

Reuse the same callback validation steps you use for Google:

1. Validate `state`
2. Exchange `code`
3. Verify `id_token`
4. Validate `nonce`
5. Upsert account as `provider="discord"` and `providerAccountId=sub`
6. Create your app session

---

## Provider differences (Google vs Discord)

- Both support OIDC and return `sub` for stable identity.
- Google commonly uses scopes `openid profile email`.
- Discord commonly uses scopes `openid identify email`.
- Email availability/verification can vary by provider account state, so keep robust linking rules.
- Your account linking logic should stay provider-agnostic: key by `(provider, sub)`.

---

## Unified `AuthProvider` interface (recommended)

If you want to avoid provider-specific handler duplication, define one shared interface and one shared callback pipeline.

```go
type ProviderUser struct {
	Provider      string
	Subject       string
	Email         string
	EmailVerified bool
	Name          string
	Picture       string
	Nonce         string
}

type AuthProvider interface {
	Name() string
	LoginURL(state, nonce string) string
	ExchangeAndVerify(ctx context.Context, code string) (*ProviderUser, error)
}
```

### Shared handlers with full app URLs

```go
// Example routes in your app:
// GET  http://localhost:3000/auth/{provider}/login
// GET  http://localhost:3000/auth/{provider}/callback

func LoginHandler(providers map[string]AuthProvider) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		providerName := chi.URLParam(r, "provider")
		provider, ok := providers[providerName]
		if !ok {
			http.NotFound(w, r)
			return
		}

		state := randomString(32)
		nonce := randomString(32)
		// Store state+nonce+provider in server session.

		http.Redirect(w, r, provider.LoginURL(state, nonce), http.StatusFound)
	}
}

func CallbackHandler(providers map[string]AuthProvider) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		providerName := chi.URLParam(r, "provider")
		provider, ok := providers[providerName]
		if !ok {
			http.NotFound(w, r)
			return
		}

		code := r.URL.Query().Get("code")
		state := r.URL.Query().Get("state")
		_ = state // compare against session-stored state

		user, err := provider.ExchangeAndVerify(r.Context(), code)
		if err != nil {
			http.Error(w, "auth failed", http.StatusUnauthorized)
			return
		}

		// 1) Upsert account by (provider=user.Provider, providerAccountId=user.Subject)
		// 2) Create local app session
		// 3) Redirect to app page (e.g., http://localhost:3000/meal-plan)

		http.Redirect(w, r, "http://localhost:3000/", http.StatusFound)
	}
}
```

This lets Google and Discord differ only in their provider adapter implementation.

---

## `go-oidc` vs `zitadel/oidc`: which one should you use?

Short answer for your migration: start with **`go-oidc` + `oauth2`** unless you specifically need OP/server features.

### Why `go-oidc` is usually the best fit for your case

- You are building a **Relying Party (client app)** that logs in users against Google/Discord.
- `go-oidc` is focused and minimal for this exact job: discovery + ID token verification.
- It composes cleanly with `golang.org/x/oauth2`, which is the standard Go OAuth2 client stack.
- Smaller surface area usually means easier long-term maintenance in app code.

### When `zitadel/oidc` may be better

- You want both **RP and OP capabilities** in one ecosystem.
- You need advanced OIDC/OAuth patterns from their higher-level RP package.
- You’re okay adopting a larger framework-style API for auth.

### Why docs often say “you only need client implementation”

In OIDC terms:

- **RP (Relying Party / client)** = your app that redirects users and verifies returned tokens.
- **OP (OpenID Provider / server)** = Google, Discord, Auth0, ZITADEL, etc.

For your app login migration, you are not becoming an identity provider. So you only need the RP/client side.

---

## Minimal `zitadel/oidc` RP-style example

If you choose it, this is the style you’ll see (based on their `pkg/client/rp` examples):

```go
import (
	"context"
	"net/http"

	"github.com/zitadel/oidc/v3/pkg/client/rp"
	"github.com/zitadel/oidc/v3/pkg/oidc"
)

func wireZitadelRP() {
	issuer := "https://accounts.google.com"
	clientID := "..."
	clientSecret := "..."
	redirectURI := "http://localhost:3000/auth/google/callback"
	scopes := []string{oidc.ScopeOpenID, "profile", "email"}

	provider, _ := rp.NewRelyingPartyOIDC(
		context.Background(),
		issuer,
		clientID,
		clientSecret,
		redirectURI,
		scopes,
	)

	http.Handle("/auth/google/login", rp.AuthURLHandler(func() string { return "state" }, provider))
	http.Handle("/auth/google/callback", rp.CodeExchangeHandler(func(w http.ResponseWriter, r *http.Request, tokens *oidc.Tokens[*oidc.IDTokenClaims], state string, rp rp.RelyingParty) {
		// map claims -> local user -> create session
	}, provider))
}
```

If this style feels productive to you, `zitadel/oidc` is a valid choice. If you prefer explicit, low-magic building blocks, use `go-oidc` + `oauth2`.

---

## Mapping to your current schema mindset

From your existing auth model (User + Account), keep the same concept:

- `User`: your app user profile and roles.
- `Account`: provider link (`provider`, `providerAccountId`, tokens metadata).

For Google/Discord OIDC:

- `provider` = `google` or `discord`
- `providerAccountId` = claim `sub` (stable provider user identifier)

### Important

Do **not** use email as the primary provider identity key.
Email can change; `sub` is the stable identity claim.

---

## Account linking strategy (recommended)

When user signs in via any provider:

1. Find account by (`provider=<provider>`, `providerAccountId=sub`).
2. If exists → log in linked user.
3. If not exists:
   - If `email_verified=true` and local user with same email exists, link account.
   - Else create new user and link account.

This mirrors what people commonly rely on with NextAuth account linking.

---

## Security checklist (must-have)

- Validate `state` (CSRF).
- Validate `nonce` (token replay/session mixup).
- Validate `iss`, `aud`, `exp` via ID token verifier.
- Use strict cookies: `HttpOnly`, `Secure`, `SameSite=Lax`.
- Rotate session on login.
- Add rate limiting on auth routes.
- Log auth events (login success/fail, account linked).

---

## PKCE note

PKCE is mandatory for public clients and still strongly recommended for confidential web apps. Add it unless there’s a specific reason not to.

---

## Common migration pitfalls

- Assuming OAuth token == authenticated app user (you still need local session).
- Not persisting provider `sub`.
- Skipping `state`/`nonce` checks.
- Using access token to identify user instead of ID token.
- Forgetting exact callback URL match in Google Cloud Console.

---

## External docs (good starting points)

- OpenID Connect Core: https://openid.net/specs/openid-connect-core-1_0.html
- OAuth 2.0 (RFC 6749): https://datatracker.ietf.org/doc/html/rfc6749
- PKCE (RFC 7636): https://datatracker.ietf.org/doc/html/rfc7636
- Google OpenID Connect docs: https://developers.google.com/identity/openid-connect/openid-connect
- Discord OAuth2 / OIDC docs: https://discord.com/developers/docs/topics/oauth2
- go-oidc package: https://github.com/coreos/go-oidc
- oauth2 package: https://pkg.go.dev/golang.org/x/oauth2

Prisma/DB migration references:
- Prisma config reference: https://www.prisma.io/docs/orm/reference/prisma-config-reference
- Prisma relation modeling: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations

---

## Suggested incremental migration plan

1. Build Go auth service with credentials login + sessions.
2. Add Google + Discord OIDC login and callback.
3. Implement account linking using provider `sub`.
4. Keep existing frontend temporarily; call Go auth endpoints.
5. Once stable, migrate the rest of UI/backend pieces.

---

## Final thought

You’re not blocked by auth migration—you just need to make each implicit NextAuth behavior explicit in Go:

- identity verification
- account linking
- session creation
- route protection

Once those are in place, the rest of your app migration is mostly standard backend/frontend porting work.
