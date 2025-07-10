
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Upload, FileText, Mail, Phone } from 'lucide-react'

interface ApplicantsProps {
  user: any
}

const Applicants: React.FC<ApplicantsProps> = ({ user }) => {
  const [applicants, setApplicants] = useState([])
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    fetchApplicants()
  }, [])

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/applicants/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setApplicants(data)
      }
    } catch (error) {
      console.error('Error fetching applicants:', error)
    }
  }

  const handleResumeUpload = async (file: File) => {
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/applicants/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (response.ok) {
        fetchApplicants()
        setShowUpload(false)
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          Applicants
        </motion.h1>
        {user?.role === 'applicant' && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUpload(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Resume</span>
          </motion.button>
        )}
      </div>

      {/* Applicants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applicants.map((applicant: any, index: number) => (
          <motion.div
            key={applicant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {applicant.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{applicant.name}</h3>
                <p className="text-sm text-gray-600">{applicant.email}</p>
              </div>
            </div>
            
            {applicant.phone && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Phone className="w-4 h-4 mr-2" />
                {applicant.phone}
              </div>
            )}
            
            {applicant.resume_filename && (
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <FileText className="w-4 h-4 mr-2" />
                Resume uploaded
              </div>
            )}
            
            {applicant.skills && applicant.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {applicant.skills.slice(0, 4).map((skill: string, idx: number) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {applicant.skills.length > 4 && (
                    <span className="text-xs text-gray-500">+{applicant.skills.length - 4} more</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Resume</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Drag and drop your resume or click to browse</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleResumeUpload(e.target.files[0])
                  }
                }}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
              >
                Choose File
              </label>
            </div>
            <button
              onClick={() => setShowUpload(false)}
              className="w-full mt-4 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Applicants
