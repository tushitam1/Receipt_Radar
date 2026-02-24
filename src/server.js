import express from 'express'
import cors from 'cors'
import multer from 'multer'
import Tesseract from 'tesseract.js'

const app = express()

// Allow all origins during development so Vite (5173/5174) can reach the API
app.use(cors())

// Configure Multer to store files in ./uploads with random names
const upload = multer({ dest: 'uploads/' })

// In-memory log of recent scans
const recentScans = []
const MAX_LOGS = 50

// Upload endpoint: receive actual file, run OCR when possible, return fraud metadata
app.post('/api/receipts/upload', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const reasons = []
    let score = 0.1

    // ---- Metadata-based checks ----
    const sizeInMB = req.file.size / (1024 * 1024)
    if (sizeInMB > 5) {
      score += 0.5
      reasons.push(`File is large (${sizeInMB.toFixed(2)} MB)`)
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff']
    const originalName = req.file.originalname || ''
    const lowerName = originalName.toLowerCase()

    if (!allowedExtensions.some((ext) => lowerName.endsWith(ext))) {
      score += 0.3
      reasons.push('File extension is unusual for a receipt')
    }

    // ---- OCR with tesseract.js for image files only ----
    let ocrText = ''
    let ocrNote = ''
    if (imageExtensions.some((ext) => lowerName.endsWith(ext))) {
      try {
        const result = await Tesseract.recognize(req.file.path, 'eng')
        ocrText = result.data && result.data.text ? result.data.text : ''
      } catch (err) {
        console.error('OCR error:', err)
        ocrNote = 'OCR failed'
      }
    } else {
      ocrNote = 'OCR is only run for image files (jpg, png, bmp, tiff).'
    }

    // ---- OCR-based checks on extracted text ----
    if (ocrText) {
      const lowerText = ocrText.toLowerCase()

      // If it doesn't look like a receipt structurally
      if (!/total|subtotal|tax/.test(lowerText)) {
        score += 0.3
        reasons.push(
          'OCR text does not contain typical receipt terms like "total", "subtotal", or "tax".',
        )
      }

      // Try to extract a numeric "total"
      const totalMatch = ocrText.match(/total\s*[:-]?\s*\$?\s*([\d,.]+)/i)
      if (totalMatch) {
        const totalValue = parseFloat(totalMatch[1].replace(/,/g, ''))
        if (!Number.isNaN(totalValue) && totalValue > 1000) {
          score += 0.4
          reasons.push(`High total amount detected in OCR text: ${totalValue}`)
        }
      }
    }

    // Normalize score to 0–1 and convert to percentage
    const normalizedScore = Math.min(score, 1)
    const riskPercent = Math.round(normalizedScore * 100)

    // Classification based on requested thresholds
    // < 30   -> approved
    // 30–50  -> suspicious
    // > 50   -> fraud
    let status = 'approved'
    if (riskPercent >= 30 && riskPercent <= 50) {
      status = 'suspicious'
    } else if (riskPercent > 50) {
      status = 'fraud'
    }

    const isFraudSuspected = status !== 'approved'

    const fraud = {
      status,          // 'approved' | 'suspicious' | 'fraud'
      isFraudSuspected,
      score: normalizedScore,
      riskPercent,
      reasons: reasons.length
        ? reasons
        : ['No strong fraud indicators found from metadata or OCR text.'],
    }

    // Log this scan in memory
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      originalName,
      sizeInMB: Number(sizeInMB.toFixed(2)),
      fraud,
    }
    recentScans.unshift(logEntry)
    if (recentScans.length > MAX_LOGS) {
      recentScans.pop()
    }

    return res.json({
      message: 'File uploaded successfully',
      originalName,
      sizeInMB: Number(sizeInMB.toFixed(2)),
      fraud,
      ocrText,
      ocrNote,
    })
  } catch (err) {
    console.error('Upload handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Endpoint to fetch recent scans and summary stats
app.get('/api/receipts/logs', (_req, res) => {
  const total = recentScans.length
  const suspiciousCount = recentScans.filter(
    (scan) => scan.fraud && scan.fraud.status === 'suspicious',
  ).length
  const fraudCount = recentScans.filter(
    (scan) => scan.fraud && scan.fraud.status === 'fraud',
  ).length
  const approvedCount = total - suspiciousCount - fraudCount

  res.json({
    total,
    suspiciousCount,
    fraudCount,
    approvedCount,
    logs: recentScans,
  })
})

app.listen(3000, () => {
  console.log('API listening on http://localhost:3000')
})