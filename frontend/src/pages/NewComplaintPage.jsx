import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { Alert, PageHeader } from '../components/ui'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { BLOCKS, THANAS, CIRCLES, BLOCK_THANA_MAP, COMPLAINT_TYPES, PRIORITIES, LAND_TYPES } from '../utils/deogharData'

const Field = ({ label, required, children, hint }) => (
  <div>
    <label className="form-label block mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
  </div>
)

const Section = ({ num, title, children }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
      <span className="w-6 h-6 rounded-full bg-primary text-white text-[11px] flex items-center justify-center font-bold flex-shrink-0">{num}</span>
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{title}</span>
    </div>
    <div className="grid grid-cols-2 gap-3.5">{children}</div>
  </div>
)

export default function NewComplaintPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [loading, setLoading]           = useState(false)
  const [files, setFiles]               = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [thanaList, setThanaList]       = useState(THANAS)
  const [form, setForm] = useState({
    complainant_name: user?.name || '',
    mobile:           user?.mobile || '',
    father_name: '', aadhar: '',
    email:            user?.email || '',
    address: '',
    khasra: '', khata: '',
    district: 'Deoghar',
    block: '', circle: '', thana: '', mauza: '',
    halka: '', area_acres: '', land_type: '',
    complaint_type: '', priority: 'Madhyam',
    description: '', opponent_name: '', prev_action: ''
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (form.block && BLOCK_THANA_MAP[form.block]) {
      setThanaList(BLOCK_THANA_MAP[form.block])
      setForm(p => ({ ...p, thana: '', circle: form.block + ' Circle' }))
    } else {
      setThanaList(THANAS)
    }
  }, [form.block])

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx))

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.style.borderColor = '#cbd5e0'
    e.currentTarget.style.background  = '#f8fafc'
    const dropped = [...e.dataTransfer.files].slice(0, 5)
    setFiles(prev => [...prev, ...dropped].slice(0, 5))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const required = ['complainant_name','mobile','address','khasra','block','complaint_type','description']
    const missing  = required.find(k => !form[k]?.trim())
    if (missing) return toast.error('Sab zaroori (*) fields bharen')

    setLoading(true)
    setUploadProgress(0)
    try {
      const formData = new FormData()
      Object.entries({ ...form, district: 'Deoghar' }).forEach(([k, v]) => { if (v) formData.append(k, v) })
      files.forEach(f => formData.append('attachments', f))

      const { data } = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: p => setUploadProgress(Math.round(p.loaded / p.total * 100))
      })
      toast.success(data.message)
      navigate('/complaints')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Shikayat darj nahi hui')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const fileIcon = (name) => {
    if (name.match(/\.pdf$/i))           return '📄'
    if (name.match(/\.(jpe?g|png)$/i))   return '🖼️'
    if (name.match(/\.docx?$/i))         return '📝'
    return '📎'
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="📝 Nayi Bhumi Shikayat — Deoghar Zila" subtitle="Rajaswa Vibhag, Jharkhand Sarkar">
        <button onClick={() => navigate(-1)} className="btn btn-sm">← Wapas</button>
      </PageHeader>

      <div className="flex items-center gap-3 bg-primary text-white rounded-xl px-4 py-3 mb-4">
        <span className="text-2xl">🏛️</span>
        <div>
          <div className="font-semibold text-sm">देवघर जिला — झारखंड</div>
          <div className="text-white/70 text-xs">Santhal Pargana Prathmand | 10 Blocks | 2 Subdivisions | 13 Thane</div>
        </div>
      </div>

      <Alert type="info">
        Shikayat darj hone ke baad aapko unique ID milegi aur SMS aayega.
        Starred (<span className="text-red-500 font-bold">*</span>) fields zaroori hain.
      </Alert>

      <form onSubmit={handleSubmit}>
        <div className="card">

          {/* ── Section 1: Complainant ── */}
          <Section num="1" title="Shikayatakarta Ki Jaankari (Complainant Details)">
            <Field label="Pura Naam" required>
              <input className="form-control" value={form.complainant_name}
                onChange={e => set('complainant_name', e.target.value)} placeholder="Ram Kumar Yadav" />
            </Field>
            <Field label="Mobile Nambar" required>
              <input className="form-control" type="tel" value={form.mobile}
                onChange={e => set('mobile', e.target.value)} placeholder="9876543210" />
            </Field>
            <Field label="Pita / Pati Ka Naam">
              <input className="form-control" value={form.father_name}
                onChange={e => set('father_name', e.target.value)} placeholder="Pitaji ya Pati ka naam" />
            </Field>
            <Field label="Aadhar Nambar">
              <input className="form-control" value={form.aadhar}
                onChange={e => set('aadhar', e.target.value)} placeholder="XXXX XXXX XXXX" maxLength={14} />
            </Field>
            <Field label="Email">
              <input className="form-control" type="email" value={form.email}
                onChange={e => set('email', e.target.value)} placeholder="aapka@email.com" />
            </Field>
            <div className="col-span-2">
              <Field label="Pata" required>
                <input className="form-control" value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="Gaon, Post, Thana — Deoghar, Jharkhand" />
              </Field>
            </div>
          </Section>

          {/* ── Section 2: Land Details ── */}
          <Section num="2" title="Bhumi Ka Vivran — Deoghar Zila">
            <Field label="Zila">
              <input className="form-control bg-blue-50 font-semibold text-primary"
                value="Deoghar — Jharkhand" readOnly />
            </Field>
            <Field label="Block / Anchal" required>
              <select className="form-control" value={form.block} onChange={e => set('block', e.target.value)}>
                <option value="">Block chunen</option>
                {BLOCKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Circle" hint="Block chunne par auto-fill hoga">
              <select className="form-control" value={form.circle} onChange={e => set('circle', e.target.value)}>
                <option value="">Circle chunen</option>
                {CIRCLES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Thana (Police Station)" required>
              <select className="form-control" value={form.thana} onChange={e => set('thana', e.target.value)}>
                <option value="">Thana chunen</option>
                {thanaList.map(th => <option key={th} value={th}>{th}</option>)}
              </select>
            </Field>
            <Field label="Khasra / Plot Nambar" required>
              <input className="form-control" value={form.khasra}
                onChange={e => set('khasra', e.target.value)} placeholder="123/2" />
            </Field>
            <Field label="Khata Nambar">
              <input className="form-control" value={form.khata}
                onChange={e => set('khata', e.target.value)} placeholder="Khata Nambar" />
            </Field>
            <Field label="Mauza / Gram">
              <input className="form-control" value={form.mauza}
                onChange={e => set('mauza', e.target.value)} placeholder="Mauza ya Gram" />
            </Field>
            <Field label="Halka Nambar">
              <input className="form-control" value={form.halka}
                onChange={e => set('halka', e.target.value)} placeholder="Halka" />
            </Field>
            <Field label="Rakba (Acres)">
              <input className="form-control" type="number" step="0.01" min="0"
                value={form.area_acres} onChange={e => set('area_acres', e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Bhumi Prakar">
              <select className="form-control" value={form.land_type} onChange={e => set('land_type', e.target.value)}>
                <option value="">Chunen</option>
                {LAND_TYPES.map(lt => <option key={lt} value={lt}>{lt}</option>)}
              </select>
            </Field>
          </Section>

          {/* ── Section 3: Complaint Details ── */}
          <Section num="3" title="Shikayat Ka Vivran (Complaint Details)">
            <Field label="Shikayat Prakar" required>
              <select className="form-control" value={form.complaint_type} onChange={e => set('complaint_type', e.target.value)}>
                <option value="">Prakar chunen</option>
                {COMPLAINT_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </Field>
            <Field label="Praathamikta">
              <select className="form-control" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="Virodhi Paksh Ka Naam">
                <input className="form-control" value={form.opponent_name}
                  onChange={e => set('opponent_name', e.target.value)}
                  placeholder="Doosre paksh ka naam aur pata" />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Shikayat Ka Poora Vivran" required hint="Kab se, kya hua, kaunse saakshya hain">
                <textarea className="form-control" rows={4} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Apni bhumi shikayat ka poora vivran likhein..." />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Pehle Ki Karvayi">
                <textarea className="form-control" rows={2} value={form.prev_action}
                  onChange={e => set('prev_action', e.target.value)}
                  placeholder="CO Office, Thana ya Court mein pehle gaye hain?" />
              </Field>
            </div>
          </Section>

          {/* ── Section 4: File Attachments ── */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-[11px] flex items-center justify-center font-bold flex-shrink-0">4</span>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Dastaavej / Documents / ᱫᱟᱥᱛᱟᱣᱮᱡᱽ
              </span>
              <span className="text-[10px] text-gray-400 font-normal ml-1">(Optional — max 5 files, 5MB each)</span>
            </div>

            {/* Drop zone */}
            <div
              style={{ border: '2px dashed #cbd5e0', borderRadius: 10, padding: '24px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s' }}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#3a7fc1'; e.currentTarget.style.background = '#e8f2fb' }}
              onDragLeave={e => { e.currentTarget.style.borderColor = '#cbd5e0'; e.currentTarget.style.background = '#f8fafc' }}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 4 }}>
                Files yahan drag karein ya click karke chunen
              </div>
              <div style={{ fontSize: 11, color: '#a0aec0' }}>
                Khasra copy, naksha, photo, affidavit — PDF, JPG, PNG, DOC allowed
              </div>
              <input
                id="file-upload-input"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                style={{ display: 'none' }}
                onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files)].slice(0, 5))}
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: '#e8f2fb', borderRadius: 8, border: '1px solid #c7dff5' }}>
                    <span style={{ fontSize: 18 }}>{fileIcon(f.name)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a4f7a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: '#718096' }}>{(f.size / 1024).toFixed(0)} KB</div>
                    </div>
                    <button type="button" onClick={() => removeFile(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b03030', fontSize: 16, padding: '0 4px', lineHeight: 1 }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ height: 5, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#3a7fc1', borderRadius: 10, transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: 11, color: '#3a7fc1', marginTop: 4 }}>
                  Upload ho raha hai... {uploadProgress}%
                </div>
              </div>
            )}
          </div>

          {/* ── Submit Buttons ── */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={() => navigate(-1)} className="btn">Raddh Karen</button>
            <button type="submit" disabled={loading}
              className="btn btn-primary px-6 disabled:opacity-50">
              {loading ? '⏳ Darj ho rahi hai...' : '✅ Shikayat Darj Karen'}
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}
