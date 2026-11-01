import React, { createContext, useContext, useState } from 'react'

interface LayoutContextType {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  isMobileSidebarOpen: boolean
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <LayoutContext.Provider value={{
      isSidebarOpen,
      toggleSidebar: () => setIsSidebarOpen((prev) => !prev),
      isMobileSidebarOpen,
      toggleMobileSidebar: () => setIsMobileSidebarOpen((prev) => !prev),
      closeMobileSidebar: () => setIsMobileSidebarOpen(false),
    }}>
      {children}
    </LayoutContext.Provider>
  )
}

export const useLayoutContext = () => {
  const context = useContext(LayoutContext)
  if (!context) throw new Error('useLayoutContext must be used within a LayoutProvider')
  return context
}
