interface Props { onDone: () => void; color1: string; emoji: string; name: string; features: string[] }
export default function Onboarding({ onDone, color1, emoji, name, features }: Props) {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px',background:'#080810'}}>
      <div style={{fontSize:'56px',marginBottom:'16px'}}>{emoji}</div>
      <h2 style={{fontSize:'24px',fontWeight:'700',color:'white',marginBottom:'8px',fontFamily:'Inter',textAlign:'center'}}>Welcome to {name}</h2>
      <div style={{display:'flex',flexDirection:'column',gap:'12px',width:'100%',maxWidth:'320px',margin:'24px 0'}}>
        {features.map((f,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderRadius:'12px',background:'#0e0e20',border:'1px solid #1e1b4b'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:color1,flexShrink:0}}/>
            <span style={{fontSize:'14px',color:'#c4b5fd'}}>{f}</span>
          </div>
        ))}
      </div>
      <button onClick={onDone} style={{padding:'14px 40px',borderRadius:'14px',background:color1,border:'none',color:'white',fontSize:'16px',fontWeight:'700',cursor:'pointer',fontFamily:'Inter',boxShadow:'0 8px 24px '+color1+'40'}}>
        Get Started
      </button>
    </div>
  )
}