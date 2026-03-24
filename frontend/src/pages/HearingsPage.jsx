import { useState, useEffect } from 'react'
import api from '../api/axios'
import { LoadingPage, PageHeader, StatusBadge, Modal } from '../components/ui'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function HearingsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm] = useState({ complaint_id: '', scheduled_at: '', location: '', hearing_type: 'Sthal Nireekshan' })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    api.get('/complaints', { params: { status: 'Vichaaradheen', limit: 20 } })
      .then(r => setComplaints(r.data.data))
      .catch(() => toast.error('Data load nahi hua'))
      .finally(() => setLoading(false))
  }, [])

  const scheduleHearing = async () => {
    if (!form.complaint_id || !form.scheduled_at || !form.location)
      return toast.error('Sab fields bharen')
    try {
      await api.post(`/complaints/${form.complaint_id}/comment`, {
        note: `Sunavayi schedule ki gayi: ${form.hearing_type} — ${format(new Date(form.scheduled_at), 'dd MMM yyyy, h:mm a')} — ${form.location}`
      })
      toast.success('Sunavayi schedule ho gayi')
      setShowModal(false)
    } catch { toast.error('Schedule nahi hua') }
  }

  if (loading) return <LoadingPage />

  const upcoming = complaints.filter(c => c.status === 'Vichaaradheen').slice(0, 5)

  return (
    <div>
      <PageHeader title="Sunavayi Schedule" subtitle="Aagami aur past hearings">
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">+ Naya Schedule</button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-5">
        {/* Upcoming */}
        <div className="card">
          <div className="card-title mb-4">📅 Vichaaradheen Shikayaten</div>
          <div className="space-y-3">
            {upcoming.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-8">Koi vichaaradheen shikayat nahi</div>
            )}
            {upcoming.map(c => (
              <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center text-base flex-shrink-0">📋</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-primary">{c.complaint_no}</span>
                    <StatusBadge s={c.status} />
                  </div>
                  <div className="text-xs font-medium text-gray-800 mt-0.5">{c.complainant_name}</div>
                  <div className="text-[11px] text-gray-400">{c.complaint_type} · {c.district}</div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Officer: {c.officer_name || 'Niyukt nahi'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="card">
          <div className="card-title mb-4">ℹ️ Sunavayi Ke Prakar</div>
          <div className="space-y-3">
            {[
              { icon: '🔍', title: 'Sthal Nireekshan', desc: 'Adhikari seedhe zameen par jaate hain aur tasveer, naap-jokh karte hain' },
              { icon: '🏛️', title: 'Karyalay Sunavayi', desc: 'Dono pakshon ko Collector Karyalay bulaya jata hai' },
              { icon: '📐', title: 'Sarkari Naap-Jokh', desc: 'Ameen dvaara sarkari naap-jokh ki jaati hai' },
              { icon: '🤝', title: 'Sahamati Baithak', desc: 'Dono pakshon ke beech sahamati karaayi jaati hai' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                <span className="text-xl">{icon}</span>
                <div>
                  <div className="text-xs font-semibold text-gray-700">{title}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-primary-light border border-primary/20">
            <div className="text-xs font-semibold text-primary mb-1">📞 Helpline</div>
            <div className="text-[11px] text-primary/70">Rajaswa Vibhag: 1800-XXX-XXXX (Toll Free)</div>
            <div className="text-[11px] text-primary/70">Email: rajasva@jharkhand.gov.in</div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Nayi Sunavayi Schedule Karen"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-sm">Raddh Karen</button>
            <button onClick={scheduleHearing} className="btn btn-primary btn-sm">✅ Schedule Karen</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="form-label block mb-1">Shikayat Chunen *</label>
            <select className="form-control" value={form.complaint_id} onChange={e => set('complaint_id', e.target.value)}>
              <option value="">Shikayat chunen</option>
              {complaints.map(c => (
                <option key={c.id} value={c.id}>{c.complaint_no} — {c.complainant_name} ({c.district})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label block mb-1">Tarikh aur Samay *</label>
              <input type="datetime-local" className="form-control" value={form.scheduled_at}
                onChange={e => set('scheduled_at', e.target.value)} />
            </div>
            <div>
              <label className="form-label block mb-1">Sunavayi Prakar</label>
              <select className="form-control" value={form.hearing_type} onChange={e => set('hearing_type', e.target.value)}>
                {['Sthal Nireekshan','Karyalay Sunavayi','Sarkari Naap-Jokh','Sahamati Baithak'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label block mb-1">Sthal / Jagah *</label>
            <input type="text" className="form-control" placeholder="Jahan sunavayi hogi"
              value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
