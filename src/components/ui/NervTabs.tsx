import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TabItem {
  id: string
  label: string
  content: React.ReactNode
  icon?: React.ReactNode
}

interface NervTabsProps {
  tabs: TabItem[]
  defaultTab?: string
}

export const NervTabs: React.FC<NervTabsProps> = ({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const activeTabData = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="eva-terminal p-6 w-full">
      {/* Terminal Header */}
      <div className="eva-status-bar mb-6 flex justify-between items-center">
        <div>NERV_TACTICAL_INTERFACE - MULTI_MODULE_DISPLAY</div>
        <div className="text-xs">
          ACTIVE_MODULE: {activeTabData?.label || 'UNKNOWN'}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="eva-border-green mb-6">
        <div className="flex bg-gradient-to-r from-transparent via-green-500/10 to-transparent">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex-1 p-4 text-sm font-bold tracking-wider uppercase
                transition-colors duration-300
                ${activeTab === tab.id 
                  ? 'eva-text-green bg-green-500/20 eva-border-green border-b-2' 
                  : 'eva-text hover:eva-text-green hover:bg-green-500/10'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active indicator */}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute inset-0 eva-border-green bg-green-500/10"
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10 flex items-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
                
                {/* Terminal-style separator */}
                {index < tabs.length - 1 && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-6 bg-orange-500/30" />
                )}
              </div>

              {/* Scanning line effect for active tab */}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {activeTabData?.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* System Status Bar */}
      <div className="eva-border-green border-t-0 border-l-0 border-r-0 pt-4 mt-6">
        <div className="flex justify-between items-center text-xs eva-text-green">
          <div className="flex gap-4">
            <div>SYSTEM_STATUS: OPERATIONAL</div>
            <div>CONNECTION: SECURE</div>
            <div>DATA_INTEGRITY: 100%</div>
          </div>
          <div>
            MODULE_COUNT: {tabs.length} | ACTIVE: {activeTab.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
}

// Specialized Status Tab Content Component
export const StatusTabContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="eva-border p-4 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5">
    {children}
  </div>
)

// Specialized Analysis Tab Content Component
export const AnalysisTabContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="eva-border p-4 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5">
    {children}
  </div>
)

export default NervTabs