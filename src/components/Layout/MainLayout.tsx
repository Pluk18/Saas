import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-20 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

