import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import App from './App'

const DONE_KEY = 'localweather-pro_onboarded_v1'
type Phase = 'splash' | 'onboard' | 'app'

export default function AppWrapper() {
  const [phase, setPhase] = useState<Phase>('splash')
  const features = ["Offline almanac data", "Sunrise and sunset times", "Moon phase calendar", "Weather journal"]
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={()=>setPhase(localStorage.getItem(DONE_KEY)?'app':'onboard')} color1="#3b82f6" color2="#2563eb" emoji="🌤️" name="LocalWeather Pro" tagline="Offline weather almanac planner"/>}
      {phase === 'onboard' && <Onboarding onDone={()=>{localStorage.setItem(DONE_KEY,'1');setPhase('app')}} color1="#3b82f6" emoji="🌤️" name="LocalWeather Pro" features={features}/>}
      {phase === 'app' && <App/>}
    </>
  )
}