import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { getIncomingRequests } from '../services/requestService'
import './Header.css'

const Header = () => {
  const { user, logout } = useAuth()
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    if (user?.role === 'donor') {
      loadNotifications()
      // Refresh every 30 seconds
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      const requests = await getIncomingRequests()
      const pendingCount = requests.filter(r => r.status === 'pending').length
      setNotificationCount(pendingCount)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>🍽️ Food Sharing</h1>
          </Link>
          
          <nav className="nav">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </>
            ) : (
              <>
                <span className="user-name">Hello, {user.firstName}!</span>
                {user.role === 'donor' && notificationCount > 0 && (
                  <Link to="/donor/dashboard" className="notification-badge">
                    📬 {notificationCount} new request{notificationCount > 1 ? 's' : ''}
                  </Link>
                )}
                <button onClick={logout} className="btn btn-secondary">Logout</button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
