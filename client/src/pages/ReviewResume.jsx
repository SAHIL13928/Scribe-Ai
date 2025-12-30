import React, { useState } from 'react'
import { FileText } from 'lucide-react'
import axios from 'axios'

const ReviewResume = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!file) return

    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const formData = new FormData()
      formData.append('resume', file)

      const { data } = await axios.post(
        'http://localhost:3000/api/ai/resume-review',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true, // 🔑 REQUIRED FOR CLERK AUTH
        }
      )

      if (!data.success) {
        setError(data.message)
        return
      }

      setResult(data.content)
    } catch (err) {
      setError(
        err.response?.data?.message || 'Resume review failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto text-slate-700">
        <div className="flex flex-wrap gap-6 items-start">

          {/* LEFT FORM */}
          <form
            onSubmit={onSubmitHandler}
            className="w-full max-w-lg p-6 bg-white rounded-lg border border-gray-200 flex flex-col"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#16A085]" />
              <h1 className="text-xl font-semibold">Resume Review</h1>
            </div>

            <p className="mt-6 text-sm font-medium">Upload Resume</p>

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-2 w-full text-sm border border-gray-300 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-slate-100"
              required
            />

            <p className="mt-2 text-xs text-gray-400">
              Supports PDF, PNG, JPG formats
            </p>

            <div className="mt-auto pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-md bg-gradient-to-r from-[#10B981] to-[#14B8A6] text-white text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Reviewing...' : 'Review Resume'}
              </button>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-500">{error}</p>
            )}
          </form>

          {/* RIGHT RESULT */}
          <div className="flex-1 min-w-[280px] h-[420px] bg-white rounded-lg border border-gray-200 p-6 overflow-y-auto">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FileText className="w-10 h-10 mb-4" />
                <p className="text-sm text-center">
                  Upload your resume and click “Review Resume”
                </p>
              </div>
            )}

            {loading && (
              <p className="text-sm text-gray-500">Analyzing resume...</p>
            )}

            {result && (
              <div className="text-sm whitespace-pre-wrap">
                {result}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default ReviewResume
