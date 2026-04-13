import SmoothScroll from '../context/SmoothScroll'
import CustomCursor from '../components/landing/CustomCursor'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Stats from '../components/landing/Stats'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Security from '../components/landing/Security'
import CTA from '../components/landing/CTA'
import Footer from '../components/landing/Footer'
import FloatingIcons from '../components/landing/FloatingIcons'

export default function Landing({ onLaunchApp, onConnectWallet }) {
  return (
    <SmoothScroll>
      <div className="relative">
        <FloatingIcons />
        <CustomCursor />
        <Navbar onLaunchApp={onLaunchApp} onConnectWallet={onConnectWallet} />
        <Hero onLaunchApp={onLaunchApp} onConnectWallet={onConnectWallet} />
        <Stats />
        <Features />
        <HowItWorks />
        <Security />
        <CTA onLaunchApp={onLaunchApp} />
        <Footer />
      </div>
    </SmoothScroll>
  )
}
