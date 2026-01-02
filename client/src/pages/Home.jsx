import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AiTools from '../components/AiTools'
import Testimonials from '../components/Testimonials'
import Plans from '../components/Plans'
import Footer from '../components/Footer'
import Aurora from '../components/Aurora'

const Home = () => {
  return (
    <div className="relative w-full overflow-hidden bg-black">
      
      {/* Aurora background for ENTIRE home */}
      <div className="fixed inset-0 -z-0">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      {/* All content on top */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <AiTools />
        <Testimonials />
        <Plans />
        <Footer />
      </div>

    </div>
  )
}

export default Home
