import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser()

  return user ? (
    <div className="flex flex-col h-screen overflow-hidden">
      
      <nav className="w-full px-8 h-14 flex items-center justify-between border-b border-gray-200 shrink-0">
        <img
          src={assets.logo}
          alt=""
          className="cursor-pointer"
          onClick={() => navigate('/')}
        />

        {sidebar ? (
          <X onClick={() => setSidebar(false)} className="w-6 h-6 text-gray-600 sm:hidden" />
        ) : (
          <Menu onClick={() => setSidebar(true)} className="w-6 h-6 text-gray-600 sm:hidden" />
        )}
      </nav>

      <div className="flex flex-1 w-full min-h-0">
  <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

  <div className="flex-1 bg-[#F4F7FB] min-h-0 overflow-hidden sm:ml-64">
    <Outlet />
  </div>
</div>

    </div>
  ) : (
    <SignIn />
  )
}

export default Layout
