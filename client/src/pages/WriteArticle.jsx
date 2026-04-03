import React, { useState, useEffect } from 'react'
import { Sparkles, Edit, ChevronDown, ChevronUp, Upload, Trash2, BookOpen, FileText } from 'lucide-react'
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
  const [publish, setPublish] = useState(true)

  // RAG state
  const [knowledgeBaseOpen, setKnowledgeBaseOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(false)
  const [docsLoading, setDocsLoading] = useState(false)

  const { getToken } = useAuth()

  // Fetch user's documents on mount
  const fetchDocuments = async () => {
    try {
      setDocsLoading(true)
      const { data } = await axios.get('/api/ai/documents', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setDocsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('document', file)

      const { data } = await axios.post('/api/ai/upload-document', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (data.success) {
        toast.success(`"${data.document.filename}" uploaded and indexed`)
        setDocuments(prev => [data.document, ...prev])
      } else {
        toast.error(data.message || 'Upload failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteDocument = async (docId) => {
    try {
      const { data } = await axios.delete(`/api/ai/documents/${docId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId))
        toast.success('Document removed')
      }
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }

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
    publish,
    useKnowledgeBase,
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

        {/* Knowledge Base Panel */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setKnowledgeBaseOpen(!knowledgeBaseOpen)}
            className="w-full px-6 py-3 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[#4A7AFF]" />
              <span className="text-sm font-semibold">Knowledge Base</span>
              <span className="text-xs text-gray-400 ml-1">
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </span>
            </div>
            {knowledgeBaseOpen
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />
            }
          </button>

          {knowledgeBaseOpen && (
            <div className="px-6 pb-4 border-t border-gray-100">
              <p className="mt-3 text-xs text-gray-500">
                Upload reference documents (PDF or TXT). Their content will be used to ground your articles in your own data.
              </p>

              {/* Upload area */}
              <label className="mt-3 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                {uploading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin border-blue-500"></span>
                ) : (
                  <Upload className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-xs text-gray-500">
                  {uploading ? 'Processing document...' : 'Click to upload PDF or TXT'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleDocumentUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {/* Document list */}
              {docsLoading ? (
                <p className="mt-3 text-xs text-gray-400">Loading documents...</p>
              ) : documents.length > 0 ? (
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-700 truncate">{doc.filename}</span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {doc.chunk_count} chunk{doc.chunk_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-gray-400 text-center">No documents yet</p>
              )}
            </div>
          )}
        </div>

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

            {/* USE KNOWLEDGE BASE TOGGLE */}
            {documents.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useKnowledgeBase}
                  onChange={() => setUseKnowledgeBase(!useKnowledgeBase)}
                  id="ragToggle"
                  className="w-5 h-5 accent-blue-600"
                />
                <label htmlFor="ragToggle" className="text-sm text-slate-600">
                  Use knowledge base as reference
                </label>
              </div>
            )}

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
                  <p>Enter a topic and click "Generate article" to get started</p>
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
