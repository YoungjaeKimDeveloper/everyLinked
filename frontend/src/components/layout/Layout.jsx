import Navbar from "./Navbar"
import { useQuery } from "@tanstack/react-query"
// COMMON LAYOUT
// CHILDREN - Q? 
const Layout = ({ children }) => {
  // 전역적으로 사용할 수 있게됨
  // Global state - BLOC처럼 됨..
  const { data: authUser, isLoading } = useQuery({ queryKey: ["authUser"] })
  // BUILD UI
  return (
    <div className='min-h-screen bg-base-100'>
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 py-6">
        {children}
      </main>

    </div>
  )
}

export default Layout