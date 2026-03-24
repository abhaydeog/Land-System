import { useState, useEffect } from 'react'
import api from '../api/axios'
import { LoadingPage, PageHeader, StatCard } from '../components/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function ReportsPage() {
  const [monthly, setMonthly]     = useState([])
  const [officers, setOfficers]   = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reports/monthly'),
      api.get('/reports/officer-performance'),
    ])
      .then(([m, o]) => { setMonthly(m.data.data); setOfficers(o.data.data) })
      .catch(() => toast.error('Reports load nahi hui'))
      .finally(() => setLoading(false))
  }, [])

  const exportCSV = (data, filename) => {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const rows    = data.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))
    const csv     = [headers.join(','), ...rows].join('\n')
    const a       = document.createElement('a')
    a.href        = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download    = filename
    a.click()
    toast.success('CSV download ho rahi hai')
  }

  const totalResolved = monthly.reduce((s, r) => s + +r.resolved, 0)
  const totalComplaints = monthly.reduce((s, r) => s + +r.total, 0)
  const overallRate = totalComplaints ? Math.round(totalResolved / totalComplaints * 100) : 0

  if (loading) return <LoadingPage />

  return (
    <div>
      <PageHeader title="Reports Aur Vishleshan" subtitle="Pichle 12 mahinon ka data">
        <button onClick={() => exportCSV(monthly, 'monthly_report.csv')} className="btn btn-sm">
          ⬇ Monthly CSV
        </button>
        <button onClick={() => window.print()} className="btn btn-sm">🖨 Print</button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard label="Kul Shikayaten (12 maah)" value={totalComplaints} icon="📁" color="blue" />
        <StatCard label="Nipatara (12 maah)"        value={totalResolved}   icon="✅" color="green" />
        <StatCard label="Nipatara Dar"               value={`${overallRate}%`} icon="📊" color={overallRate >= 70 ? 'green' : 'amber'} />
        <StatCard label="Active Officers"            value={officers.filter(o => o.active > 0).length} icon="👤" color="neutral" />
      </div>

      {/* Monthly Chart */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="card-title">Maasik Shikayat Pravah</div>
            <div className="text-xs text-gray-400">Har maah ki darj aur nipatara shikayaten</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={[...monthly].reverse()} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month_label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="total"    name="Darj"    fill="#3a7fc1" radius={[3,3,0,0]} />
            <Bar dataKey="resolved" name="Nipatara" fill="#2d7d46" radius={[3,3,0,0]} />
            <Bar dataKey="escalated" name="Escalated" fill="#b03030" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Officer Performance Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="card-title">Officer Performance Report</div>
            <div className="text-xs text-gray-400">Har officer ki karyakshamta</div>
          </div>
          <button onClick={() => exportCSV(officers, 'officer_performance.csv')} className="btn btn-sm">⬇ Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Officer','Zila','Total Niyukt','Nipatara','Active','Nipatara Dar','Avg Din'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {officers.map((o, i) => {
                const rate = parseFloat(o.resolution_rate) || 0
                const rateColor = rate >= 80 ? 'text-success' : rate >= 60 ? 'text-accent' : 'text-danger'
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{o.name}</td>
                    <td className="px-4 py-3 text-gray-500">{o.district}</td>
                    <td className="px-4 py-3 text-gray-600">{o.total_assigned}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-success-light text-success">{o.resolved}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-primary-light text-primary">{o.active}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${rate >= 80 ? 'bg-success' : rate >= 60 ? 'bg-accent' : 'bg-danger'}`}
                            style={{ width: `${rate}%` }} />
                        </div>
                        <span className={`font-semibold ${rateColor}`}>{rate}%</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${parseFloat(o.avg_days) <= 14 ? 'text-success' : 'text-danger'}`}>
                      {o.avg_days ? `${o.avg_days}d` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Detail Table */}
      <div className="card mt-5">
        <div className="flex items-center justify-between mb-4">
          <div className="card-title">Maasik Vivaran</div>
          <button onClick={() => exportCSV(monthly, 'monthly_detail.csv')} className="btn btn-sm">⬇ CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Maah','Darj','Nipatara','Escalated','Avg Din','Nipatara Dar'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthly.map((m, i) => {
                const rate = m.total ? Math.round(m.resolved / m.total * 100) : 0
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-800">{m.month_label}</td>
                    <td className="px-4 py-2.5 text-gray-600">{m.total}</td>
                    <td className="px-4 py-2.5 text-success font-medium">{m.resolved}</td>
                    <td className="px-4 py-2.5 text-danger">{m.escalated || 0}</td>
                    <td className="px-4 py-2.5 text-gray-500">{m.avg_days ? `${m.avg_days}d` : '—'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="font-medium text-gray-600">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
