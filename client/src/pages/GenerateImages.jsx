import React, { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const styles = [
  'Realistic',
  'Ghibli Style',
  'Anime Style',
  'Cartoon Style',
  '3D Style',
  'Pixel Art',
  'Line Art',
]

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const GenerateImages = () => {
  const [input, setInput] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('Realistic')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const prompt = `Create a ${selectedStyle} image of ${input}`

      const { data } = await axios.post(
        '/api/ai/generate-image',
        { prompt },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )

      if (data.success) {
        setContent(data.content)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto w-full text-slate-700">
        <div className="flex flex-wrap gap-6 items-start">
          <form
            onSubmit={onSubmitHandler}
            className="w-full max-w-lg p-6 bg-white rounded-lg border border-gray-200 flex flex-col"
          >
            <div className="flex items-center gap-3">
              <ImageIcon className="w-6 text-green-500" />
              <h1 className="text-xl font-semibold">AI Image Generator</h1>
            </div>

            <p className="mt-6 text-sm font-medium">Describe Your Image</p>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you want to see in the image..."
              required
              rows={4}
              className="w-full p-2 px-3 mt-2 text-sm rounded-md border border-gray-300 outline-none resize-none"
            />

            <p className="mt-6 text-sm font-medium">Style</p>

            <div className="mt-3 flex gap-3 flex-wrap">
              {styles.map((style) => (
                <span
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                    selectedStyle === style
                      ? 'bg-green-50 text-green-700 border-green-300'
                      : 'text-gray-500 border-gray-300'
                  }`}
                >
                  {style}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-6">
              <button
                disabled={loading}
                type="submit"
                className="w-full py-2 rounded-md bg-green-500 hover:bg-green-600 text-white text-sm font-medium flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
                )}
                Generate Image
              </button>
            </div>
          </form>

          <div className="flex-1 min-w-[280px] max-w-lg p-6 bg-white rounded-lg border border-gray-200 flex flex-col">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-5 text-green-500" />
              <h1 className="text-xl font-semibold">Generated image</h1>
            </div>

            {!content ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                  <ImageIcon className="w-9 h-9" />
                  <p>Describe an image and click “Generate image” to get started</p>
                </div>
              </div>
            ) : (
              <div className="mt-3 h-full">
                <img
                  src={content}
                  alt="Generated"
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

export default GenerateImages
