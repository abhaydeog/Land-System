import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { StatusBadge, PriorityBadge, LoadingPage, Alert } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const TL_ICONS = { 'Shikayat Darj': '📝', 'Adhikari Niyukt': '👤', 'Tippani': '💬', 'Status:': '🔄' }
const getTlIcon = (action) => {
  for (const [key, val] of Object.entries(TL_ICONS)) if (action?.includes(key)) return val
  return '📌'
}

export default function ComplaintDetailPage() {
  const { id }          = useParams()
  const { isStaff, isAdmin } = useAuth()
  const navigate        = useNavigate()
  const [data, setData] = useState(null)
  const [officers, setOfficers] = useState([])
  const [loading, setLoading]   = useState(true)
  const [comment, setComment]   = useState('')
  const [selOfficer, setSelOfficer] = useState('')
  const [newStatus, setNewStatus]   = useState('')
  const [statusNote, setStatusNote] = useState('')

  const fetch = async () => {
    try {
      const [cRes, oRes] = await Promise.all([
        api.get(`/complaints/${id}`),
        isStaff ? api.get('/officers') : Promise.resolve({ data: { data: [] } })
      ])
      setData(cRes.data.data)
      setOfficers(oRes.data.data)
      setSelOfficer(cRes.data.data.officer_id || '')
      setNewStatus(cRes.data.data.status)
    } catch {
      toast.error('Data load nahi hua')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [id])

  const handleAssign = async () => {
    if (!selOfficer) return toast.error('Officer chunen')
    try {
      const { data: r } = await api.put(`/complaints/${id}/assign`, { officer_id: selOfficer })
      toast.success(r.message); fetch()
    } catch (e) { toast.error(e.response?.data?.message || 'Assign nahi hua') }
  }

  const handleStatus = async () => {
    try {
      const { data: r } = await api.put(`/complaints/${id}/status`, { status: newStatus, note: statusNote })
      toast.success(r.message); setStatusNote(''); fetch()
    } catch (e) { toast.error(e.response?.data?.message || 'Update nahi hua') }
  }

  const handleComment = async () => {
    if (!comment.trim()) return toast.error('Tippani likhein')
    try {
      await api.post(`/complaints/${id}/comment`, { note: comment })
      toast.success('Tippani jod di gayi'); setComment(''); fetch()
    } catch { toast.error('Tippani nahi judi') }
  }

  if (loading) return <LoadingPage />
  if (!data)   return <div className="card"><Alert type="danger">Shikayat nahi mili</Alert></div>

  const InfoRow = ({ label, value }) => (
    <div className="flex py-2 border-b border-gray-50 last:border-0 text-xs">
      <span className="w-32 text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">{value || '—'}</span>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <button onClick={() => navigate(-1)} className="text-xs text-gray-400 hover:text-primary mb-1 flex items-center gap-1">← Wapas</button>
          <h1 className="text-base font-semibold text-gray-800">
            Shikayat Vivran —{' '}
            <span className="font-mono text-primary">{data.complaint_no}</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge s={data.status} />
            <PriorityBadge p={data.priority} />
            <span className="text-[11px] text-gray-400">
              Darj: {data.created_at ? format(new Date(data.created_at), 'dd MMM yyyy, h:mm a') : '—'}
            </span>
          </div>
        </div>
        {isStaff && (
          <div className="flex gap-2">
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
              className="form-control text-xs w-auto">
              {['Nayi','Niyukt','Vichaaradheen','Nipatara','Viprit'].map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={handleStatus} className="btn btn-primary btn-sm">Update</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: Details */}
        <div className="col-span-2 space-y-4">
          {/* Complainant */}
          <div className="card">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Shikayatakarta</div>
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <InfoRow label="Naam"      value={data.complainant_name} />
                <InfoRow label="Mobile"    value={data.mobile} />
                <InfoRow label="Email"     value={data.email} />
                <InfoRow label="Aadhar"    value={data.aadhar} />
              </div>
              <div>
                <InfoRow label="Pita/Pati" value={data.father_name} />
                <InfoRow label="Pata"      value={data.address} />
              </div>
            </div>
          </div>

          {/* Land */}
          <div className="card">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Bhumi Vivran</div>
            <div className="grid grid-cols-2 gap-x-6">
              <div>
                <InfoRow label="Khasra"    value={<span className="font-mono">{data.khasra}</span>} />
                <InfoRow label="Khata"     value={data.khata} />
                <InfoRow label="Zila"      value={data.district} />
                <InfoRow label="Block"     value={data.block} />
              </div>
              <div>
                <InfoRow label="Mauza"     value={data.mauza} />
                <InfoRow label="Halka"     value={data.halka} />
                <InfoRow label="Rakba"     value={data.area_acres ? `${data.area_acres} Acres` : null} />
                <InfoRow label="Bhumi Prakar" value={data.land_type} />
              </div>
            </div>
          </div>

          {/* Complaint */}
          <div className="card">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Shikayat</div>
            <InfoRow label="Prakar"        value={data.complaint_type} />
            <InfoRow label="Virodhi Paksh" value={data.opponent_name} />
            <div className="mt-3">
              <div className="text-[11px] text-gray-400 mb-1.5">Vivran</div>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed">{data.description}</div>
            </div>
            {data.prev_action && (
              <div className="mt-3">
                <div className="text-[11px] text-gray-400 mb-1.5">Pehle Ki Karvayi</div>
                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">{data.prev_action}</div>
              </div>
            )}
            {data.resolution_note && (
              <div className="mt-3">
                <div className="text-[11px] text-gray-400 mb-1.5">Nipatara Note</div>
                <div className="text-xs text-success bg-success-light p-3 rounded-lg">{data.resolution_note}</div>
              </div>
            )}
          </div>

          {/* Comment box for staff */}
          {isStaff && (
            <div className="card">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Tippani / Update Joden</div>
              {newStatus === 'Nipatara' && (
                <textarea className="form-control mb-2 text-xs" rows={2} placeholder="Nipatara ka vivran likhein..."
                  value={statusNote} onChange={e => setStatusNote(e.target.value)} />
              )}
              <textarea className="form-control text-xs mb-2" rows={2} placeholder="Nayi tippani ya karvayi likhein..."
                value={comment} onChange={e => setComment(e.target.value)} />
              <button onClick={handleComment} className="btn btn-primary btn-sm">💬 Tippani Joden</button>
            </div>
          )}
        </div>

        {/* Right: Timeline + Officer */}
        <div className="space-y-4">
          {/* Officer assignment */}
          {isStaff && (
            <div className="card">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Adhikari Niyukti</div>
              <div className="text-xs text-gray-500 mb-1">Current: <span className="font-medium text-gray-800">{data.officer_name || 'Niyukt nahi'}</span></div>
              <select className="form-control text-xs mb-2" value={selOfficer} onChange={e => setSelOfficer(e.target.value)}>
                <option value="">Officer chunen</option>
                {officers.map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.district}) — {o.availability}</option>
                ))}
              </select>
              <button onClick={handleAssign} className="btn btn-primary btn-sm w-full">👤 Assign Karen</button>
            </div>
          )}

          {/* Hearings */}
          {data.hearings?.length > 0 && (
            <div className="card">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Sunavayi</div>
              {data.hearings.map(h => (
                <div key={h.id} className="text-xs border-l-2 border-primary pl-3 mb-2">
                  <div className="font-medium text-gray-700">{h.hearing_type}</div>
                  <div className="text-gray-400">{h.scheduled_at ? format(new Date(h.scheduled_at), 'dd MMM yyyy, h:mm a') : '—'}</div>
                  {h.location && <div className="text-gray-400">{h.location}</div>}
                  <StatusBadge s={h.status} />
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Activity Timeline</div>
            <div className="space-y-0">
              {(data.activities || []).map((act, i) => (
                <div key={act.id || i} className="flex gap-3 pb-4 relative">
                  {i < data.activities.length - 1 && (
                    <div className="absolute left-3.5 top-7 bottom-0 w-px bg-gray-100" />
                  )}
                  <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-sm flex-shrink-0 z-10">
                    {getTlIcon(act.action)}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="text-xs font-medium text-gray-800">{act.action}</div>
                    {act.note && <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{act.note}</div>}
                    <div className="text-[10px] text-gray-300 mt-1 flex items-center gap-1.5">
                      <span>{act.done_by_name}</span> · <span>{act.created_at ? format(new Date(act.created_at), 'dd MMM, h:mm a') : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!data.activities?.length && <div className="text-xs text-gray-300 text-center py-4">Koi activity nahi</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
