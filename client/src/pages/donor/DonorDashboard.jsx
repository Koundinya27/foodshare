import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Header from '../../components/Header'
import { getMyDonations, getLeaderboard } from '../../services/donationService'
import { getIncomingRequests, confirmRequest, declineRequest, completeRequest } from '../../services/requestService'
import ReportModal from '../../components/ReportModal'
import { createReport } from '../../services/reportService'
import DonateForm from './DonateForm'
import './DonorDashboard.css'

const DonorDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('donate')
  const [donations, setDonations] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('week')
  const [loading, setLoading] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportingRequest, setReportingRequest] = useState(null)

  const quotes = [
    "No one has ever become poor by giving.",
    "The smallest act of kindness is worth more than the grandest intention.",
    "We make a living by what we get, but we make a life by what we give.",
    "Generosity is giving more than you can, and pride is taking less than you need."
  ]
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

  useEffect(() => {
    if (activeTab === 'history') {
      loadDonations()
    } else if (activeTab === 'requests') {
      loadIncomingRequests()
    } else if (activeTab === 'leaderboard') {
      loadLeaderboard()
    }
  }, [activeTab, leaderboardPeriod])

  const loadDonations = async () => {
    setLoading(true)
    try {
      const data = await getMyDonations()
      setDonations(data)
    } catch (error) {
      console.error('Error loading donations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadIncomingRequests = async () => {
    setLoading(true)
    try {
      const data = await getIncomingRequests()
      setIncomingRequests(data)
    } catch (error) {
      console.error('Error loading incoming requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const data = await getLeaderboard(leaderboardPeriod)
      setLeaderboard(data)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmRequest = async (requestId) => {
    if (!window.confirm('Confirm this request? The receiver will be notified.')) return
    
    try {
      await confirmRequest(requestId)
      alert('✅ Request confirmed! The receiver can now pickup the food.')
      loadIncomingRequests()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to confirm request')
    }
  }

  const handleDeclineRequest = async (requestId) => {
    const reason = prompt('Reason for declining (optional):')
    if (reason === null) return
    
    try {
      await declineRequest(requestId, reason)
      alert('Request declined.')
      loadIncomingRequests()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to decline request')
    }
  }

  const handleCompleteRequest = async (requestId) => {
    if (!window.confirm('Mark as picked up? This will complete the donation.')) return
    
    try {
      await completeRequest(requestId)
      alert('✅ Donation completed! Thank you for your contribution.')
      loadIncomingRequests()
      loadDonations()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete request')
    }
  }

  const handleSubmitReport = async (reportData) => {
    try {
      await createReport({
        donationId: reportingRequest.donation._id,
        ...reportData
      })
      
      alert('✅ Report submitted successfully.')
      setShowReportModal(false)
      setReportingRequest(null)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit report')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', text: 'Pending' },
      allotted: { class: 'badge-allotted', text: 'Allotted' },
      picked_up: { class: 'badge-success', text: 'Completed' },
      expired: { class: 'badge-expired', text: 'Expired' },
      confirmed: { class: 'badge-confirmed', text: 'Confirmed' },
      declined: { class: 'badge-declined', text: 'Declined' },
      completed: { class: 'badge-completed', text: 'Completed' }
    }
    return badges[status] || badges.pending
  }

  return (
    <div className="donor-dashboard">
      <Header />
      
      <div className="dashboard-container">
        <div className="welcome-section">
          <div className="container">
            <h1>Welcome, {user?.businessName || user?.firstName}! 👋</h1>
            <p className="quote">"{randomQuote}"</p>
          </div>
        </div>

        <div className="dashboard-tabs">
          <div className="container">
            <button 
              className={`tab ${activeTab === 'donate' ? 'active' : ''}`}
              onClick={() => setActiveTab('donate')}
            >
              🍽️ Donate
            </button>
            <button 
              className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              📬 Requests
            </button>
            <button 
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              📋 History
            </button>
            <button 
              className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="container">
            {/* DONATE TAB */}
            {activeTab === 'donate' && (
              <div className="donate-section">
                <h2>Create a New Donation</h2>
                <DonateForm onSuccess={() => setActiveTab('history')} />
              </div>
            )}

            {/* REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div className="requests-section">
                <h2>Incoming Requests</h2>
                
                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading requests...</p>
                  </div>
                ) : incomingRequests.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📬</div>
                    <p>No incoming requests yet.</p>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-light)' }}>
                      Requests will appear here when receivers request your donations.
                    </p>
                  </div>
                ) : (
                  <div className="requests-list">
                    {incomingRequests.map(request => {
                      const badge = getStatusBadge(request.status)
                      return (
                        <div key={request._id} className="request-card">
                          <div className="request-header">
                            <div>
                              <h3>{request.donation?.foodName}</h3>
                              <p className="requester-name">
                                From: {request.receiver?.organizationName || `${request.receiver?.firstName} ${request.receiver?.lastName}`}
                              </p>
                            </div>
                            <span className={`badge ${badge.class}`}>
                              {badge.text}
                            </span>
                          </div>
                          
                          <div className="request-body">
                            <div className="info-row">
                              <span className="label">Quantity:</span>
                              <span className="value">
                                {request.donation?.quantity?.value} {request.donation?.quantity?.unit}
                              </span>
                            </div>
                            
                            <div className="info-row">
                              <span className="label">Food Type:</span>
                              <span className="value">
                                {request.donation?.foodType === 'veg' ? '🌱 Vegetarian' : '🍗 Non-Vegetarian'}
                              </span>
                            </div>
                            
                            <div className="info-row">
                              <span className="label">Requested:</span>
                              <span className="value">
                                {new Date(request.createdAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            {request.note && (
                              <div className="request-note">
                                <strong>Receiver's note:</strong> {request.note}
                              </div>
                            )}

                            {request.status === 'confirmed' && (
                              <div className="info-row">
                                <span className="label">Receiver Contact:</span>
                                <span className="value">{request.receiver?.mobile}</span>
                              </div>
                            )}
                          </div>

                          {request.status === 'pending' && (
                            <div className="request-actions">
                              <button 
                                className="btn btn-primary"
                                onClick={() => handleConfirmRequest(request._id)}
                              >
                                ✓ Confirm
                              </button>
                              <button 
                                className="btn btn-secondary"
                                onClick={() => handleDeclineRequest(request._id)}
                              >
                                ✗ Decline
                              </button>
                            </div>
                          )}

                          {request.status === 'confirmed' && (
                            <div className="request-actions" style={{ display: 'flex', gap: '12px' }}>
                              <button 
                                className="btn btn-primary"
                                style={{ flex: 2 }}
                                onClick={() => handleCompleteRequest(request._id)}
                              >
                                ✓ Mark as Picked Up
                              </button>
                              <button 
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                                onClick={() => {
                                  setReportingRequest(request)
                                  setShowReportModal(true)
                                }}
                              >
                                ⚠️ Report No-Show
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="history-section">
                <h2>Your Donation History</h2>
                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                  </div>
                ) : donations.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>No donations yet. Create your first donation!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveTab('donate')}
                    >
                      Start Donating
                    </button>
                  </div>
                ) : (
                  <div className="donations-list">
                    {donations.map(donation => {
                      const badge = getStatusBadge(donation.status)
                      return (
                        <div key={donation._id} className="donation-card">
                          <div className="donation-header">
                            <h3>{donation.foodName}</h3>
                            <span className={`badge ${badge.class}`}>
                              {badge.text}
                            </span>
                          </div>
                          <div className="donation-details">
                            <p><strong>Type:</strong> {donation.foodType === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}</p>
                            <p><strong>Quantity:</strong> {donation.quantity.value} {donation.quantity.unit}</p>
                            <p><strong>Pickup Time:</strong> {new Date(donation.pickupTimeStart).toLocaleString()}</p>
                            {donation.receiver && (
                              <p><strong>Receiver:</strong> {donation.receiver.firstName} {donation.receiver.lastName}</p>
                            )}
                            <p><strong>Created:</strong> {new Date(donation.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LEADERBOARD TAB */}
            {activeTab === 'leaderboard' && (
              <div className="leaderboard-section">
                <div className="leaderboard-header">
                  <h2>Donor Leaderboard</h2>
                  <select 
                    className="form-select"
                    value={leaderboardPeriod}
                    onChange={(e) => setLeaderboardPeriod(e.target.value)}
                    style={{ width: 'auto', display: 'inline-block' }}
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
                
                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading leaderboard...</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🏆</div>
                    <p>No donations in this period yet.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveTab('donate')}
                    >
                      Start Donating
                    </button>
                  </div>
                ) : (
                  <div className="leaderboard-list">
                    {leaderboard.map((donor, index) => (
                      <div 
                        key={donor._id} 
                        className={`leaderboard-item ${index < 3 ? 'top-three' : ''} ${donor._id.toString() === user?._id ? 'current-user' : ''}`}
                      >
                        <div className="rank">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `#${index + 1}`}
                        </div>
                        <div className="donor-info">
                          <h4>{donor.name}</h4>
                          <p>{donor.donorType === 'small_business' ? '🏢 Business' : '👤 Individual'}</p>
                        </div>
                        <div className="donor-stats">
                          <div className="stat">
                            <span className="stat-value">{donor.totalDonations}</span>
                            <span className="stat-label">Donations</span>
                          </div>
                          <div className="stat">
                            <span className="stat-value">{donor.totalQuantity}</span>
                            <span className="stat-label">Servings</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REPORT MODAL */}
      {showReportModal && reportingRequest && (
        <ReportModal
          donation={reportingRequest.donation}
          reportType="no_show"
          onSubmit={handleSubmitReport}
          onClose={() => {
            setShowReportModal(false)
            setReportingRequest(null)
          }}
        />
      )}
    </div>
  )
}

export default DonorDashboard
