import { useState, useEffect } from 'react'
import { Sun, Moon, Sunrise, Sunset, Wind, Eye, Clock, MapPin, Calendar } from 'lucide-react'

const ACCENT = '#3b82f6'

function getSunTimes(lat: number, lon: number, date: Date) {
  const rad = Math.PI / 180
  const n = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const J = 2451545.0 + (n - 0.5) - lon / 360
  const M = (357.5291 + 0.98560028 * (J - 2451545)) % 360
  const C = 1.9148 * Math.sin(M * rad) + 0.0200 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad)
  const lam = (M + C + 180 + 102.9372) % 360
  const Jtransit = 2451545.5 + 0.0009 + lon / 360 + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lam * rad)
  const decl = Math.asin(Math.sin(lam * rad) * Math.sin(23.45 * rad))
  const cosH = (Math.sin(-0.83 * rad) - Math.sin(lat * rad) * Math.sin(decl)) / (Math.cos(lat * rad) * Math.cos(decl))
  if (Math.abs(cosH) > 1) return null
  const H = Math.acos(cosH) / rad
  const Jrise = Jtransit - H / 360
  const Jset = Jtransit + H / 360
  function jdToDate(jd: number) {
    const ms = (jd - 2440587.5) * 86400000
    return new Date(ms)
  }
  return { rise: jdToDate(Jrise), set: jdToDate(Jset) }
}

function getMoonPhase(date: Date): { phase: number; name: string; emoji: string } {
  const EPOCH = new Date(2000, 0, 6).getTime()
  const CYCLE = 29.530588853 * 86400000
  const phase = ((date.getTime() - EPOCH) % CYCLE + CYCLE) % CYCLE / CYCLE
  const phases = [
    { max: 0.033, name: 'New Moon', emoji: '🌑' },
    { max: 0.233, name: 'Waxing Crescent', emoji: '🌒' },
    { max: 0.283, name: 'First Quarter', emoji: '🌓' },
    { max: 0.467, name: 'Waxing Gibbous', emoji: '🌔' },
    { max: 0.533, name: 'Full Moon', emoji: '🌕' },
    { max: 0.717, name: 'Waning Gibbous', emoji: '🌖' },
    { max: 0.767, name: 'Third Quarter', emoji: '🌗' },
    { max: 0.967, name: 'Waning Crescent', emoji: '🌘' },
    { max: 1.001, name: 'New Moon', emoji: '🌑' },
  ]
  const p = phases.find(p => phase < p.max) || phases[0]
  return { phase, name: p.name, emoji: p.emoji }
}

function fmtTime(d: Date) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
function dayLength(rise: Date, set: Date) {
  const diff = set.getTime() - rise.getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return h + 'h ' + m + 'm'
}

