// แปลงไฟล์รูปจากเครื่องเป็น data URL ที่ย่อขนาดแล้ว (เก็บลง db.json ได้โดยไม่บวมเกินไป)
const MAX_FILE_MB = 8

export function fileToResizedDataUrl(file, maxSize = 640, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('กรุณาเลือกไฟล์รูปภาพเท่านั้น'))
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      return reject(new Error(`ไฟล์ใหญ่เกิน ${MAX_FILE_MB} MB`))
    }

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff' // PNG โปร่งใส -> พื้นขาว เพราะเก็บเป็น JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('เปิดไฟล์รูปนี้ไม่ได้'))
    }
    img.src = url
  })
}
