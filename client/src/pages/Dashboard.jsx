import React from 'react'
import { Protect } from '@clerk/clerk-react'
import { Sparkles, Hash } from 'lucide-react'
import CreationItem from '../components/CreationItem'
import { dummyCreationData } from '../assets/assets'

const Dashboard = () => {
  const creations = dummyCreationData

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 space-y-6 max-w-6xl mx-auto">

        <div className="flex gap-4">

          <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
            <div className="text-slate-600">
              <p className="text-sm">Total Creations</p>
              <h2 className="text-xl font-semibold">{creations.length}</h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3C81F6] to-[#9234EA] text-white flex justify-center items-center">
              <Hash className="w-5 text-white" />
            </div>
          </div>

          <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
            <div className="text-slate-600">
              <p className="text-sm">Active Plan</p>
              <h2 className="text-xl font-semibold">
                <Protect plan="premium" fallback="Free">
                  Premium
                </Protect>
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center">
              <Sparkles className="w-5 text-white" />
            </div>
          </div>

        </div>

        <div className="space-y-3">
          <p className="mt-6 mb-4">Recent Creations</p>
          {creations.map(item => (
            <CreationItem key={item.id} item={item} />
          ))}
        </div>

      </div>
    </div>
  )
}

export default Dashboard
