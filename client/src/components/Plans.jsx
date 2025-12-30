import React from 'react'
import { PricingTable } from '@clerk/clerk-react'

const Plans = () => {
  return (
    <div className="px-4 sm:px-20 xl:px-32 my-24">
      
      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-slate-700 text-[42px] font-semibold">
          Simple, transparent pricing
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Choose a plan that fits your needs. Upgrade or cancel anytime.
        </p>
      </div>

      {/* Clerk Pricing Table */}
      <div className="flex justify-center">
        <PricingTable />
      </div>

    </div>
  )
}

export default Plans
