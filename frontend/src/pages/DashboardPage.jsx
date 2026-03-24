import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

const STATUS_COLORS = {
  'Nayi':'#718096', 'Niyukt':'#3a7fc1',
  'Vichaaradheen':'#c8872a', 'Nipatara':'#2d7d46', 'Viprit':'#b03030'
}
const STATUS_BG = {
  'Nayi':'#f4f5f7', 'Niyukt':'#e8f2fb',
  'Vichaaradheen':'#fdf3e3', 'Nipatara':'#e8f5ec', 'Viprit':'#fdeaea'
}
const STATUS_LABELS = {
  'Nayi':'नई / New', 'Niyukt':'नियुक्त / Assigned',
  'Vichaaradheen':'विचाराधीन / Pending',
  'Nipatara':'निपटारा / Resolved', 'Viprit':'अग्रेषित / Escalated'
}

function StatusBadge({ s }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:STATUS_BG[s]||'#f4f5f7', color:STATUS_COLORS[s]||'#718096' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:STATUS_COLORS[s]||'#718096' }} />
      {s}
    </span>
  )
}

function StatCard({ icon, value, label, sub, color, barColor }) {
  return (
    <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:barColor||color }} />
      <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:28, fontWeight:700, color, lineHeight:1 }}>{value ?? '—'}</div>
      <div style={{ fontSize:12, fontWeight:600, color:'#4a5568', marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'#a0aec0', marginTop:2 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const { user, isStaff }     = useAuth()
  const navigate              = useNavigate()
  const ctx = useOutletContext() || {}

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [ctx.tick])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, gap:12 }}>
      <div style={{ width:32, height:32, border:'3px solid #e2e8f0', borderTop:'3px solid #1a4f7a', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const s           = data?.summary || {}
  const isOfficer   = data?.isOfficer
  const officerInfo = data?.officerInfo

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ marginBottom:16, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize:18, fontWeight:700, color:'#1a2333', margin:0 }}>
            {isOfficer ? `${officerInfo?.block || ''} Block — Dashboard` : 'Dashboard — Sinhavalokan'}
          </h1>
          <p style={{ fontSize:12, color:'#718096', margin:'4px 0 0' }}>
            {isOfficer
              ? `Sirf ${officerInfo?.block} block ki shikayaten dikh rahi hain`
              : 'Deoghar Zila — Rajaswa Vibhag — Poora Overview'}
          </p>
        </div>
        <button onClick={() => navigate('/complaints/new')}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#1a4f7a,#3a7fc1)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', boxShadow:'0 2px 8px rgba(26,79,122,0.25)' }}>
          + Nayi Shikayat
        </button>
      </div>

      {/* ── Officer Block Banner ── */}
      {isOfficer && officerInfo && (
        <div style={{ display:'flex', alignItems:'center', gap:12, background:'linear-gradient(135deg,#1a4f7a,#3a7fc1)', borderRadius:14, padding:'14px 20px', marginBottom:16, color:'#fff' }}>
          <div style={{ fontSize:28 }}>🗺️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:15 }}>
              {officerInfo.block} Block — Aapka Karyakshetra
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)', marginTop:2 }}>
              Aapko sirf is block ki shikayaten dikhti hain | Deoghar Zila | Jharkhand
            </div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>Logged in as</div>
            <div style={{ fontWeight:600, fontSize:13 }}>{user?.name}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>{user?.designation}</div>
          </div>
        </div>
      )}

      {/* ── Metric Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        <StatCard icon="📁" value={s.total||0}
          label={isOfficer ? `${officerInfo?.block} Block — Kul` : 'Kul Shikayaten'}
          sub={`+${s.this_month||0} is maah`} color="#1a4f7a" barColor="linear-gradient(90deg,#1a4f7a,#3a7fc1)" />
        <StatCard icon="⏳"
          value={(+s.vichaaradheen||0)+(+s.nayi||0)+(+s.niyukt||0)}
          label="Vichaaradheen" sub="Nipatara baaki" color="#c8872a" barColor="#c8872a" />
        <StatCard icon="✅" value={s.nipatara||0}
          label="Nipatara Ho Gaya"
          sub={`${s.total?Math.round((+s.nipatara||0)/s.total*100):0}% nipatara dar`}
          color="#2d7d46" barColor="#2d7d46" />
        <StatCard icon="🕐" value={s.avg_days||'—'}
          label="Avg Samay (Din)" sub="Lakshya: 21 din" color="#4a5568" barColor="#718096" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginBottom:14 }}>

        {/* Type chart */}
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', padding:'20px' }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#1a2333' }}>Prakar ke Anusar Shikayaten</div>
            <div style={{ fontSize:11, color:'#a0aec0' }}>
              {isOfficer ? `${officerInfo?.block} Block` : 'Deoghar Zila'} — Complaint Types
            </div>
          </div>
          {(data?.byType || []).length === 0 ? (
            <div style={{ textAlign:'center', color:'#a0aec0', padding:'40px 0', fontSize:13 }}>📭 Koi data nahi</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.byType?.slice(0,6)||[]} layout="vertical" margin={{left:110,right:20}}>
                <XAxis type="number" tick={{fontSize:10}} />
                <YAxis type="category" dataKey="complaint_type" tick={{fontSize:10}} width={110}
                  tickFormatter={v => v.length > 22 ? v.slice(0,22)+'…' : v} />
                <Tooltip formatter={v=>[`${v} shikayaten`,'Count']} />
                <Bar dataKey="count" radius={[0,6,6,0]}>
                  {(data?.byType||[]).map((_,i) => (
                    <Cell key={i} fill={['#1a4f7a','#3a7fc1','#7babdb','#b5d4f0','#c8872a','#2d7d46'][i%6]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status breakdown */}
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', padding:'20px' }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#1a2333' }}>Status Vibhajan</div>
            <div style={{ fontSize:11, color:'#a0aec0' }}>स्थिति / Status / ᱵᱟᱠᱤ</div>
          </div>
          {['Nayi','Niyukt','Vichaaradheen','Nipatara','Viprit'].map(key => {
            const count = +s[key.toLowerCase()]||0
            const pct   = s.total ? Math.round(count/s.total*100) : 0
            return (
              <div key={key} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                  <span style={{ color:'#4a5568', fontWeight:500 }}>{STATUS_LABELS[key]}</span>
                  <span style={{ color:STATUS_COLORS[key], fontWeight:700 }}>{count}</span>
                </div>
                <div style={{ height:6, background:'#f0f4f9', borderRadius:10, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:STATUS_COLORS[key], borderRadius:10, transition:'width 0.5s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Block Chart + Recent complaints ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:14, marginBottom:14 }}>

        {/* Block breakdown — admin only meaningful, officer sees his block */}
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', padding:'20px' }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#1a2333' }}>
              {isOfficer ? 'Prakar Anusar' : 'Block-wise Shikayaten'}
            </div>
            <div style={{ fontSize:11, color:'#a0aec0' }}>ब्लॉक अनुसार / Block-wise</div>
          </div>
          {(data?.byDistrict||[]).length === 0 ? (
            <div style={{ textAlign:'center', color:'#a0aec0', padding:'30px 0', fontSize:13 }}>📭 Koi data nahi</div>
          ) : (
            (data?.byDistrict||[]).slice(0,8).map(({district, count}, i) => {
              const max = data?.byDistrict?.[0]?.count||1
              return (
                <div key={district||i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span style={{ width:82, fontSize:11, color:'#4a5568', flexShrink:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {district||'—'}
                  </span>
                  <div style={{ flex:1, height:8, background:'#f0f4f9', borderRadius:10, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${Math.round((count/max)*100)}%`, background:`hsl(${210+i*12},55%,${42+i*4}%)`, borderRadius:10 }} />
                  </div>
                  <span style={{ fontSize:11, color:'#718096', width:20, textAlign:'right', flexShrink:0 }}>{count}</span>
                </div>
              )
            })
          )}
        </div>

        {/* Recent complaints */}
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', padding:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#1a2333' }}>
                {isOfficer ? `${officerInfo?.block} — Taza Shikayaten` : 'Taza Shikayaten'}
              </div>
              <div style={{ fontSize:11, color:'#a0aec0' }}>ताज़ा शिकायतें / Recent / ᱱᱟᱣᱟ ᱦᱚᱲ</div>
            </div>
            <button onClick={() => navigate('/complaints')}
              style={{ padding:'5px 14px', borderRadius:8, border:'1px solid #e2e8f0', background:'#f8fafc', fontSize:12, cursor:'pointer', color:'#4a5568' }}>
              Sab Dekhen →
            </button>
          </div>

          {(data?.recentComplaints||[]).length === 0 ? (
            <div style={{ textAlign:'center', color:'#a0aec0', padding:'40px 0', fontSize:13 }}>
              📭 {isOfficer ? 'Aapke block mein koi shikayat nahi' : 'Koi shikayat nahi'}
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #f0f4f9' }}>
                    {['ID','Naam','Block/Thana','Tarikh','Status'].map(h => (
                      <th key={h} style={{ padding:'6px 10px', textAlign:'left', fontSize:10, fontWeight:700, color:'#718096', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentComplaints||[]).map(c => (
                    <tr key={c.id||c.complaint_no}
                      onClick={() => c.id && navigate(`/complaints/${c.id}`)}
                      style={{ borderBottom:'1px solid #f8fafc', cursor:'pointer', transition:'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'9px 10px' }}>
                        <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#1a4f7a', background:'#e8f2fb', padding:'2px 6px', borderRadius:4 }}>
                          {c.complaint_no}
                        </span>
                      </td>
                      <td style={{ padding:'9px 10px', fontWeight:500, color:'#1a2333' }}>{c.complainant_name}</td>
                      <td style={{ padding:'9px 10px', color:'#718096', fontSize:11 }}>
                        {c.block || c.district}
                        {c.thana && <span style={{ color:'#a0aec0', fontSize:10, display:'block' }}>{c.thana}</span>}
                      </td>
                      <td style={{ padding:'9px 10px', color:'#a0aec0', whiteSpace:'nowrap' }}>
                        {c.created_at ? format(new Date(c.created_at),'dd MMM') : '—'}
                      </td>
                      <td style={{ padding:'9px 10px' }}><StatusBadge s={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Officer workload ── */}
      <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', padding:'20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'#1a2333' }}>
              {isOfficer ? 'Aapka Performance' : 'Adhikari Karyabhaar'}
            </div>
            <div style={{ fontSize:11, color:'#a0aec0' }}>
              {isOfficer ? 'Sirf aapka data' : 'Sab officers — अधिकारी कार्यभार'}
            </div>
          </div>
          {!isOfficer && (
            <button onClick={() => navigate('/officers')}
              style={{ padding:'5px 14px', borderRadius:8, border:'1px solid #e2e8f0', background:'#f8fafc', fontSize:12, cursor:'pointer', color:'#4a5568' }}>
              Sab Officers →
            </button>
          )}
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
                {['Adhikari','Padh','Block','Active','Nipatara','Avg Din','Nipatara Dar'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:'#718096', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.officerStats||[]).map((o, i) => {
                const total = (+o.active_count||0) + (+o.total_resolved||0)
                const pct   = total ? Math.round((+o.total_resolved||0)/total*100) : 0
                const barColor = pct >= 70 ? '#2d7d46' : pct >= 40 ? '#c8872a' : '#b03030'
                return (
                  <tr key={i} style={{ borderBottom:'1px solid #f8fafc' }}>
                    <td style={{ padding:'10px 12px', fontWeight:600, color:'#1a2333' }}>{o.name}</td>
                    <td style={{ padding:'10px 12px', color:'#718096' }}>{o.designation}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ background:'#e8f2fb', color:'#1a4f7a', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                        {o.district}
                      </span>
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ background:'#fdf3e3', color:'#c8872a', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                        {o.active_count||0}
                      </span>
                    </td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ background:'#e8f5ec', color:'#2d7d46', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                        {o.total_resolved||0}
                      </span>
                    </td>
                    <td style={{ padding:'10px 12px', color:'#718096' }}>{o.avg_days||'—'}d</td>
                    <td style={{ padding:'10px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:70, height:6, background:'#f0f4f9', borderRadius:10, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:barColor, borderRadius:10 }} />
                        </div>
                        <span style={{ fontSize:11, color:barColor, fontWeight:600 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
