import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm)
      return toast.error('Password match nahi karta')
    if (form.password.length < 6)
      return toast.error('Password kam se kam 6 characters ka hona chahiye')
    setLoading(true)
    try {
      const api = (await import('../api/axios')).default
      await api.post('/auth/register', { name: form.name, email: form.email, mobile: form.mobile, password: form.password })
      await login(form.email, form.password)
      toast.success('Account ban gaya!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration nahi hui')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🏛️</div>
          <h1 className="text-xl font-semibold text-white">Naya Account Banayein</h1>
          <p className="text-white/55 text-xs mt-1">Bhumi Shikayat Portal</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {[
              { k: 'name',    label: 'Pura Naam',      type: 'text',     ph: 'Ram Kumar Yadav' },
              { k: 'email',   label: 'Email',          type: 'email',    ph: 'aapka@email.com' },
              { k: 'mobile',  label: 'Mobile Nambar',  type: 'tel',      ph: '9876543210' },
              { k: 'password',label: 'Password',       type: 'password', ph: '••••••••' },
              { k: 'confirm', label: 'Confirm Password',type: 'password',ph: '••••••••' },
            ].map(({ k, label, type, ph }) => (
              <div key={k}>
                <label className="form-label block mb-1">{label}</label>
                <input type={type} required value={form[k]} onChange={e => set(k, e.target.value)}
                  className="form-control" placeholder={ph} />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Ban raha hai...' : 'Account Banayein →'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-4">
            Pehle se account hai?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Login Karen</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
