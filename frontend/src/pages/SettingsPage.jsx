import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { PageHeader, Alert } from '../components/ui'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user } = useAuth()
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)

  const set = (k, v) => setPwForm(p => ({ ...p, [k]: v }))

  const changePassword = async () => {
    if (!pwForm.oldPassword || !pwForm.newPassword) return toast.error('Sab fields bharen')
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Naya password match nahi karta')
    if (pwForm.newPassword.length < 6) return toast.error('Password kam se kam 6 characters ka hona chahiye')
    setSavingPw(true)
    try {
      const { data } = await api.put('/auth/change-password', {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword
      })
      toast.success(data.message)
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' })
    } catch (e) { toast.error(e.response?.data?.message || 'Password nahi badla') }
    finally { setSavingPw(false) }
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="max-w-3xl">
      <PageHeader title="⚙️ Settings" subtitle="Profile aur system settings" />

      <div className="grid grid-cols-2 gap-5">
        {/* Profile Card */}
        <div className="card">
          <div className="card-title mb-4">👤 Aapki Profile</div>
          <div className="flex items-center gap-3 mb-5 p-3 bg-primary-light rounded-xl">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-white">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
              <div className="text-[11px] text-primary font-medium capitalize mt-0.5">{user?.role}</div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            {[
              ['Naam',      user?.name],
              ['Email',     user?.email],
              ['Role',      user?.role],
              ['Zila',      user?.district || '—'],
              ['Padh',      user?.designation || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-400">{k}</span>
                <span className="font-medium text-gray-700">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-title mb-4">🔒 Password Badlen</div>
          <div className="space-y-3.5">
            {[
              { k: 'oldPassword', label: 'Purana Password' },
              { k: 'newPassword', label: 'Naya Password' },
              { k: 'confirm',     label: 'Confirm Naya Password' },
            ].map(({ k, label }) => (
              <div key={k}>
                <label className="form-label block mb-1">{label}</label>
                <input type="password" className="form-control" value={pwForm[k]}
                  onChange={e => set(k, e.target.value)} placeholder="••••••••" />
              </div>
            ))}
            <Alert type="info">
              Password mein kam se kam 6 characters hone chahiye
            </Alert>
            <button onClick={changePassword} disabled={savingPw}
              className="w-full btn btn-primary disabled:opacity-50">
              {savingPw ? 'Update ho raha hai...' : '🔒 Password Update Karen'}
            </button>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card mt-5">
        <div className="card-title mb-4">📋 System Jaankari</div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          {[
            ['Portal Naam',   'Jharkhand Bhumi Shikayat Portal'],
            ['Version',       'v1.0.0'],
            ['Database',      'PostgreSQL'],
            ['Backend',       'Node.js + Express'],
            ['Frontend',      'React + Vite'],
            ['Notifications', 'Python FastAPI'],
          ].map(([k, v]) => (
            <div key={k} className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-400 text-[11px]">{k}</div>
              <div className="font-medium text-gray-700 mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="card mt-5">
        <div className="card-title mb-4">🔗 Mahatvapurn Links</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: 'Jharkhand Rajaswa Vibhag', url: 'https://revenue.jharkhand.gov.in' },
            { label: 'Jhara Portal (Bhumi Records)', url: 'https://jharbhoomi.nic.in' },
            { label: 'National Land Records', url: 'https://dilrmp.gov.in' },
            { label: 'Jharkhand E-Courts', url: 'https://ecourts.gov.in' },
          ].map(({ label, url }) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary-light/30 transition-colors">
              <span className="text-primary text-lg">🔗</span>
              <span className="text-gray-600 hover:text-primary">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
