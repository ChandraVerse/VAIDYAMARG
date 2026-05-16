import Hero         from '../components/sections/Hero'
import HowItWorks  from '../components/sections/HowItWorks'
import Features    from '../components/sections/Features'
import SavingsCalc from '../components/sections/SavingsCalc'
import Testimonials from '../components/sections/Testimonials'
import DownloadCTA from '../components/sections/DownloadCTA'

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <SavingsCalc />
      <Testimonials />
      <DownloadCTA />
    </>
  )
}
