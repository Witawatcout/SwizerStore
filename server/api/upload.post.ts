import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const file = formData[0]
  if (!file.filename || !file.data) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file' })
  }

  // ตรวจสอบ type ให้เป็นรูปภาพเท่านั้น
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type || '')) {
    throw createError({ statusCode: 400, statusMessage: 'Only JPG, PNG and WebP image files are allowed' })
  }

  const maxFileSize = 5 * 1024 * 1024
  if (file.data.length > maxFileSize) {
    throw createError({ statusCode: 400, statusMessage: 'Image file must not exceed 5MB' })
  }

  // สร้างชื่อไฟล์แบบ unique
  const ext = file.filename.split('.').pop() || 'png'
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

  // บันทึกไฟล์ลงโฟลเดอร์ uploads ด้านนอกสุด
  const uploadDir = join(process.cwd(), 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, uniqueName), file.data)

  // ส่ง URL กลับ
  return {
    success: true,
    url: `/uploads/${uniqueName}`,
    filename: uniqueName
  }
})
