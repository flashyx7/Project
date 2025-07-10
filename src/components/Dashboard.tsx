
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Briefcase, Calendar, TrendingUp, FileText, Search } from 'lucide-react'

interface DashboardProps {
  user: any
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    totalInterviews: 0,
    totalMatches: 0
  })

  useEffect(() => {
    // Simulate fetching dashboard stats
    setStats({
      totalJobs: 24,
      totalApplicants: 156,
      totalInterviews: 32,
      totalMatches: 89
    })
  }, [])

  const statCards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'Applicants',
      value: stats.totalApplicants,
      icon: Users,
      color: 'from-green-500 to-green-600',
      change: '+8%'
    },
    {
      title: 'Interviews',
      value: stats.totalInterviews,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      change: '+23%'
    },
    {
      title: 'Matches',
      value: stats.totalMatches,
      icon: Search,
      color: 'from-orange-500 to-orange-600',
      change: '+15%'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          Dashboard
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm text-gray-600"
        >
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500 font-medium">{card.change}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h3>
          <div className="space-y-4">
            {[
              { name: 'John Doe', position: 'Software Engineer', time: '2 hours ago' },
              { name: 'Jane Smith', position: 'Product Manager', time: '4 hours ago' },
              { name: 'Mike Johnson', position: 'Designer', time: '6 hours ago' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{item.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.position}</p>
                </div>
                <span className="text-xs text-gray-500">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
          <div className="space-y-4">
            {[
              { name: 'Sarah Wilson', position: 'Backend Developer', time: 'Today 2:00 PM' },
              { name: 'David Brown', position: 'Frontend Developer', time: 'Tomorrow 10:00 AM' },
              { name: 'Lisa Garcia', position: 'DevOps Engineer', time: 'Friday 3:00 PM' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.position}</p>
                </div>
                <span className="text-xs text-gray-500">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
