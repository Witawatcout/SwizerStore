import { createReadStream, statSync } from 'fs'
import { join } from 'path'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }

  // อ่านไฟล์จากโฟลเดอร์ uploads ด้านนอกสุดของโปรเจกต์
  const filePath = join(process.cwd(), 'uploads', slug)
  
  try {
    const stats = statSync(filePath)
    if (stats.isFile()) {
      // Set cache-control headers for production optimization
      setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
      
      return sendStream(event, createReadStream(filePath))
    }
  } catch (e) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }
})