const SEASONS = ['Winter', 'Spring', 'Summer', 'Autumn']
function getSeason(lat: number, month: number) {
  const m = (month + 1) % 12
  const north = lat >= 0
  if (m < 2 || m === 11) return north ? SEASONS[0] : SEASONS[2]
  if (m < 5) return north ? SEASONS[1] : SEASONS[3]
  if (m < 8) return north ? SEASONS[2] : SEASONS[0]
  return north ? SEASONS[3] : SEASONS[1]
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function App() {
  const [lat, setLat] = useState<number | null>(null)
  const [lon, setLon] = useState<number | null>(null)
  const [locName, setLocName] = useState('')
  const [manualLat, setManualLat] = useState('')
  const [manualLon, setManualLon] = useState('')
  const [locError, setLocError] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [tab, setTab] = useState<'today' | 'calendar' | 'moon'>('today')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const saved = localStorage.getItem('lw_loc')
    if (saved) { const l = JSON.parse(saved); setLat(l.lat); setLon(l.lon); setLocName(l.name) }
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  function geolocate() {
    navigator.geolocation.getCurrentPosition(pos => {
      setLat(pos.coords.latitude)
      setLon(pos.coords.longitude)
      setLocName('My Location')
      localStorage.setItem('lw_loc', JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude, name: 'My Location' }))
      setLocError('')
    }, () => setLocError('Location access denied'))
  }

  function applyManual() {
    const la = parseFloat(manualLat), lo = parseFloat(manualLon)
    if (isNaN(la) || isNaN(lo)) { setLocError('Invalid coordinates'); return }
    setLat(la); setLon(lo); setLocName(`${la.toFixed(2)}, ${lo.toFixed(2)}`)
    localStorage.setItem('lw_loc', JSON.stringify({ lat: la, lon: lo, name: `${la.toFixed(2)}, ${lo.toFixed(2)}` }))
    setLocError('')
  }

  if (lat === null) return (
    <div style={{ background: '#030711', minHeight: '100vh', fontFamily: 'Inter,sans-serif', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#0f1c3a', borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 380, textAlign: 'center', boxShadow: '0 20px 60px rgba(59,130,246,0.2)' }}>
        <Sun size={44} style={{ color: ACCENT, marginBottom: '1rem' }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>LocalWeather</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Offline almanac — no internet needed after setup</p>
        <button onClick={geolocate} style={{ width: '100%', background: ACCENT, border: 'none', borderRadius: 12, padding: '0.9rem', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><MapPin size={18} /> Use My Location</button>
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 12 }}>— or enter coordinates manually —</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input value={manualLat} onChange={e => setManualLat(e.target.value)} placeholder="Latitude (e.g. 48.8)" style={{ flex: 1, background: '#1e3a6e', border: '1px solid #2d5a9e', borderRadius: 8, padding: '0.6rem', color: '#fff', fontSize: 13 }} />
          <input value={manualLon} onChange={e => setManualLon(e.target.value)} placeholder="Longitude (e.g. 2.35)" style={{ flex: 1, background: '#1e3a6e', border: '1px solid #2d5a9e', borderRadius: 8, padding: '0.6rem', color: '#fff', fontSize: 13 }} />
        </div>
        <button onClick={applyManual} style={{ width: '100%', background: '#1e3a6e', border: 'none', borderRadius: 12, padding: '0.8rem', color: ACCENT, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Apply Coordinates</button>
        {locError && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10 }}>{locError}</p>}
      </div>
    </div>
  )

  const date = new Date(selectedDate + 'T12:00:00')
  const sun = getSunTimes(lat as number, lon as number, date)
  const moon = getMoonPhase(date)
  const season = getSeason(lat, date.getMonth())
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const weekOfYear = Math.ceil(dayOfYear / 7)

  // Generate month calendar data
  const monthDays = Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }, (_, i) => {
    const d = new Date(date.getFullYear(), date.getMonth(), i + 1, 12)
    return { day: i + 1, moon: getMoonPhase(d), sun: getSunTimes(lat as number, lon as number, d) }
  })

  return (
    <div style={{ background: '#030711', minHeight: '100vh', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
      <div style={{ background: 'linear-gradient(135deg,#0f1c3a,#1e3a6e)', padding: '1.5rem', borderBottom: '1px solid #1e3a6e' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sun size={22} style={{ color: ACCENT }} />
              <span style={{ fontSize: 18, fontWeight: 800 }}>LocalWeather</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => { setLat(null); localStorage.removeItem('lw_loc') }}>
              <MapPin size={13} style={{ color: '#94a3b8' }} />
              <span style={{ color: '#94a3b8', fontSize: 13 }}>{locName}</span>
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 100, color: '#fff', letterSpacing: 2 }}>{fmtTime(time)}</div>
          <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 2 }}>{season} · Week {weekOfYear} · Day {dayOfYear}</div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.2rem' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {(['today', 'calendar', 'moon'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? ACCENT : '#0f1c3a', border: 'none', borderRadius: 10, padding: '0.6rem', color: tab === t ? '#fff' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
              {t === 'today' ? '☀️ Sun' : t === 'calendar' ? '📅 Month' : '🌙 Moon'}
            </button>
          ))}
        </div>

        {tab === 'today' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 6 }}>Select Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ background: '#0f1c3a', border: '1px solid #1e3a6e', borderRadius: 10, padding: '0.6rem 0.9rem', color: '#fff', fontSize: 14 }} />
            </div>
            {sun ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div style={{ background: 'linear-gradient(135deg,#1e3a6e,#0f1c3a)', borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
                    <Sunrise size={28} style={{ color: '#fbbf24', marginBottom: 8 }} />
                    <p style={{ color: '#fbbf24', fontSize: 28, fontWeight: 800 }}>{fmtTime(sun.rise)}</p>
                    <p style={{ color: '#64748b', fontSize: 13 }}>Sunrise</p>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg,#3d1c0f,#1a0f06)', borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
                    <Sunset size={28} style={{ color: '#f97316', marginBottom: 8 }} />
                    <p style={{ color: '#f97316', fontSize: 28, fontWeight: 800 }}>{fmtTime(sun.set)}</p>
                    <p style={{ color: '#64748b', fontSize: 13 }}>Sunset</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div style={{ background: '#0f1c3a', borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
                    <Clock size={18} style={{ color: ACCENT, marginBottom: 6 }} />
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{dayLength(sun.rise, sun.set)}</p>
                    <p style={{ color: '#64748b', fontSize: 12 }}>Daylight</p>
                  </div>
                  <div style={{ background: '#0f1c3a', borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
                    <span style={{ fontSize: 24 }}>{moon.emoji}</span>
                    <p style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{moon.name.split(' ').slice(-1)[0]}</p>
                    <p style={{ color: '#64748b', fontSize: 12 }}>Moon</p>
                  </div>
                  <div style={{ background: '#0f1c3a', borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
                    <Calendar size={18} style={{ color: '#22c55e', marginBottom: 6 }} />
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{season}</p>
                    <p style={{ color: '#64748b', fontSize: 12 }}>Season</p>
                  </div>
                </div>
              </div>
            ) : <p style={{ color: '#ef4444' }}>Polar: no sunrise/sunset this day</p>}
          </div>
        )}

        {tab === 'calendar' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{MONTH_NAMES[date.getMonth()]} {date.getFullYear()}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} style={{ textAlign: 'center', color: '#475569', fontSize: 11, padding: '0.3rem' }}>{d}</div>)}
              {Array(new Date(date.getFullYear(), date.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={'e' + i} />)}
              {monthDays.map(({ day, moon: m, sun: s }) => {
                const isToday = new Date().getDate() === day && new Date().getMonth() === date.getMonth() && new Date().getFullYear() === date.getFullYear()
                return (
                  <div key={day} onClick={() => setSelectedDate(new Date(date.getFullYear(), date.getMonth(), day, 12).toISOString().split('T')[0])} style={{ background: isToday ? ACCENT : '#0f1c3a', borderRadius: 8, padding: '0.3rem', textAlign: 'center', cursor: 'pointer', border: '1px solid #1e3a6e' }}>
                    <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? '#fff' : '#e2e8f0' }}>{day}</div>
                    <div style={{ fontSize: 10 }}>{m.emoji}</div>
                    {s && <div style={{ fontSize: 8, color: '#fbbf24' }}>{fmtTime(s.rise).replace(' AM', '')}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'moon' && (
          <div>
            <div style={{ background: '#0f1c3a', borderRadius: 20, padding: '2rem', textAlign: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 72 }}>{moon.emoji}</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 12 }}>{moon.name}</h2>
              <div style={{ background: '#1e3a6e', borderRadius: 20, height: 8, margin: '1rem auto', maxWidth: 300, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: (moon.phase * 100) + '%', background: '#fbbf24', borderRadius: 20 }} />
              </div>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>{Math.round(moon.phase * 100)}% through lunar cycle</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {['🌑', '🌓', '🌕', '🌗'].map((e, i) => {
                const names = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter']
                return <div key={i} style={{ background: '#0f1c3a', borderRadius: 12, padding: '0.8rem', textAlign: 'center' }}><span style={{ fontSize: 24 }}>{e}</span><p style={{ color: '#64748b', fontSize: 11, marginTop: 6 }}>{names[i]}</p></div>
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
