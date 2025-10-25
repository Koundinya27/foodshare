import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import API from '../services/api'
import './HomePage.css'

const HomePage = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await API.get('/donations/analytics')
      setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-page">
      <Header />
      
      <main className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Share Food,<br />Build Community
            </h1>
            <p className="hero-subtitle">
              Connect surplus food with those in need. Together, we can reduce waste and nourish our neighborhoods.
            </p>
            
            {/* Impact Stats */}
            {!loading && stats && (
              <div className="impact-stats">
                <div className="stat-card">
                  <div className="stat-icon">🍽️</div>
                  <div className="stat-number">{stats.impact.foodSaved}</div>
                  <div className="stat-label">Servings Saved</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-number">{stats.donations.completed}</div>
                  <div className="stat-label">Donations Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-number">{stats.users.total}</div>
                  <div className="stat-label">Community Members</div>
                </div>
              </div>
            )}
            
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Map-Based Discovery</h3>
              <p>Find food donations near you on an interactive map with real-time updates</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Matching</h3>
              <p>Connect donors and receivers in real-time with smart geolocation</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Trust & Safety</h3>
              <p>Reviews, ratings, and reporting system ensure quality and accountability</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Community Leaderboard</h3>
              <p>Gamified donations motivate giving and recognize top contributors</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <div className="container">
          <p>&copy; 2025 Food Sharing Platform. Building a better community together.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
