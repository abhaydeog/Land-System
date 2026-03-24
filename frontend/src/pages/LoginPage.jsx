import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { t, getLang, setLang } from '../utils/i18n'
import toast from 'react-hot-toast'

const LANGS = [
  { code:'hi',  label:'हिंदी',      flag:'🇮🇳' },
  { code:'en',  label:'English',    flag:'🌐' },
  { code:'sat', label:'ᱥᱟᱱᱛᱟᱲᱤ', flag:'🌿' },
]

export default function LoginPage() {
  const [form, setForm]   = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [lang, setLangState]  = useState(getLang())
  const { login } = useAuth()
  const navigate  = useNavigate()

  const changeLang = (code) => { setLang(code); setLangState(code) }
  const set = (k,v) => setForm(p => ({...p,[k]:v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`${t('loginWelcome')}, ${user.name}!`)
      navigate('/dashboard')
    } catch(err) {
      toast.error(err.response?.data?.message || 'Login nahi hua')
    } finally { setLoading(false) }
  }

  const trilingual = [
    ['भूमि शिकायत प्रणाली', 'Land Complaint System', 'ᱡᱚᱢᱤᱱ ᱦᱚᱲ ᱯᱚᱨᱚᱢ'],
    ['देवघर जिला', 'Deoghar District', 'ᱫᱮᱣᱜᱷᱚᱨ ᱡᱤᱞᱟ'],
  ]

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:"'Noto Sans','Noto Sans Devanagari',sans-serif" }}>

      {/* India flag bar */}
      <div style={{ height:5, background:'linear-gradient(90deg, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%)' }} />

      {/* Gov header bar */}
      <div style={{ background:'#1a3a52', padding:'8px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:28 }}>🏛️</span>
          <div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:10, letterSpacing:'1px', textTransform:'uppercase' }}>Government of Jharkhand / झारखंड सरकार</div>
            <div style={{ color:'#fff', fontSize:13, fontWeight:600 }}>Revenue & Land Reform Department — Deoghar</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => changeLang(l.code)} style={{ padding:'3px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.2)', background: lang===l.code?'rgba(255,255,255,0.15)':'transparent', color: lang===l.code?'#fff':'rgba(255,255,255,0.5)', fontSize:11, cursor:'pointer' }}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, display:'flex' }}>

        {/* Left — Hero panel */}
        <div style={{ flex:1, background:'linear-gradient(145deg, #0d3b5e 0%, #1a4f7a 60%, #2563a8 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px', position:'relative', overflow:'hidden' }}>

          {/* Decorative circles */}
          {[{s:400,t:'-100px',l:'-100px',o:0.04},{s:300,t:'60%',r:'-80px',o:0.05},{s:200,t:'20%',l:'60%',o:0.06}].map((c,i)=>(
            <div key={i} style={{ position:'absolute', width:c.s, height:c.s, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.15)', top:c.t, left:c.l, right:c.r, opacity:c.o, pointerEvents:'none' }}/>
          ))}

          <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:440 }}>
            <div style={{ fontSize:64, marginBottom:20 }}>🏛️</div>

            {/* Trilingual title display */}
            <div style={{ marginBottom:24 }}>
              {trilingual[0].map((text,i) => (
                <div key={i} style={{ fontSize: i===0?28:i===1?22:18, fontWeight: i===0?700:500, color: i===0?'#fff':i===1?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.45)', marginBottom:4, lineHeight:1.3 }}>{text}</div>
              ))}
            </div>

            {/* District badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:30, padding:'8px 20px', marginBottom:32 }}>
              <span style={{ fontSize:16 }}>📍</span>
              <div>
                {trilingual[1].map((text,i) => (
                  <span key={i} style={{ color: i===0?'#fff':i===1?'rgba(255,255,255,0.6)':'rgba(255,255,255,0.4)', fontSize: i===0?13:i===1?11:10, marginLeft: i>0?8:0 }}>{text}</span>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {[
                { num:'10', label:['ब्लॉक','Blocks','ᱵᱞᱳᱠ'] },
                { num:'13', label:['थाने','Thanas','ᱛᱷᱟᱱᱟ'] },
                { num:'2',  label:['अनुमंडल','Subdivisions','ᱥᱩᱵ'] },
              ].map(({num,label},i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
                  <div style={{ fontSize:24, fontWeight:700, color:'#FFD700' }}>{num}</div>
                  {label.map((l,j) => (
                    <div key={j} style={{ color: j===0?'rgba(255,255,255,0.8)':'rgba(255,255,255,0.4)', fontSize: j===0?11:9 }}>{l}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Login form */}
        <div style={{ width:420, background:'#fff', display:'flex', flexDirection:'column', justifyContent:'center', padding:'40px 40px' }}>
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:22, fontWeight:700, color:'#1a2333', marginBottom:4 }}>{t('login')}</h2>
            <div style={{ display:'flex', gap:8 }}>
              {['लॉगिन करें', 'Login', 'ᱞᱳᱜᱤᱱ'].map((txt,i) => (
                <span key={i} style={{ fontSize:11, color:['#1a4f7a','#2d7d46','#8B4513'][i], background:['#e8f2fb','#e8f5ec','#fdf3e3'][i], padding:'2px 8px', borderRadius:20 }}>{txt}</span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#4a5568', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>
                {t('email')} / Email / ᱤᱢᱮᱞ
              </label>
              <input type="email" required value={form.email} onChange={e => set('email',e.target.value)}
                style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, color:'#1a2333', outline:'none', boxSizing:'border-box' }}
                placeholder="aapka@email.com" />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#4a5568', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>
                {t('password') || 'Password'} / ᱯᱟᱥᱣᱚᱨᱰ
              </label>
              <input type="password" required value={form.password} onChange={e => set('password',e.target.value)}
                style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, color:'#1a2333', outline:'none', boxSizing:'border-box' }}
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'11px', borderRadius:10, border:'none', background: loading?'#93b4cc':'linear-gradient(135deg, #1a4f7a, #3a7fc1)', color:'#fff', fontSize:14, fontWeight:700, cursor: loading?'not-allowed':'pointer', boxShadow:'0 4px 12px rgba(26,79,122,0.3)' }}>
              {loading ? '...' : `${t('login')} →`}
            </button>
          </form>

          <div style={{ marginTop:16, textAlign:'center', fontSize:12, color:'#718096' }}>
            <Link to="/register" style={{ color:'#1a4f7a', fontWeight:600, textDecoration:'none' }}>नया खाता बनाएं</Link>
            {' · '}
            <Link to="/track" style={{ color:'#1a4f7a', fontWeight:600, textDecoration:'none' }}>शिकायत ट्रैक करें</Link>
          </div>

          {/* Demo buttons */}
          <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid #f0f0f0' }}>
            <div style={{ fontSize:11, color:'#a0aec0', textAlign:'center', marginBottom:10 }}>
              Demo Login / डेमो लॉगिन / ᱰᱮᱢᱳ ᱞᱳᱜᱤᱱ
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {[
                { label:['Admin','एडमिन','ᱩᱯᱨᱤᱠ'], email:'admin@bhumi.gov.in', pass:'Admin@123', color:'#1a4f7a', bg:'#e8f2fb' },
                { label:['Officer','अधिकारी','ᱱᱟᱭᱵ'], email:'rajesh@bhumi.gov.in', pass:'Officer@123', color:'#2d7d46', bg:'#e8f5ec' },
                { label:['Public','नागरिक','ᱦᱚᱲ'], email:'user@gmail.com', pass:'User@123', color:'#854F0B', bg:'#fdf3e3' },
              ].map(({label,email,pass,color,bg},i) => (
                <button key={i} onClick={() => setForm({email,password:pass})}
                  style={{ padding:'8px 6px', borderRadius:8, border:`1px solid ${color}30`, background:bg, cursor:'pointer', textAlign:'center' }}>
                  <div style={{ fontSize:11, fontWeight:700, color }}>{label[0]}</div>
                  <div style={{ fontSize:10, color:'#718096' }}>{label[1]}</div>
                  <div style={{ fontSize:9, color:'#a0aec0' }}>{label[2]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ background:'#1a3a52', padding:'8px 32px', display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.4)' }}>
        <span>© 2026 Jharkhand Sarkar — Rajaswa Vibhag | झारखंड सरकार — राजस्व विभाग</span>
        <span>हिंदी | English | ᱥᱟᱱᱛᱟᱲᱤ (Ol Chiki)</span>
      </div>
    </div>
  )
}
