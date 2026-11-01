import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { Breadcrumb } from '../components/shared/Breadcrumb'

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-color)] transition-colors duration-300">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 md:p-4">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  )
}
