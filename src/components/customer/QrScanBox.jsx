import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { api } from '../../services/api'

function extractTableCode(rawValue) {
  const trimmed = (rawValue || '').trim()
  if (!trimmed) return ''
  try {
    const url = new URL(trimmed)
    const fromParam = url.searchParams.get('table')
    if (fromParam) return fromParam.trim()
  } catch {
    // ไม่ใช่ URL ให้ใช้รหัสโต๊ะตรงๆ
  }
  return trimmed
}

export default function QrScanBox({ onScan, disabled = false }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const scannedRef = useRef(false)

  const [tables, setTables] = useState([])
  const [scanning, setScanning] = useState(false)
  const [camError, setCamError] = useState('')
  const [camInfo, setCamInfo] = useState('')

  useEffect(() => {
    let alive = true
    api
      .getTables()
      .then((list) => alive && setTables(list.slice(0, 3)))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const stopCamera = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    scannedRef.current = false
    setScanning(false)
    setCamInfo('')
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  const triggerScan = (rawValue) => {
    if (disabled || scannedRef.current) return
    const code = extractTableCode(rawValue)
    if (!code) return
    scannedRef.current = true
    stopCamera()
    onScan?.(code)
  }

  const startScanLoop = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { willReadFrequently: true })

    const tick = () => {
      const video = videoRef.current
      if (!video || !streamRef.current || !canvas || !ctx) return

      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const result = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        })
        if (result?.data) {
          triggerScan(result.data)
          return
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (!scanning || !videoRef.current || !streamRef.current) return
    let cancelled = false
    const video = videoRef.current
    video.srcObject = streamRef.current

    video
      .play()
      .then(() => {
        if (cancelled) return
        setCamInfo(video.srcObject?.getVideoTracks()?.[0]?.label || 'เปิดกล้องแล้ว')
        startScanLoop()
      })
      .catch(() => {
        if (!cancelled) {
          setCamError('เบราว์เซอร์ไม่สามารถเล่นภาพจากกล้องได้อัตโนมัติ')
        }
      })

    return () => {
      cancelled = true
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [scanning])

  const startCamera = async () => {
    if (disabled) return
    setCamError('')
    setCamInfo('')
    scannedRef.current = false

    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError('เบราว์เซอร์นี้ไม่รองรับการเปิดกล้อง สามารถใช้ปุ่มจำลองด้านล่างได้')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      setScanning(true)
    } catch (err) {
      stopCamera()
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCamError('ไม่ได้รับอนุญาตให้เข้าถึงกล้อง กรุณาอนุญาตการใช้กล้องหรือใช้ปุ่มจำลองด้านล่าง')
      } else if (err?.name === 'NotFoundError') {
        setCamError('ไม่พบกล้องบนอุปกรณ์นี้ สามารถใช้ปุ่มจำลองด้านล่างได้')
      } else {
        setCamError('ไม่สามารถเปิดกล้องได้ กรุณาลองใหม่หรือใช้ปุ่มจำลองด้านล่าง')
      }
    }
  }

  return (
    <div className="qr-box">
      {!scanning ? (
        <button
          type="button"
          className="go"
          disabled={disabled}
          onClick={startCamera}
        >
          สแกน QR เพื่อเปิดกล้อง
        </button>
      ) : (
        <div className="camera-wrap">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{
              display: 'block',
              width: '100%',
              minHeight: 220,
              maxHeight: 300,
              objectFit: 'cover',
              background: '#111',
              borderRadius: 6,
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <p className="or">
            กำลังสแกน QR Code... หันกล้องไปที่ QR ประจำโต๊ะ
          </p>
          <button type="button" className="go" onClick={stopCamera}>
            ปิดกล้อง
          </button>
        </div>
      )}

      {camError && (
        <p role="alert" className="field-error">
          {camError}
        </p>
      )}

      {tables.length > 0 && (
        <>
          <p className="or">หรือจำลองการสแกน QR Code ประจำโต๊ะ</p>
          <div className="qr-list">
            {tables.map((t) => (
              <button
                key={t.id}
                type="button"
                className="qr-btn"
                disabled={disabled}
                onClick={() => triggerScan(t.id)}
              >
                สแกนโต๊ะ {t.id}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}