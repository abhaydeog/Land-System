import { useState, useEffect } from 'react'
import api from '../api/axios'
import { PageHeader, LoadingPage, Modal, Badge, EmptyState } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const AVAIL_COLORS = { available: 'green', busy: 'amber', on_leave: 'gray' }
const AVAIL_LABELS = { available: 'Uplabdh', busy: 'Vyast', on_leave: 'Avkash' }

const DISTRICTS = ['Dumka','Deoghar','Godda','Sahibganj','Pakur','Jamtara','Dhanbad','Ranchi']
const ROLES     = ['Rajaswa Nirikshak','Patwari','Ameen','Naib Tahsildar','Tahsildar']

export default function OfficersPage() {
  const { isAdmin } = useAuth()
  const [officers, setOfficers]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm] = useState({ name:'', email:'', mobile:'', district:'', designation:'', employee_id:'', block:'' })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const fetch = async () => {
    try {
      const { data } = await api.get('/officers')
      setOfficers(data.data)
    } catch { toast.error('Officers load nahi hue') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleAdd = async () => {
    const req = ['name','email','mobile','district','designation','employee_id']
    if (req.some(k => !form[k]?.trim())) return toast.error('Sab zaroori fields bharen')
    setSaving(true)
    try {
      const { data } = await api.post('/officers', form)
      toast.success(data.message)
      setShowModal(false)
      setForm({ name:'', email:'', mobile:'', district:'', designation:'', employee_id:'', block:'' })
      fetch()
    } catch (e) { toast.error(e.response?.data?.message || 'Officer nahi bana') }
    finally { setSaving(false) }
  }

  const updateAvail = async (id, availability) => {
    try {
      await api.put(`/officers/${id}/availability`, { availability })
      toast.success('Availability update ho gayi')
      fetch()
    } catch { toast.error('Update nahi hua') }
  }

  const avgColor = (d) => d <= 10 ? 'text-success' : d <= 18 ? 'text-accent' : 'text-danger'

  if (loading) return <LoadingPage />

  return (
    <div>
      <PageHeader title="Adhikari Prabandhan" subtitle={`${officers.length} officers registered`}>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            + Nayi Officer Joden
          </button>
        )}
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Kul Officers',  val: officers.length, color: 'bg-primary-light text-primary' },
          { label: 'Uplabdh',       val: officers.filter(o => o.availability === 'available').length, color: 'bg-success-light text-success' },
          { label: 'Vyast / Avkash', val: officers.filter(o => o.availability !== 'available').length, color: 'bg-accent-light text-accent' },
        ].map(({ label, val, color }) => (
          <div key={label} className={`rounded-xl p-4 ${color}`}>
            <div className="text-2xl font-semibold">{val}</div>
            <div className="text-xs font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        {!officers.length ? <EmptyState message="Koi officer nahi mila" icon="👤" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Officer','Padh','Zila','Mobile','Active','Nipatara','Avg Din','Uplabdhta','Karvayi'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {officers.map(o => {
                  const initials = o.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
                  const colors   = ['#1a4f7a','#2d7d46','#c8872a','#6b35a8','#b03030']
                  const bg       = colors[o.name?.charCodeAt(0) % colors.length]
                  return (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: bg }}>{initials}</div>
                          <div>
                            <div className="font-semibold text-gray-800">{o.name}</div>
                            <div className="text-gray-400 text-[10px]">{o.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{o.designation}</td>
                      <td className="px-4 py-3 text-gray-500">{o.district}</td>
                      <td className="px-4 py-3 text-gray-500">{o.mobile}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-primary-light text-primary">{o.active_complaints || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-success-light text-success">{o.total_resolved}</span>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${avgColor(o.avg_days)}`}>
                        {o.avg_days ? `${o.avg_days}d` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={AVAIL_COLORS[o.availability] || 'gray'}>
                          {AVAIL_LABELS[o.availability] || o.availability}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && (
                          <select
                            value={o.availability}
                            onChange={e => updateAvail(o.id, e.target.value)}
                            className="text-[11px] border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white cursor-pointer hover:border-primary"
                          >
                            <option value="available">Uplabdh</option>
                            <option value="busy">Vyast</option>
                            <option value="on_leave">Avkash</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Officer Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Nayi Officer Joden"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-sm">Raddh Karen</button>
            <button onClick={handleAdd} disabled={saving} className="btn btn-primary btn-sm disabled:opacity-50">
              {saving ? 'Saving...' : '✅ Officer Joden'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3.5">
          {[
            { k:'name',        label:'Pura Naam *',    type:'text',  ph:'Officer ka naam' },
            { k:'email',       label:'Email *',        type:'email', ph:'officer@bhumi.gov.in' },
            { k:'mobile',      label:'Mobile *',       type:'tel',   ph:'9876543210' },
            { k:'employee_id', label:'Employee ID *',  type:'text',  ph:'EMP005' },
          ].map(({ k, label, type, ph }) => (
            <div key={k}>
              <label className="form-label block mb-1">{label}</label>
              <input type={type} className="form-control" placeholder={ph}
                value={form[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <div>
            <label className="form-label block mb-1">Padh *</label>
            <select className="form-control" value={form.designation} onChange={e => set('designation', e.target.value)}>
              <option value="">Chunen</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label block mb-1">Zila *</label>
            <select className="form-control" value={form.district} onChange={e => set('district', e.target.value)}>
              <option value="">Chunen</option>
              {DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="form-label block mb-1">Anchal / Block</label>
            <input type="text" className="form-control" placeholder="Karyakshetra"
              value={form.block} onChange={e => set('block', e.target.value)} />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          * Default password hoga: <code className="bg-gray-100 px-1 rounded">Officer@123</code> — login ke baad badlen
        </p>
      </Modal>
    </div>
  )
}
