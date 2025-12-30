import React, { useState } from 'react'
import { Image } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const RemoveBackground = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!file) {
      toast.error('Please upload an image')
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('image', file)

      const { data } = await axios.post(
        '/api/ai/remove-background',
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (data.success) {
        setContent(data.content)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto w-full text-slate-700">
        <div className="flex flex-wrap gap-6 items-start">

          {/* LEFT CARD */}
          <form
            onSubmit={onSubmitHandler}
            className="w-full max-w-lg p-6 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <Image className="w-6 text-orange-500" />
              <h1 className="text-xl font-semibold">Background Removal</h1>
            </div>

            <p className="mt-6 text-sm font-medium">Upload image</p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-2 w-full text-sm border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0 file:text-sm file:font-medium
              file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />

            <button
              disabled={loading}
              type="submit"
              className="mt-6 w-full py-2 rounded-md bg-gradient-to-r from-orange-400 to-orange-600 text-white text-sm font-medium flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
              )}
              Remove background
            </button>
          </form>

          {/* RIGHT CARD */}
          <div className="flex-1 max-w-lg p-6 bg-white rounded-lg border border-gray-200 flex flex-col">
            <div className="flex items-center gap-3">
              <Image className="w-5 text-orange-500" />
              <h1 className="text-xl font-semibold">Processed Image</h1>
            </div>

            {!content ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="flex flex-col items-center gap-4 text-sm text-gray-400 text-center">
                  <Image className="w-9 h-9" />
                  <p>Upload an image and click “Remove background”</p>
                </div>
              </div>
            ) : (
              <div className="mt-3 h-full">
                <img
                  src={content}
                  alt="Processed"
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default RemoveBackground
