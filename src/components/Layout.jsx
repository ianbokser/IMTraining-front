import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <div aria-hidden="true" className="site-bg site-bg--glow" />
      <div aria-hidden="true" className="site-bg site-bg--grid" />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
