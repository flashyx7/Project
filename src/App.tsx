
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Briefcase, Calendar, FileText, Search, Plus } from 'lucide-react'
import Dashboard from './components/Dashboard'
import Jobs from './components/Jobs'
import Applicants from './components/Applicants'
import Interviews from './components/Interviews'
import Matching from './components/Matching'
import Auth from './components/Auth'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  if (!isAuthenticated) {
    return <Auth onAuth={(userData) => {
      setIsAuthenticated(true)
      setUser(userData)
    }} />
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'applicants', label: 'Applicants', icon: Users },
    { id: 'matching', label: 'Matching', icon: Search },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />
      case 'jobs':
        return <Jobs user={user} />
      case 'applicants':
        return <Applicants user={user} />
      case 'matching':
        return <Matching user={user} />
      case 'interviews':
        return <Interviews user={user} />
      default:
        return <Dashboard user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                <h1 className="text-xl font-bold text-gray-900">Recruitment Tracker</h1>
              </motion.div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <button 
                onClick={() => setIsAuthenticated(false)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <motion.nav 
          className="w-64 bg-white shadow-sm h-screen sticky top-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default App
