
import Layout from './components/layout/Layout'
import { Routes, Route } from "react-router-dom"

// Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/auth/LoginPage"
import SignUpPage from "./pages/auth/SignUpPage"
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    // SET THE HOMEPAGE ROUTE
    <Layout>
      <Routes>
        {/* AUTH */}
        <Route path='/' element={<HomePage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/login' element={<LoginPage />} />
      </Routes>
      <Toaster />
    </Layout>
  )
}

export default App