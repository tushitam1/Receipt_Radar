import { useEffect, useState } from 'react'
import Card from './Card'

function Body({ refreshKey }) {
  const [stats, setStats] = useState({
    total: 0,
    approvedCount: 0,
    suspiciousCount: 0,
    fraudCount: 0,
  })
  const [logs, setLogs] = useState([])

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('http://localhost:3000/api/receipts/logs')
        if (!res.ok) return
        const data = await res.json()
        setStats({
          total: data.total || 0,
          approvedCount: data.approvedCount || 0,
          suspiciousCount: data.suspiciousCount || 0,
          fraudCount: data.fraudCount || 0,
        })
        setLogs(Array.isArray(data.logs) ? data.logs : [])
      } catch (err) {
        console.error('Failed to fetch logs', err)
      }
    }

    fetchLogs()
  }, [refreshKey])

  const fraudRate =
    stats.total > 0
      ? Math.round(((stats.suspiciousCount + stats.fraudCount) / stats.total) * 100)
      : 0

  return (
    <div className="h-full bg-slate-200 rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
      {/* Top: summary cards */}
      <div className="flex-1 rounded-md border border-slate-300 p-4">
        <div className="grid grid-cols-4 gap-4 h-full">
          <Card className="bg-emerald-500 h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-xs uppercase tracking-wide">Total scans</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </Card>
          <Card className="bg-sky-500 h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-xs uppercase tracking-wide">Approved</div>
              <div className="text-2xl font-bold">{stats.approvedCount}</div>
            </div>
          </Card>
          <Card className="bg-amber-500 h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-xs uppercase tracking-wide">Suspicious</div>
              <div className="text-2xl font-bold">{stats.suspiciousCount}</div>
            </div>
          </Card>
          <Card className="bg-rose-500 h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-xs uppercase tracking-wide">Fraud rate</div>
              <div className="text-2xl font-bold">{fraudRate}%</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Middle: pie chart for approved / suspicious / fraud */}
      <div className="flex-3 bg-white/60 rounded-md border border-slate-300 p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Scans overview</h2>
        {stats.total === 0 ? (
          <p className="text-xs text-slate-400">
            Pie chart will appear after the first scan is completed.
          </p>
        ) : (
          <div className="flex items-center gap-8">
            {/* Pie chart using conic-gradient */}
            <div
              className="w-32 h-32 rounded-full border border-slate-200 relative"
              style={{
                background: `conic-gradient(
                  #22c55e 0 ${(stats.approvedCount / stats.total) * 100}%,
                  #fbbf24 ${(stats.approvedCount / stats.total) * 100}% ${
                    ((stats.approvedCount + stats.suspiciousCount) / stats.total) * 100
                  }%,
                  #ef4444 ${
                    ((stats.approvedCount + stats.suspiciousCount) / stats.total) * 100
                  }% 100%
                )`,
              }}
            >
              <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                <span className="text-xs text-slate-600 text-center">
                  {stats.total} scans
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
                <span>
                  Approved:{' '}
                  <span className="font-medium">
                    {stats.approvedCount} (
                    {Math.round((stats.approvedCount / stats.total) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm bg-amber-500" />
                <span>
                  Suspicious:{' '}
                  <span className="font-medium">
                    {stats.suspiciousCount} (
                    {Math.round((stats.suspiciousCount / stats.total) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm bg-rose-500" />
                <span>
                  Fraud:{' '}
                  <span className="font-medium">
                    {stats.fraudCount} (
                    {Math.round((stats.fraudCount / stats.total) * 100)}%)
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom: recent scans log */}
      <div className="flex-3 bg-white/60 rounded-md border border-slate-300 p-4 overflow-auto">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Recent scans</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400">No scans yet.</p>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="text-slate-500">
              <tr>
                <th className="py-1 pr-2">Time</th>
                <th className="py-1 pr-2">File</th>
                <th className="py-1 pr-2">Size (MB)</th>
                <th className="py-1 pr-2">Fraud?</th>
                <th className="py-1 pr-2">Score</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-1 pr-2 whitespace-nowrap">
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleString()
                      : ''}
                  </td>
                  <td className="py-1 pr-2 truncate max-w-[150px]" title={log.originalName}>
                    {log.originalName}
                  </td>
                  <td className="py-1 pr-2">
                    {log.sizeInMB != null ? log.sizeInMB.toFixed(2) : '-'}
                  </td>
                  <td className="py-1 pr-2">
                    {log.fraud && log.fraud.isFraudSuspected ? 'Yes' : 'No'}
                  </td>
                  <td className="py-1 pr-2">
                    {log.fraud && log.fraud.score != null
                      ? Math.round(log.fraud.score * 100)
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Body