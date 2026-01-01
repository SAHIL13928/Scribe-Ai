import React, { useState } from 'react'
import { Sparkles, Edit } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const articleLength = [
  { length: 800, text: 'Short (500-800 words)' },
  { length: 1200, text: 'Medium (800-1200 words)' },
  { length: 1600, text: 'Long (1200+ words)' }
]

const WriteArticle = () => {
  const [selectedLength, setSelectedLength] = useState(articleLength[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [publish, setPublish] = useState(true) // New toggle for dashboard

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)

const prompt = `
Write a comprehensive, well-structured article on "${input}".

STRICT REQUIREMENTS:
- The article MUST be at least ${selectedLength.length - 100} words
- The article MUST NOT be shorter than this
- Use headings, subheadings, and detailed explanations
- Do NOT summarize briefly
- Expand each section properly

Begin the article now.
`;

      const { data } = await axios.post(
  '/api/ai/generate-article',
  {
    prompt,
    length: selectedLength.length,
    publish
  },
  {
    headers: {
      Authorization: `Bearer ${await getToken()}`
    }
  }
)


      if (data.success) {
        setContent(data.content)

        // Save to backend if publish toggle is on
        if (publish) {
          await axios.post(
            '/api/user/save-creation',
            {
              title: input,
              content: data.content,
              type: 'article'
            },
            {
              headers: { Authorization: `Bearer ${await getToken()}` }
            }
          )
        }
      } else {
        toast.error(data.message || 'Something went wrong')
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
              <Sparkles className="w-6 text-[#4A7AFF]" />
              <h1 className="text-xl font-semibold">Article Configuration</h1>
            </div>

            <p className="mt-6 text-sm font-medium">Article Topic</p>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="The future of artificial intelligence is..."
              required
              className="w-full p-2 px-3 mt-2 text-sm rounded-md border border-gray-300 outline-none"
            />

            <p className="mt-6 text-sm font-medium">Article Length</p>

            <div className="mt-3 flex gap-3 flex-wrap">
              {articleLength.map((item, index) => (
                <span
                  key={index}
                  onClick={() => setSelectedLength(item)}
                  className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                    selectedLength.text === item.text
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'text-gray-500 border-gray-300'
                  }`}
                >
                  {item.text}
                </span>
              ))}
            </div>

            {/* PUBLISH TO DASHBOARD TOGGLE */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={publish}
                onChange={() => setPublish(!publish)}
                id="publishToggle"
                className="w-5 h-5 accent-blue-600"
              />
              <label htmlFor="publishToggle" className="text-sm text-slate-600">
                Publish this article on dashboard
              </label>
            </div>

            <div className="mt-auto pt-6">
              <button
                disabled={loading}
                type="submit"
                className="w-full py-2 rounded-md bg-gradient-to-r from-[#4A7AFF] to-[#7B4DFF] text-white text-sm font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
                ) : (
                  <Edit className="w-5" />
                )}
                Generate Article
              </button>
            </div>
          </form>

          <div className="w-full max-w-lg p-6 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[420px]">
            <div className="flex items-center gap-3">
              <Edit className="w-5 h-5 text-[#4A7AFF]" />
              <h1 className="text-xl font-semibold">Generated article</h1>
            </div>

            {!content ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="text-sm flex flex-col items-center gap-5 text-gray-400 text-center">
                  <Edit className="w-9 h-9" />
                  <p>Enter a topic and click “Generate article” to get started</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 max-h-[340px] overflow-y-auto">
                <div className='reset-tw'>
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

export default WriteArticle
