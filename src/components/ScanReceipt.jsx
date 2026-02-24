import { useCallback, useState } from 'react'

function ScanReceipt({ onScanComplete }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [fraudResult, setFraudResult] = useState(null)
  const [fileInfo, setFileInfo] = useState(null)

  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage('')
      setFraudResult(null)
      setFileInfo(null)

      const formData = new FormData()
      formData.append('receipt', file)

      const res = await fetch('http://localhost:3000/api/receipts/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        console.error('Upload failed')
        setError('Upload failed')
        return
      }

      const data = await res.json()
      setSuccessMessage(data.message || 'Upload successful')
      if (data.fraud) {
        setFraudResult(data.fraud)
      }
      if (data.originalName || data.sizeInMB) {
        setFileInfo({
          name: data.originalName,
          sizeInMB: data.sizeInMB,
        })
      }
      if (typeof onScanComplete === 'function') {
        onScanComplete()
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload error, please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="h-full bg-slate-200 rounded-lg border border-slate-200 shadow-sm p-6 relative">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Scan receipt for fraud detection
      </h1>
      <h2 className="text-sm text-slate-600 mb-4">
        Upload a receipt to analyze (file metadata + OCR-based fraud heuristics)
      </h2>

      {error && (
        <p className="mb-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {successMessage && (
        <p className="mb-2 text-sm text-emerald-600">
          {successMessage}
        </p>
      )}

      <div className="mt-4 flex h-[70%] gap-4">
        <div className="flex-[3] bg-white rounded-lg border border-slate-300 shadow-sm p-4">
          <div className="h-full flex flex-col gap-4">
            <div className="flex-1 border-2 border-dashed border-slate-400 rounded-lg bg-white/70 flex items-center justify-center">
              <label className="px-4 py-2 rounded-md bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer">
                {isLoading ? 'Uploading…' : 'Upload receipt'}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
            </div>
            <div className="flex-1 bg-white rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
              {fileInfo ? (
                <div>
                  <p className="font-semibold mb-1">Uploaded file</p>
                  <p className="mb-1">
                    Name:{' '}
                    <span className="font-medium">{fileInfo.name || '(unknown)'}</span>
                  </p>
                  {fileInfo.sizeInMB != null && (
                    <p>
                      Size:{' '}
                      <span className="font-medium">
                        {fileInfo.sizeInMB.toFixed(2)} MB
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-slate-400">
                  File details will appear here after a successful upload.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-[1] bg-white rounded-lg border border-slate-300 shadow-sm p-4 text-sm text-slate-700">
          {fraudResult ? (
            <div>
              <p className="font-semibold mb-2">Fraud analysis</p>
              <p className="mb-1">
                Fraud suspected:{' '}
                <span
                  className={fraudResult.isFraudSuspected ? 'text-red-600' : 'text-emerald-600'}
                >
                  {fraudResult.isFraudSuspected ? 'Yes' : 'No'}
                </span>
              </p>
              {'score' in fraudResult && (
                <p className="mb-1">
                  Score:{' '}
                  <span className="font-medium">
                    {(fraudResult.score * 100).toFixed(0)} / 100
                  </span>
                </p>
              )}
              {fraudResult.reasons?.length > 0 && (
                <ul className="list-disc list-inside mt-1 text-sm">
                  {fraudResult.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <span className="text-slate-400">
              Fraud score and explanation will appear here after upload.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScanReceipt