import { useEffect } from 'react'
interface Props { onDone: () => void; color1: string; color2: string; emoji: string; name: string; tagline: string }
export default function SplashScreen({ onDone, color1, color2, emoji, name, tagline }: Props) {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:`radial-gradient(ellipse at 50% 30%, ${color1}20, #080810 70%)`}}>
      <div style={{fontSize:'72px',marginBottom:'20px',filter:'drop-shadow(0 8px 32px '+color1+'60)'}}>{emoji}</div>
      <h1 style={{fontSize:'28px',fontWeight:'800',color:'white',marginBottom:'8px',fontFamily:'Inter'}}>{name}</h1>
      <p style={{fontSize:'14px',color:color1,opacity:0.8,textAlign:'center',maxWidth:'260px',lineHeight:'1.5'}}>{tagline}</p>
      <div style={{marginTop:'40px',width:'40px',height:'3px',borderRadius:'2px',background:color1,opacity:0.6,animation:'pulse 1.5s ease-in-out infinite'}}/>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </div>
  )
}