
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Video, Plus, User } from 'lucide-react'

interface InterviewsProps {
  user: any
}

const Interviews: React.FC<InterviewsProps> = ({ user }) => {
  const [interviews, setInterviews] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newInterview, setNewInterview] = useState({
    applicant_id: '',
    position_id: '',
    interview_date: '',
    interview_time: '',
    interview_type: 'video',
    notes: ''
  })

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/interviews/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setInterviews(data)
      }
    } catch (error) {
      console.error('Error fetching interviews:', error)
    }
  }

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/interviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newInterview,
          scheduled_datetime: `${newInterview.interview_date}T${newInterview.interview_time}:00`
        })
      })
      
      if (response.ok) {
        fetchInterviews()
        setShowModal(false)
        setNewInterview({
          applicant_id: '',
          position_id: '',
          interview_date: '',
          interview_time: '',
          interview_type: 'video',
          notes: ''
        })
      }
    } catch (error) {
      console.error('Error scheduling interview:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />
      case 'phone':
        return <Clock className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
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
          Interviews
        </motion.h1>
        {user?.role === 'company' && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Schedule Interview</span>
          </motion.button>
        )}
      </div>

      {/* Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() + i)
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <div className="text-center mb-3">
                <p className="text-sm text-gray-600">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {date.getDate()}
                </p>
              </div>
              
              {/* Mock interviews for today */}
              {i === 0 && (
                <div className="space-y-2">
                  <div className="bg-blue-50 p-2 rounded-lg border-l-2 border-blue-500">
                    <p className="text-xs font-medium text-blue-800">10:00 AM</p>
                    <p className="text-xs text-blue-600">John Doe</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg border-l-2 border-green-500">
                    <p className="text-xs font-medium text-green-800">2:00 PM</p>
                    <p className="text-xs text-green-600">Jane Smith</p>
                  </div>
                </div>
              )}
              
              {i === 2 && (
                <div className="bg-purple-50 p-2 rounded-lg border-l-2 border-purple-500">
                  <p className="text-xs font-medium text-purple-800">11:30 AM</p>
                  <p className="text-xs text-purple-600">Mike Wilson</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Interviews List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h2>
        </div>
        <div className="divide-y">
          {[
            {
              id: 1,
              applicant: 'John Doe',
              position: 'Software Engineer',
              date: '2024-01-15',
              time: '10:00 AM',
              type: 'video',
              status: 'scheduled'
            },
            {
              id: 2,
              applicant: 'Jane Smith',
              position: 'Product Manager',
              date: '2024-01-15',
              time: '2:00 PM',
              type: 'video',
              status: 'scheduled'
            },
            {
              id: 3,
              applicant: 'Mike Wilson',
              position: 'Designer',
              date: '2024-01-17',
              time: '11:30 AM',
              type: 'phone',
              status: 'scheduled'
            }
          ].map((interview, index) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{interview.applicant.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{interview.applicant}</h3>
                    <p className="text-sm text-gray-600">{interview.position}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(interview.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {interview.time}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-sm text-gray-600">
                      {getTypeIcon(interview.type)}
                      <span className="ml-1 capitalize">{interview.type}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(interview.status)}`}>
                      {interview.status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule Interview</h2>
            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <select
                value={newInterview.applicant_id}
                onChange={(e) => setNewInterview({...newInterview, applicant_id: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Applicant</option>
                <option value="1">John Doe</option>
                <option value="2">Jane Smith</option>
              </select>
              
              <select
                value={newInterview.position_id}
                onChange={(e) => setNewInterview({...newInterview, position_id: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Position</option>
                <option value="1">Software Engineer</option>
                <option value="2">Product Manager</option>
              </select>
              
              <input
                type="date"
                value={newInterview.interview_date}
                onChange={(e) => setNewInterview({...newInterview, interview_date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              
              <input
                type="time"
                value={newInterview.interview_time}
                onChange={(e) => setNewInterview({...newInterview, interview_time: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              
              <select
                value={newInterview.interview_type}
                onChange={(e) => setNewInterview({...newInterview, interview_type: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
                <option value="in_person">In Person</option>
              </select>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Interviews
