import CardNav from './CardNav'
import { useNavigate } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { assets } from '../assets/assets'
import { ArrowRight } from 'lucide-react'

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const Navbar = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { openSignIn } = useClerk()

  const items = [
    {
      label: 'AI Tools',
      bgColor: '#0D0716',
      textColor: '#fff',
      links: [
        {
          label: 'Explore Tools',
          ariaLabel: 'Go to AI Tools',
          onClick: () => {
            navigate('/')
            setTimeout(() => scrollTo('ai-tools'), 50)
          },
        },
      ],
    },
    {
      label: 'Testimonials',
      bgColor: '#170D27',
      textColor: '#fff',
      links: [
        {
          label: 'What users say',
          ariaLabel: 'Go to Testimonials',
          onClick: () => {
            navigate('/')
            setTimeout(() => scrollTo('testimonials'), 50)
          },
        },
      ],
    },
    {
      label: 'Billing',
      bgColor: '#271E37',
      textColor: '#fff',
      links: [
        {
          label: 'View Plans',
          ariaLabel: 'Go to Billing',
          onClick: () => {
            navigate('/')
            setTimeout(() => scrollTo('billing'), 50)
          },
        },
      ],
    },
  ]

  return (
    <div className="fixed top-0 z-50 w-full backdrop-blur-2xl px-4 sm:px-20 xl:px-32">
      <div className="flex items-center justify-between py-3">
        
        {/* Left: Logo */}
        <img
          src={assets.logo}
          alt="logo"
          className="w-32 sm:w-44 cursor-pointer"
          onClick={() => navigate('/')}
        />

        {/* Center: CardNav */}
        <CardNav
          logo={null}
          items={items}
          baseColor="#ffffff"
          menuColor="#000000"
          buttonBgColor="#111111"
          buttonTextColor="#ffffff"
          ease="power3.out"
        />

        {/* Right: Auth */}
        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-8 py-2.5"
          >
            Login / Signup <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar
