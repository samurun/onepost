import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST() {
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const apiKey = process.env.CLOUDINARY_API_KEY
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME

  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 500 }
    )
  }

  const timestamp = Math.round(Date.now() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "onepost" },
    apiSecret
  )

  return NextResponse.json({
    signature,
    timestamp,
    folder: "onepost",
    apiKey,
    cloudName,
  })
}
