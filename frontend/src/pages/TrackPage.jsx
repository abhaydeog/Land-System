import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { t, getLang, setLang } from '../utils/i18n'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const LANGS = [
  { code:'hi',  label:'हिंदी',      flag:'🇮🇳' },
  { code:'en',  label:'English',    flag:'🌐' },
  { code:'sat', label:'ᱥᱟᱱᱛᱟᱲᱤ', flag:'🌿' },
]

const STATUS_COLORS = { 'Nayi':'#718096','Niyukt':'#3a7fc1','Vichaaradheen':'#c8872a','Nipatara':'#2d7d46','Viprit':'#b03030' }
const STATUS_BG     = { 'Nayi':'#f4f5f7','Niyukt':'#e8f2fb','Vichaaradheen':'#fdf3e3','Nipatara':'#e8f5ec','Viprit':'#fdeaea' }
const STATUS_KEYS   = { 'Nayi':'statusNew','Niyukt':'statusAssigned','Vichaaradheen':'statusPending','Nipatara':'statusResolved','Viprit':'statusEscalated' }

const STEPS = ['Nayi','Niyukt','Vichaaradheen','Nipatara']
const STEP_ICONS = ['📝','👤','🔍','✅']

export default function TrackPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [lang, setLangState] = useState(getLang())

  const changeLang = (code) => { setLang(code); setLangState(code) }

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!query.trim()) return toast.error('Shikayat ID daalein')
    setLoading(true); setResult(null); setNotFound(false)
    try {
      const { data } = await api.get(`/complaints/track/${query.trim().toUpperCase()}`)
      setResult(data.data)
    } catch(err) {
      if (err.response?.status === 404) setNotFound(true)
      else toast.error('Server error')
    } finally { setLoading(false) }
  }

  const currentStep = result ? STEPS.indexOf(result.status) : -1

  return (
    <div style={{ minHeight:'100vh', fontFamily:"'Noto Sans','Noto Sans Devanagari',sans-serif" }}>
      {/* Flag bar */}
      <div style={{ height:4, background:'linear-gradient(90deg,#FF9933 33%,#FFFFFF 33%,#FFFFFF 66%,#138808 66%)' }} />
      
      {/* Header */}
      <div style={{ background:'#1a3a52', padding:'10px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:22 }}>🏛️</span>
          <div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:9, letterSpacing:'1px', textTransform:'uppercase' }}>Jharkhand Sarkar / झारखंड सरकार / ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱥᱚᱨᱠᱟᱨ</div>
            <div style={{ color:'#fff', fontSize:12, fontWeight:600 }}>Deoghar — Rajaswa Vibhag</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => changeLang(l.code)} style={{ padding:'3px 8px', borderRadius:5, border:'1px solid rgba(255,255,255,0.2)', background:lang===l.code?'rgba(255,255,255,0.15)':'transparent', color:lang===l.code?'#fff':'rgba(255,255,255,0.5)', fontSize:10, cursor:'pointer' }}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background:'linear-gradient(160deg,#0d3b5e,#1a4f7a)', padding:'40px 24px', textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
        <h1 style={{ color:'#fff', fontSize:24, fontWeight:700, margin:'0 0 6px' }}>
          {lang==='hi'?'शिकायत स्थिति जानें':lang==='en'?'Track Complaint Status':'ᱦᱚᱲ ᱪᱮᱠᱟ'}
        </h1>
        <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:24 }}>
          {['शिकायत ट्रैक करें','Track your complaint','ᱦᱚᱲ ᱪᱮᱠᱟ ᱢᱮ'].map((txt,i) => (
            <span key={i} style={{ fontSize:11, color:['rgba(255,255,255,0.7)','rgba(255,255,255,0.5)','rgba(255,255,255,0.35)'][i] }}>{txt}</span>
          ))}
        </div>

        {/* Search form */}
        <form onSubmit={handleTrack} style={{ maxWidth:480, margin:'0 auto' }}>
          <div style={{ background:'#fff', borderRadius:14, padding:20, boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#718096', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:8, textAlign:'left' }}>
              {t('trackHelp')} / Enter Complaint ID / ᱦᱚᱲ ID ᱫᱮᱜ
            </label>
            <div style={{ display:'flex', gap:8 }}>
              <input value={query} onChange={e => setQuery(e.target.value.toUpperCase())}
                style={{ flex:1, padding:'10px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, fontFamily:'monospace', letterSpacing:'1px', color:'#1a2333', outline:'none' }}
                placeholder="LND-1001" />
              <button type="submit" disabled={loading}
                style={{ padding:'10px 20px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#1a4f7a,#3a7fc1)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                {loading ? '...' : t('search')}
              </button>
            </div>
            <div style={{ marginTop:10, display:'flex', justifyContent:'space-between', fontSize:11, color:'#a0aec0' }}>
              <Link to="/login" style={{ color:'#1a4f7a', fontWeight:600, textDecoration:'none' }}>Login Karen / Login</Link>
              <Link to="/complaints/new" style={{ color:'#1a4f7a', fontWeight:600, textDecoration:'none' }}>Nayi Shikayat / New Complaint</Link>
            </div>
          </div>
        </form>
      </div>

      <div style={{ maxWidth:560, margin:'0 auto', padding:'24px 16px' }}>
        {/* Not found */}
        {notFound && (
          <div style={{ background:'#fdeaea', border:'1px solid #f5c1c1', borderRadius:12, padding:'16px 20px', color:'#b03030', fontSize:13 }}>
            ❌ Shikayat ID "{query}" nahi mili. Sahi ID check karen.
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', overflow:'hidden' }}>
            {/* Status header */}
            <div style={{ background:'#e8f2fb', padding:'16px 20px', borderBottom:'1px solid #d0e4f7', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'#1a4f7a' }}>{result.complaint_no}</div>
                <div style={{ fontWeight:700, color:'#1a2333', fontSize:15, marginTop:4 }}>{result.complainant_name}</div>
                <div style={{ fontSize:11, color:'#718096', marginTop:2 }}>{result.complaint_type}</div>
              </div>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700, background:STATUS_BG[result.status]||'#f4f5f7', color:STATUS_COLORS[result.status]||'#718096', border:`1px solid ${STATUS_COLORS[result.status]}30` }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:STATUS_COLORS[result.status]||'#718096' }} />
                {t(STATUS_KEYS[result.status]||'statusNew')} / {result.status}
              </span>
            </div>

            {/* Progress steps */}
            <div style={{ padding:'20px', borderBottom:'1px solid #f0f4f9' }}>
              <div style={{ display:'flex', alignItems:'center' }}>
                {STEPS.map((step,i) => {
                  const done    = currentStep > i || result.status === 'Nipatara'
                  const active  = currentStep === i && result.status !== 'Nipatara'
                  return (
                    <div key={step} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
                      {i < STEPS.length-1 && (
                        <div style={{ position:'absolute', top:14, left:'50%', right:'-50%', height:2, background:done?'#2d7d46':'#e2e8f0', zIndex:0 }} />
                      )}
                      <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, zIndex:1, border:`2px solid ${done?'#2d7d46':active?'#1a4f7a':'#e2e8f0'}`, background:done?'#2d7d46':active?'#e8f2fb':'#fff', color:done?'#fff':'inherit' }}>
                        {done ? '✓' : STEP_ICONS[i]}
                      </div>
                      <div style={{ fontSize:9, marginTop:4, textAlign:'center', color:done||active?'#1a2333':'#a0aec0', fontWeight:done||active?600:400, lineHeight:1.3 }}>
                        {lang==='hi'?['नई','नियुक्त','विचाराधीन','निपटारा'][i]:lang==='sat'?['ᱱᱟᱣᱟ','ᱵᱮᱡᱷᱟ','ᱵᱟᱠᱤ','ᱥᱩᱞᱩᱠ'][i]:['New','Assigned','In Progress','Resolved'][i]}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Details */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #f0f4f9' }}>
              {[
                ['Khasra','कसरा / Khasra',result.khasra],
                ['Block','ब्लॉक / Block',result.block||result.district],
                ['Officer','अधिकारी / Officer',result.officer_name||'—'],
                ['Darj Tarikh','दर्ज तारीख / Date',result.created_at?format(new Date(result.created_at),'dd MMM yyyy'):'—'],
                ...(result.resolved_at?[['Nipatara','निपटारा / Resolved',format(new Date(result.resolved_at),'dd MMM yyyy')]]:[] ),
              ].map(([k,label,val]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f8fafc', fontSize:12 }}>
                  <span style={{ color:'#a0aec0' }}>{label}</span>
                  <span style={{ fontWeight:600, color:'#1a2333' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div style={{ padding:'16px 20px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#718096', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:12 }}>
                गतिविधि / Activity / ᱠᱟᱢ
              </div>
              {(result.timeline||[]).map((act,i) => (
                <div key={i} style={{ display:'flex', gap:10, marginBottom:12 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'#f0f4f9', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>
                    {act.action?.includes('Darj')?'📝':act.action?.includes('Niyukt')?'👤':act.action?.includes('Nipatara')?'✅':'💬'}
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#1a2333' }}>{act.action}</div>
                    {act.note && <div style={{ fontSize:11, color:'#718096', marginTop:1 }}>{act.note}</div>}
                    <div style={{ fontSize:10, color:'#a0aec0', marginTop:2 }}>
                      {act.created_at ? format(new Date(act.created_at),'dd MMM yyyy, h:mm a') : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background:'#1a3a52', padding:'10px 24px', display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:24 }}>
        <span>© 2026 Jharkhand Sarkar — Rajaswa Vibhag</span>
        <span>हिंदी | English | ᱥᱟᱱᱛᱟᱲᱤ</span>
      </div>
    </div>
  )
}
