import { v2 as cloudinary } from 'cloudinary'

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('CLOUDINARY_CLOUD_NAME is not set')
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('CLOUDINARY_API_KEY is not set')
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET is not set')
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

function toDataUri(image: File, buffer: Buffer) {
  return 'data:' + image.type + ';base64,' + buffer.toString('base64')
}

export async function uploadImage(image: File) {
  const buffer = Buffer.from(await image.arrayBuffer())
  const result = await cloudinary.uploader.upload(toDataUri(image, buffer), {
    folder: 'chefsito-space-recipes',
    transformation: [
      { quality: 60 },
      { fetch_format: "webp" },
    ]
  })
  return result.secure_url
}

export function extractPublicId(cloudinaryUrl: string): string | null {
  const match = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(chefsito-space-recipes\/.+?)(?:\.\w+)?$/)
  return match?.[1] ?? null
}

export async function replaceImage(image: File, existingUrl: string) {
  const publicId = extractPublicId(existingUrl)
  const buffer = Buffer.from(await image.arrayBuffer())

  if (publicId) {
    const result = await cloudinary.uploader.upload(toDataUri(image, buffer), {
      public_id: publicId,
      overwrite: true,
      invalidate: true,
      transformation: [
        { quality: 60 },
        { fetch_format: "webp" },
      ]
    })
    return result.secure_url
  }

  return uploadImage(image)
}
