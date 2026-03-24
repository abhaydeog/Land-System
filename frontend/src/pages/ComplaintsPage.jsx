import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { StatusBadge, PriorityBadge, LoadingPage, PageHeader, Pagination, EmptyState } from '../components/ui'
import { Search, Download } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const DISTRICTS = ['Dumka','Deoghar','Godda','Sahibganj','Pakur','Jamtara','Dhanbad','Ranchi']
const STATUSES  = ['Nayi','Niyukt','Vichaaradheen','Nipatara','Viprit']
const TYPES     = ['Seema Vivad','Naap-Jokh Galat','Daakhal / Kabza','Naksha Sudhar','Vanshanusar Haqqum','Anya']

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [filters, setFilters]       = useState({ search: '', status: '', district: '', type: '', page: 1 })
  const navigate = useNavigate()

  const set = (k, v) => setFilters(p => ({ ...p, [k]: v, page: 1 }))

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      const { data } = await api.get('/complaints', { params })
      setComplaints(data.data)
      setPagination(data.pagination)
    } catch {
      toast.error('Data load nahi hua')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const t = setTimeout(fetchComplaints, 300)
    return () => clearTimeout(t)
  }, [fetchComplaints])

  const exportCSV = () => {
    const headers = ['ID','Naam','Prakar','Khasra','Zila','Officer','Tarikh','Status','Praathamikta']
    const rows = complaints.map(c => [
      c.complaint_no, c.complainant_name, c.complaint_type, c.khasra,
      c.district, c.officer_name || '—',
      c.created_at ? format(new Date(c.created_at), 'dd MMM yyyy') : '—',
      c.status, c.priority
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `shikayaten_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    toast.success('CSV download ho rahi hai')
  }

  return (
    <div>
      <PageHeader title="Shikayat Suchi" subtitle={`${pagination?.total || 0} shikayaten mili`}>
        <button onClick={exportCSV} className="btn btn-sm gap-1.5"><Download size={13} /> CSV</button>
        <button onClick={() => navigate('/complaints/new')} className="btn btn-primary btn-sm">+ Nayi Shikayat</button>
      </PageHeader>

      {/* Filters */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-52 max-w-72">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="form-control pl-8 text-xs"
            placeholder="ID, naam, ya khasra se khojein..."
            value={filters.search}
            onChange={e => set('search', e.target.value)}
          />
        </div>
        {[
          { key: 'status',   opts: STATUSES,  ph: 'Sab Status'   },
          { key: 'district', opts: DISTRICTS, ph: 'Sab Zile'     },
          { key: 'type',     opts: TYPES,     ph: 'Sab Prakar'   },
        ].map(({ key, opts, ph }) => (
          <select key={key} value={filters[key]} onChange={e => set(key, e.target.value)}
            className="form-control w-auto text-xs">
            <option value="">{ph}</option>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <LoadingPage /> : (
          <>
            {!complaints.length ? <EmptyState message="Koi shikayat nahi mili" icon="📭" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Shikayat ID','Shikayatakarta','Prakar','Khasra','Zila','Officer','Tarikh','Priority','Status','Karvayi'].map(h => (
                        <th key={h} className="px-3.5 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-primary-light/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/complaints/${c.id}`)}>
                        <td className="px-3.5 py-2.5">
                          <span className="font-mono text-[11px] font-semibold text-primary bg-primary-light px-1.5 py-0.5 rounded">{c.complaint_no}</span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <div className="font-medium text-gray-800">{c.complainant_name}</div>
                          <div className="text-gray-400 text-[10px]">{c.mobile}</div>
                        </td>
                        <td className="px-3.5 py-2.5 text-gray-500 max-w-28 truncate">{c.complaint_type}</td>
                        <td className="px-3.5 py-2.5 font-mono text-[11px] text-gray-600">{c.khasra}</td>
                        <td className="px-3.5 py-2.5 text-gray-500">{c.district}</td>
                        <td className="px-3.5 py-2.5 text-gray-500">{c.officer_name || <span className="text-gray-300">—</span>}</td>
                        <td className="px-3.5 py-2.5 text-gray-400 whitespace-nowrap">
                          {c.created_at ? format(new Date(c.created_at), 'dd MMM yy') : '—'}
                        </td>
                        <td className="px-3.5 py-2.5"><PriorityBadge p={c.priority} /></td>
                        <td className="px-3.5 py-2.5"><StatusBadge s={c.status} /></td>
                        <td className="px-3.5 py-2.5" onClick={e => e.stopPropagation()}>
                          <button onClick={() => navigate(`/complaints/${c.id}`)}
                            className="btn btn-sm btn-primary py-1 px-2.5 text-[11px]">Dekhen</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-4 pb-3">
              <Pagination pagination={pagination} onChange={p => setFilters(f => ({ ...f, page: p }))} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
