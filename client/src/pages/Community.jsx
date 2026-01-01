import { useAuth, useUser } from '@clerk/clerk-react'
import React, { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { dummyPublishedCreationData } from '../assets/assets'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const Community = () => {
  const [creations, setCreations] = useState([])
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const {getToken} = useAuth()

  const fetchCreations = async () => {
   try{
    const {data} = await axios.get('/api/user/get-published-creations',{
      headers: {
        Authorization: `Bearer ${await getToken()}`
      }
    })
    if(data.success){
      setCreations(data.creations)
   }else{
    toast.error(data.message)
   }
} catch(error){
  toast.error(error.response?.data?.message || 'Something went wrong')
}
setLoading(false)
}

  useEffect(() => {
    if (user) fetchCreations()
  }, [user])

  return (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      <h1 className="text-lg font-semibold text-slate-700">Creations</h1>

      <div className="bg-white h-full w-full rounded-xl overflow-y-scroll p-3">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
          {creations.map((creation, index) => (
            <div
              key={index}
              className="relative group inline-block w-full mb-3 rounded-lg overflow-hidden"
            >
              <img
                src={creation.content}
                alt=""
                className="w-full h-full object-cover rounded-lg"
              />

              <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition bg-gradient-to-b from-transparent to-black/80 text-white">
                <p className="text-sm mb-2 line-clamp-2">
                  {creation.prompt}
                </p>

                <div className="flex items-center gap-1">
                  <p>{creation.likes.length}</p>
                  <Heart
                    className={`w-5 h-5 cursor-pointer ${
                      creation.likes.includes(user?.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-white'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Community
