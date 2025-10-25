import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import API from '../services/api'
import './HomePage.css'

const HomePage = () => {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await API.get('/donations/analytics')
      setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  return (
    <div className="home-page">
      <Header />
      
      <main className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h2 className="hero-title">
              Share Food, Build Community
            </h2>
            <p className="hero-subtitle">
              Connect surplus food with those in need. Reduce waste, nourish your neighborhood.
            </p>
            
            {/* Impact Stats */}
            {stats && (
              <div className="impact-stats">
                <div className="stat-card">
                  <div className="stat-number">{stats.impact.foodSaved}</div>
                  <div className="stat-label">Servings Saved</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.donations.completed}</div>
                  <div className="stat-label">Donations Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.users.total}</div>
                  <div className="stat-label">Community Members</div>
                </div>
              </div>
            )}
            
            <div className="button-group">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Login
              </Link>
            </div>
          </div>

          <div className="features">
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Map-Based Listings</h3>
              <p>Find food donations near you on an interactive map</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Real-Time Updates</h3>
              <p>Get instant notifications when food is available</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Community Trust</h3>
              <p>Reviews and ratings ensure quality and safety</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Leaderboard</h3>
              <p>Gamified donations motivate giving</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage
