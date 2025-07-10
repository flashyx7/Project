
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Target, Star, Briefcase, Users } from 'lucide-react'

interface MatchingProps {
  user: any
}

const Matching: React.FC<MatchingProps> = ({ user }) => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      let endpoint = ''
      
      if (user?.role === 'company') {
        // Fetch jobs and their candidates
        endpoint = '/api/jobs/'
      } else {
        // Fetch matches for applicant
        endpoint = '/api/matching/applicants/1/matches' // Replace 1 with actual applicant ID
      }
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMatches(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMatchPercentage = () => Math.floor(Math.random() * 40) + 60 // Mock percentage

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          Skill Matching
        </motion.h1>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchMatches}
          disabled={loading}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Search className="w-5 h-5" />
          <span>{loading ? 'Searching...' : 'Find Matches'}</span>
        </motion.button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Matches</p>
              <p className="text-3xl font-bold">89</p>
            </div>
            <Target className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">High Matches (80%+)</p>
              <p className="text-3xl font-bold">23</p>
            </div>
            <Star className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Perfect Matches</p>
              <p className="text-3xl font-bold">7</p>
            </div>
            <Users className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((_, index) => {
          const matchPercentage = getMatchPercentage()
          const isHighMatch = matchPercentage >= 80
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    {user?.role === 'company' ? (
                      <Users className="w-6 h-6 text-white" />
                    ) : (
                      <Briefcase className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user?.role === 'company' 
                        ? `Candidate ${index + 1}` 
                        : `Software Engineer Position`
                      }
                    </h3>
                    <p className="text-gray-600">
                      {user?.role === 'company'
                        ? 'john.doe@email.com'
                        : 'Tech Company Inc.'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isHighMatch 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <Star className="w-4 h-4 mr-1" />
                    {matchPercentage}% Match
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.floor(Math.random() * 5) + 3} skills matched
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'Python', 'SQL'].slice(0, Math.floor(Math.random() * 3) + 2).map((skill, idx) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    isHighMatch ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${matchPercentage}%` }}
                ></div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default Matching
