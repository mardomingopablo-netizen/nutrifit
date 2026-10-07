'use client'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

// Escáner de código de barras con la cámara (ZXing). Llama a onDetected(code)
// con el primer código leído. Funciona en Chrome y en Safari de iOS.
export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    let reader = null

    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        reader = new BrowserMultiFormatReader()
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current,
          (result) => {
            if (result && !cancelled) {
              const code = result.getText()
              controls.stop()
              onDetected(code)
            }
          }
        )
        controlsRef.current = controls
        if (cancelled) controls.stop()
      } catch (e) {
        if (!cancelled) {
          setError(
            e?.name === 'NotAllowedError'
              ? 'Permiso de cámara denegado. Actívalo para escanear.'
              : 'No se pudo abrir la cámara. Escribe el código a mano.'
          )
        }
      }
    }
    start()

    return () => {
      cancelled = true
      try { controlsRef.current?.stop() } catch {}
    }
  }, [onDetected])

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden">
      <video ref={videoRef} className="w-full max-h-72 object-cover" playsInline muted />
      {/* Overlay guide */}
      {!error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-24 border-2 border-emerald-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
        </div>
      )}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl transition-colors"
      >
        <X size={16} />
      </button>
      {error ? (
        <div className="absolute bottom-0 inset-x-0 bg-red-500/90 text-white text-xs text-center py-2 px-3">{error}</div>
      ) : (
        <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-2">
          Apunta al código de barras
        </div>
      )}
    </div>
  )
}
