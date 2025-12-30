import React, { useState } from 'react'
import { Hash, Sparkles, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const categories = [
  'General',
  'Technology',
  'Business',
  'Health',
  'Lifestyle',
  'Education',
  'Travel',
  'Food'
]

const BlogTitles = () => {
  const [input, setInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('General')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const prompt = `Generate a catchy blog title about ${input} in the category of ${selectedCategory}.`
      const { data } = await axios.post(
        '/api/ai/generate-blog-title',
        { prompt },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )
      console.log("API DATA:", data)
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
            className="w-full max-w-lg p-6 bg-white rounded-lg border border-gray-200 flex flex-col min-h-[420px]"
          >
            <div className="flex items-center gap-3">
              <Hash className="w-6 text-[#7C3AED]" />
              <h1 className="text-xl font-semibold">AI Title Generator</h1>
            </div>

            <p className="mt-6 text-sm font-medium">Keyword</p>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="The future of artificial intelligence"
              required
              className="w-full p-2 px-3 mt-2 text-sm rounded-md border border-gray-300 outline-none"
            />

            <p className="mt-6 text-sm font-medium">Category</p>

            <div className="mt-3 flex gap-3 flex-wrap">
              {categories.map((item, index) => (
                <span
                  key={index}
                  onClick={() => setSelectedCategory(item)}
                  className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                    selectedCategory === item
                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                      : 'text-gray-500 border-gray-300'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-6">
              <button
                disabled={loading}
                type="submit"
                className="w-full py-2 rounded-md bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white text-sm font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
                ) : (
                  <Hash className="w-5" />
                )}
                Generate Titles
              </button>
            </div>
          </form>

          <div className="w-full max-w-lg p-6 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[420px]">
            <div className="flex items-center gap-3">
              <Edit className="w-5 h-5 text-[#7C3AED]" />
              <h1 className="text-xl font-semibold">Generated titles</h1>
            </div>

            {!content ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="text-sm flex flex-col items-center gap-5 text-gray-400 text-center">
                  <Edit className="w-9 h-9" />
                  <p>Enter a topic and click “Generate titles” to get started</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 max-h-[340px] overflow-y-auto">
                <div className="reset-tw prose prose-sm max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogTitles
