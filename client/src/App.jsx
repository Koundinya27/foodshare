import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import DonorDashboard from './pages/donor/DonorDashboard'
import ReceiverDashboard from './pages/receiver/ReceiverDashboard'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route path="/donor/dashboard" element={
            <PrivateRoute role="donor">
              <DonorDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/receiver/dashboard" element={
            <PrivateRoute role="receiver">
              <ReceiverDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
