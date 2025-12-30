import React, { useState } from 'react'
import { Scissors } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const RemoveObject = () => {
  const [file, setFile] = useState(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!file || !description) {
      toast.error('Please upload image and describe object')
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('image', file)
      formData.append('object', description)

      const { data } = await axios.post(
        '/api/ai/remove-object',
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
      <div className="p-6 max-w-6xl mx-auto text-slate-700">
        <div className="flex flex-wrap gap-6 items-start">

          {/* LEFT */}
          <form
            onSubmit={onSubmitHandler}
            className="w-full max-w-lg p-6 bg-white rounded-lg border border-gray-200 flex flex-col"
          >
            <div className="flex items-center gap-3">
              <Scissors className="w-5 h-5 text-[#6D5CFF]" />
              <h1 className="text-xl font-semibold">Object Removal</h1>
            </div>

            <p className="mt-6 text-sm font-medium">Upload image</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-2 w-full text-sm border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0 file:text-sm file:font-medium
              file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />

            <p className="mt-6 text-sm font-medium">Describe object to remove</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. car in background, tree behind person"
              rows={4}
              className="mt-2 w-full p-3 text-sm rounded-md border border-gray-300 outline-none resize-none"
            />

            <div className="mt-auto pt-6">
              <button
                disabled={loading}
                type="submit"
                className="w-full py-2 rounded-md bg-gradient-to-r from-[#4F7CFF] to-[#7B5CFF] text-white text-sm font-medium flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
                )}
                Remove object
              </button>
            </div>
          </form>

          {/* RIGHT */}
          <div className="flex-1 min-w-[280px] max-w-lg p-6 bg-white rounded-lg border border-gray-200 flex flex-col">
            <div className="flex items-center gap-3">
              <Scissors className="w-5 h-5 text-[#6D5CFF]" />
              <h1 className="text-xl font-semibold">Processed Image</h1>
            </div>

            {!content ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm text-center">
                Upload image and describe object to remove
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

export default RemoveObject
