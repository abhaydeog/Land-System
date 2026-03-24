import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { t, getLang, setLang } from '../utils/i18n'
import { LayoutDashboard, FileText, PlusSquare, Search, Users, BarChart2, Calendar, Settings, LogOut, Bell, Globe, ChevronDown, Menu, X } from 'lucide-react'

const LANGS = [
  { code: 'hi',  label: 'हिंदी',      flag: '🇮🇳' },
  { code: 'en',  label: 'English',    flag: '🌐' },
  { code: 'sat', label: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🌿' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [lang, setLangState] = useState(getLang())
  const [sideOpen, setSideOpen] = useState(true)
  const [langOpen, setLangOpen] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const handler = () => { setLangState(getLang()); setTick(v => v + 1) }
    window.addEventListener('langchange', handler)
    return () => window.removeEventListener('langchange', handler)
  }, [])

  const changeLang = (code) => { setLang(code); setLangState(code); setLangOpen(false) }

  const navItems = [
    { to: '/dashboard',      icon: LayoutDashboard, key: 'dashboard',     roles: ['admin','officer','public'] },
    { to: '/complaints/new', icon: PlusSquare,      key: 'newComplaint',  roles: ['admin','officer','public'] },
    { to: '/complaints',     icon: FileText,        key: 'allComplaints', roles: ['admin','officer','public'] },
    { to: '/track',          icon: Search,          key: 'trackStatus',   roles: ['admin','officer','public'] },
    { to: '/officers',       icon: Users,           key: 'officers',      roles: ['admin','officer'] },
    { to: '/hearings',       icon: Calendar,        key: 'hearings',      roles: ['admin','officer'] },
    { to: '/reports',        icon: BarChart2,       key: 'reports',       roles: ['admin','officer'] },
    { to: '/settings',       icon: Settings,        key: 'settings',      roles: ['admin'] },
  ].filter(n => n.roles.includes(user?.role))

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const curLang = LANGS.find(l => l.code === lang)

  const S = {
    app: { display:'flex', minHeight:'100vh', background:'#f0f4f9', fontFamily:"'Noto Sans', 'Noto Sans Devanagari', sans-serif" },
    aside: { width: sideOpen ? 248 : 0, minWidth: sideOpen ? 248 : 0, overflow:'hidden', transition:'all 0.25s ease', background:'linear-gradient(170deg, #0d3b5e 0%, #1a4f7a 50%, #1e5f8a 100%)', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:100, boxShadow:'4px 0 24px rgba(0,0,0,0.2)' },
    tribar: { height:4, background:'linear-gradient(90deg, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%)', flexShrink:0 },
    logoArea: { padding:'18px 20px 14px', borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0 },
    logoRow: { display:'flex', alignItems:'center', gap:10, marginBottom:10 },
    logoIcon: { width:42, height:42, borderRadius:10, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 },
    govLabel: { fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'1.5px', textTransform:'uppercase' },
    appTitle: { fontSize:15, fontWeight:700, color:'#fff', lineHeight:1.2 },
    distBadge: { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'5px 10px', fontSize:11, color:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', gap:6 },
    navArea: { flex:1, padding:'10px', overflowY:'auto' },
    userCard: { padding:'10px', borderTop:'1px solid rgba(255,255,255,0.1)', flexShrink:0 },
    userInner: { display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' },
    avatar: { width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg, #FFD700, #FF8C00)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#1a2333', flexShrink:0 },
    main: { marginLeft: sideOpen ? 248 : 0, flex:1, display:'flex', flexDirection:'column', transition:'margin 0.25s ease', minHeight:'100vh' },
    topbar: { background:'#fff', borderBottom:'1px solid #e2e8f0', height:60, display:'flex', alignItems:'center', padding:'0 20px', gap:12, position:'sticky', top:0, zIndex:50, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
    addBtn: { display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, border:'none', background:'linear-gradient(135deg, #1a4f7a, #3a7fc1)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', boxShadow:'0 2px 8px rgba(26,79,122,0.3)', whiteSpace:'nowrap' },
    content: { flex:1, padding:'24px', overflowY:'auto' },
    footer: { background:'#fff', borderTop:'1px solid #e2e8f0', padding:'10px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, color:'#a0aec0' },
  }

  return (
    <div style={S.app}>
      <aside style={S.aside}>
        <div style={S.tribar} />
        <div style={S.logoArea}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}>🏛️</div>
            <div>
              <div style={S.govLabel}>{t('govName')}</div>
              <div style={S.appTitle}>{lang==='sat'?'ᱡᱚᱢᱤᱱ ᱦᱚᱲ':lang==='en'?'Land Portal':'भूमि शिकायत'}</div>
            </div>
          </div>
          <div style={S.distBadge}><span>📍</span><span>{t('districtName')} | Jharkhand</span></div>
        </div>
        <nav style={S.navArea}>
          {navItems.map(({ to, icon: Icon, key }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10,
              marginBottom:2, textDecoration:'none', fontSize:13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderLeft: isActive ? '3px solid #FFD700' : '3px solid transparent',
              transition:'all 0.15s',
            })}>
              <Icon size={15} strokeWidth={2} style={{ flexShrink:0 }} />
              <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t(key)}</span>
            </NavLink>
          ))}
        </nav>
        <div style={S.userCard}>
          <div style={S.userInner}>
            <div style={S.avatar}>{initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', textTransform:'capitalize' }}>{user?.designation||user?.role}</div>
            </div>
            <button onClick={logout} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', padding:4 }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div style={S.main}>
        <header style={S.topbar}>
          <button onClick={() => setSideOpen(v=>!v)} style={{ background:'none', border:'none', cursor:'pointer', color:'#4a5568', padding:6, borderRadius:8, display:'flex' }}>
            {sideOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
          <div style={{ display:'flex', gap:2, marginRight:4 }}>
            {['#FF9933','#FFFFFF','#138808'].map((c,i) => (
              <div key={i} style={{ width:3, height:24, background:c, borderRadius:2, border:i===1?'1px solid #ddd':'none' }} />
            ))}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#1a2333', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {t('districtName')} — {t('dept')}
            </div>
            <div style={{ fontSize:11, color:'#718096' }}>
              {new Date().toLocaleDateString(lang==='en'?'en-IN':'hi-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </div>
          </div>

          {/* Lang Switcher */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <button onClick={() => setLangOpen(v=>!v)} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'1px solid #e2e8f0', background:'#f8fafc', cursor:'pointer', fontSize:12, fontWeight:500, color:'#4a5568' }}>
              <Globe size={13} />
              <span>{curLang?.flag} {curLang?.label}</span>
              <ChevronDown size={11} />
            </button>
            {langOpen && (
              <div style={{ position:'absolute', right:0, top:'calc(100% + 6px)', background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', overflow:'hidden', zIndex:200, minWidth:170 }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => changeLang(l.code)} style={{ display:'block', width:'100%', padding:'9px 16px', textAlign:'left', border:'none', cursor:'pointer', fontSize:13, fontWeight:lang===l.code?700:400, background:lang===l.code?'#e8f2fb':'transparent', color:lang===l.code?'#1a4f7a':'#4a5568' }}>
                    {l.flag} {l.label} {l.code==='sat'&&<span style={{fontSize:10,color:'#999'}}>(Ol Chiki)</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button style={{ width:36, height:36, borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative', flexShrink:0 }}>
            <Bell size={15} color="#4a5568" />
            <span style={{ position:'absolute', top:6, right:6, width:8, height:8, background:'#b03030', borderRadius:'50%', border:'2px solid #fff' }} />
          </button>

          <button onClick={() => navigate('/complaints/new')} style={S.addBtn}>
            <PlusSquare size={14} />
            {t('newComplaint')}
          </button>
        </header>

        <main style={S.content}>
          <Outlet context={{ lang, tick }} />
        </main>

        <footer style={S.footer}>
          <span>© 2026 {t('govName')} — {t('dept')}</span>
          <span>हिंदी | English | ᱥᱟᱱᱛᱟᱲᱤ &nbsp;|&nbsp; v1.0.0</span>
        </footer>
      </div>
    </div>
  )
}
