
import Layout from './components/layout/Layout'
import { Routes, Route, Navigate } from "react-router-dom"

// Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/auth/LoginPage"
import SignUpPage from "./pages/auth/SignUpPage"
import NotificationPage from './components/home/NotificationPage'
// External library
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from './lib/axios'
const App = () => {
  // Fetch Auth user

  // Global Query Pattern 

  // Check the Authentication - Everytime Component - rendering
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data
      } catch (error) {
        if (error.response && error.response.status === 401) {
          return null;
        }
        toast.error(error.response.data.message || "Something went wrong")
      }
    }
  })

  console.log("authUser", authUser)


  // ACCESS CONTROL 
  // 하나의 URL이 하나의 PAGE(책임) 을 갖게한다.
  // ROLE OF URL
  // Loading State
  if (isLoading) return null
  // BUILD UI
  return (
    // 하나의 URL이 하나의 PAGE(책임) 을 갖게한다.
    // ROLE OF URL - Navigate로 쓸것 - 논리적
    <Layout>
      <Routes>
        {/* AUTH */}
        <Route path='/' element={authUser ? <HomePage /> : <LoginPage />} />
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
        <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to={"/login"} />} />
      </Routes>
      <Toaster />
    </Layout>
  )
}

export default App