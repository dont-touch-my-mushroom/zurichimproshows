'use server'

import { Storage } from '@google-cloud/storage'
import sharp from 'sharp'

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
})

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || 'zurichshows-images'
const bucket = storage.bucket(bucketName)

/**
 * Resize an image and maintain aspect ratio with max width of 700px
 */
async function resizeImage(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata()
  
  // If image is already smaller than 700px, no need to resize
  if (metadata.width && metadata.width <= 700) {
    return imageBuffer
  }
  
  return sharp(imageBuffer)
    .resize({
      width: 700,
      withoutEnlargement: true,
      fit: 'inside',
    })
    .toBuffer()
}

/**
 * Server action to upload a file to Google Cloud Storage
 */
export async function uploadImageAction(formData: FormData): Promise<{ status: string; url?: string; message?: string }> {
  try {
    const file = formData.get('file') as File
    
    if (!file) {
      return {
        status: 'error',
        message: 'No file provided',
      }
    }
    
    // Verify that the file is an image
    if (!file.type.startsWith('image/')) {
      return {
        status: 'error',
        message: 'File must be an image',
      }
    }
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Resize the image
    const resizedBuffer = await resizeImage(buffer)
    
    // Generate a unique filename
    const timestamp = Date.now()
    const originalFilename = file.name
    const directory = formData.get('directory') as string || 'show-posters'
    const fileName = `${directory}/${timestamp}-${originalFilename.replace(/\s+/g, '-')}`
    
    // Create a new blob in the bucket
    const blob = bucket.file(fileName)
    
    // Upload the resized image buffer
    await blob.save(resizedBuffer, {
      metadata: {
        contentType: file.type,
      },
    })
    
    // Return the public URL
    return {
      status: 'success',
      url: `https://storage.googleapis.com/${bucketName}/${fileName}`,
    }
  } catch (error) {
    console.error('Error uploading file to Google Cloud Storage:', error)
    return {
      status: 'error',
      message: 'Failed to upload file to Google Cloud Storage',
    }
  }
} 