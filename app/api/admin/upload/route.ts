import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { isAdminEmail } from "@/lib/admin"

const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "blog-images"
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

type ImageConfig = {
  extensions: string[]
  matches: (buffer: Buffer) => boolean
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const
type AllowedMimeType = (typeof ALLOWED_IMAGE_TYPES)[number]

const ALLOWED_IMAGES: Record<AllowedMimeType, ImageConfig> = {
  "image/jpeg": {
    extensions: ["jpg", "jpeg"],
    matches: (buffer: Buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  "image/png": {
    extensions: ["png"],
    matches: (buffer: Buffer) =>
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a,
  },
  "image/gif": {
    extensions: ["gif"],
    matches: (buffer: Buffer) =>
      buffer.length >= 6 &&
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38 &&
      (buffer[4] === 0x37 || buffer[4] === 0x39) &&
      buffer[5] === 0x61,
  },
  "image/webp": {
    extensions: ["webp"],
    matches: (buffer: Buffer) =>
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50,
  },
}

function isAllowedMimeType(contentType: string): contentType is AllowedMimeType {
  return ALLOWED_IMAGE_TYPES.includes(contentType as AllowedMimeType)
}

function getSafeImageMetadata(file: File, buffer: Buffer): { contentType: AllowedMimeType; extension: string } | null {
  const contentType = file.type.toLowerCase()
  const extension = file.name.split(".").pop()?.toLowerCase()

  if (!isAllowedMimeType(contentType) || !extension) {
    return null
  }

  const imageConfig = ALLOWED_IMAGES[contentType]

  if (!imageConfig.extensions.includes(extension) || !imageConfig.matches(buffer)) {
    return null
  }

  return { contentType, extension }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Storage client not configured" }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const imageMetadata = getSafeImageMetadata(file, buffer)

  if (!imageMetadata) {
    return NextResponse.json({ error: "Only valid JPEG, PNG, GIF, and WebP images are allowed" }, { status: 400 })
  }

  const filename = `${randomUUID()}.${imageMetadata.extension}`
  const filePath = `posts/${filename}`

  const { error: uploadError } = await supabaseAdmin.storage.from(bucketName).upload(filePath, buffer, {
    contentType: imageMetadata.contentType,
    upsert: false,
  })

  if (uploadError) {
    console.error("Failed to upload image", uploadError)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath)

  if (!data?.publicUrl) {
    return NextResponse.json({ error: "Could not retrieve public URL" }, { status: 500 })
  }

  return NextResponse.json({ url: data.publicUrl, path: filePath })
}
