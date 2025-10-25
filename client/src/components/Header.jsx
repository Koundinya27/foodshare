import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="logo-icon">🍽️</span>
            <span className="logo-text">FoodShare</span>
          </Link>

          {/* Navigation */}
          <nav className="nav">
            {user ? (
              <>
                <Link 
                  to={user.role === 'donor' ? '/donor/dashboard' : '/receiver/dashboard'} 
                  className="nav-link"
                >
                  Dashboard
                </Link>
                
                <div className="user-menu">
                  <button className="user-button">
                    <div className="user-avatar">
                      {user.firstName?.charAt(0) || user.organizationName?.charAt(0) || 'U'}
                    </div>
                    <span className="user-name">
                      {user.businessName || user.organizationName || user.firstName}
                    </span>
                  </button>
                  
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        <div className="dropdown-name">
                          {user.businessName || user.organizationName || `${user.firstName} ${user.lastName}`}
                        </div>
                        <div className="dropdown-email">{user.email}</div>
                        <div className="dropdown-role">
                          {user.role === 'donor' ? '👨‍🍳 Donor' : '🙏 Receiver'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <Link to="/profile" className="dropdown-item">
                      <span className="dropdown-icon">👤</span>
                      Profile Settings
                    </Link>
                    
                    <button onClick={handleLogout} className="dropdown-item">
                      <span className="dropdown-icon">🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
