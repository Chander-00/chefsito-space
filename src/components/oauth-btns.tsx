import SocialButton from "./btns/social-button";
import DiscordIcon from "./icons/discord";
import GoogleIcon from "./icons/google";
import GithubIcon from "./icons/twitter";

export default function OauthButtons() {
  return (
    <div className="mt-6 flex justify-start space-x-6">
      <SocialButton providerName="google" icon={<GoogleIcon />} />

      <SocialButton providerName="github" icon={<GithubIcon />} />

      <SocialButton providerName="discord" icon={<DiscordIcon />} />
    </div>
  );
}
