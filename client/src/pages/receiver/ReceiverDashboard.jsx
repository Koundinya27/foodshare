import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Header from '../../components/Header'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { getDonationsNearby } from '../../services/donationService'
import { createRequest, getMyRequests } from '../../services/requestService'
import ReviewModal from '../../components/ReviewModal'
import { createReview } from '../../services/reviewService'
import ReportModal from '../../components/ReportModal'
import { createReport } from '../../services/reportService'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './ReceiverDashboard.css'

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ReceiverDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('browse')
  const [donations, setDonations] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [requestedDonations, setRequestedDonations] = useState(new Set())
  const [filters, setFilters] = useState({
    foodType: 'all',
    maxDistance: 20
  })
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewingRequest, setReviewingRequest] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportingRequest, setReportingRequest] = useState(null)

  const quotes = [
    "Accepting help is a sign of strength, not weakness.",
    "Together we build a stronger community.",
    "Every meal shared is a step toward a better tomorrow.",
    "Gratitude turns what we have into enough."
  ]
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

  useEffect(() => {
    if (activeTab === 'browse') {
      loadDonations()
    } else if (activeTab === 'requests' || activeTab === 'history') {
      loadRequests()
    }
  }, [activeTab, filters])

  // Auto-prompt review for first unreviewed completed request (optional)
  useEffect(() => {
    if (activeTab === 'history' && myRequests.length > 0) {
      const completedRequests = myRequests.filter(r => 
        r.status === 'completed' && !r.reviewed
      )
      
      if (completedRequests.length > 0) {
        setTimeout(() => {
          setReviewingRequest(completedRequests[0])
          setShowReviewModal(true)
        }, 1500)
      }
    }
  }, [myRequests, activeTab])

  const loadDonations = async () => {
    setLoading(true)
    try {
      const coords = user?.location?.coordinates || [77.5946, 12.9716]
      const data = await getDonationsNearby(coords[0], coords[1], filters.maxDistance)
      
      const filtered = filters.foodType === 'all' 
        ? data 
        : data.filter(d => d.foodType === filters.foodType)
      
      setDonations(filtered)
    } catch (error) {
      console.error('Error loading donations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRequests = async () => {
    setLoading(true)
    try {
      const data = await getMyRequests()
      setMyRequests(data)
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRequestFood = async (donationId) => {
    if (requestedDonations.has(donationId)) {
      alert('You have already requested this donation!')
      return
    }

    const note = prompt('Add a note for the donor (optional):')
    if (note === null) return
    
    setRequesting(true)
    try {
      await createRequest(donationId, note || '')
      setRequestedDonations(prev => new Set([...prev, donationId]))
      alert('✅ Request sent successfully! The donor will be notified.')
      loadDonations()
    } catch (error) {
      console.error('Request error:', error)
      alert(error.response?.data?.message || 'Failed to send request')
    } finally {
      setRequesting(false)
    }
  }

  const handleSubmitReview = async (reviewData) => {
    try {
      await createReview({
        donationId: reviewingRequest.donation._id,
        ...reviewData
      })
      
      alert('✅ Thank you for your review! Your feedback helps build trust in our community.')
      setShowReviewModal(false)
      setReviewingRequest(null)
      loadRequests()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review')
    }
  }

  const handleSubmitReport = async (reportData) => {
    try {
      await createReport({
        donationId: reportingRequest.donation._id,
        ...reportData
      })
      
      alert('✅ Report submitted successfully. We will review it shortly.')
      setShowReportModal(false)
      setReportingRequest(null)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit report')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', text: 'Pending' },
      confirmed: { class: 'badge-confirmed', text: 'Confirmed' },
      declined: { class: 'badge-declined', text: 'Declined' },
      completed: { class: 'badge-completed', text: 'Completed' },
      cancelled: { class: 'badge-cancelled', text: 'Cancelled' }
    }
    return badges[status] || badges.pending
  }

  const userCoords = user?.location?.coordinates || [77.5946, 12.9716]
  const center = [userCoords[1], userCoords[0]]

  // Filter requests for active vs history
  const activeRequests = myRequests.filter(r => ['pending', 'confirmed', 'declined'].includes(r.status))
  const historyRequests = myRequests.filter(r => r.status === 'completed')

  return (
    <div className="receiver-dashboard">
      <Header />
      
      <div className="dashboard-container">
        <div className="welcome-section">
          <div className="container">
            <h1>Welcome, {user?.firstName}! 👋</h1>
            <p className="quote">"{randomQuote}"</p>
          </div>
        </div>

        <div className="dashboard-tabs">
          <div className="container">
            <button 
              className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
              onClick={() => setActiveTab('browse')}
            >
              🍽️ Browse Food
            </button>
            <button 
              className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              📋 Active Requests
            </button>
            <button 
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              📜 History
            </button>
          </div>
        </div>

        <div className="receiver-content">
          <div className="container">
            {/* BROWSE TAB */}
            {activeTab === 'browse' && (
              <div className="content-grid">
                <aside className="filters-sidebar">
                  <div className="filter-card">
                    <h3>Filters</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Food Type</label>
                      <select
                        name="foodType"
                        className="form-select"
                        value={filters.foodType}
                        onChange={handleFilterChange}
                      >
                        <option value="all">All</option>
                        <option value="veg">🌱 Vegetarian</option>
                        <option value="non_veg">🍗 Non-Vegetarian</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Max Distance (km)</label>
                      <select
                        name="maxDistance"
                        className="form-select"
                        value={filters.maxDistance}
                        onChange={handleFilterChange}
                      >
                        <option value="5">5 km</option>
                        <option value="10">10 km</option>
                        <option value="15">15 km</option>
                        <option value="20">20 km</option>
                      </select>
                    </div>

                    <div className="filter-info">
                      <p>📍 {donations.length} donations nearby</p>
                    </div>
                  </div>
                </aside>

                <main className="main-content">
                  <div className="map-container">
                    <MapContainer 
                      center={center} 
                      zoom={13} 
                      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      <Marker position={center}>
                        <Popup>📍 Your Location</Popup>
                      </Marker>

                      {donations.map(donation => {
                        const coords = donation.location.coordinates
                        return (
                          <Marker 
                            key={donation._id} 
                            position={[coords[1], coords[0]]}
                          >
                            <Popup>
                              <div style={{ minWidth: '200px' }}>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{donation.foodName}</h4>
                                <p style={{ margin: '4px 0', fontSize: '13px' }}>
                                  <strong>Type:</strong> {donation.foodType === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
                                </p>
                                <p style={{ margin: '4px 0', fontSize: '13px' }}>
                                  <strong>Quantity:</strong> {donation.quantity.value} {donation.quantity.unit}
                                </p>
                                <p style={{ margin: '4px 0', fontSize: '13px' }}>
                                  <strong>Donor:</strong> {donation.donor?.businessName || donation.donor?.firstName}
                                </p>
                              </div>
                            </Popup>
                          </Marker>
                        )
                      })}
                    </MapContainer>
                  </div>

                  <div className="food-listings">
                    <h2>Available Food Donations</h2>
                    
                    {loading ? (
                      <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading donations...</p>
                      </div>
                    ) : donations.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">🍽️</div>
                        <p>No donations available in your area right now.</p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-light)' }}>
                          Try adjusting your filters or check back later.
                        </p>
                      </div>
                    ) : (
                      <div className="donations-grid">
                        {donations.map(donation => (
                          <div key={donation._id} className="food-card">
                            <div className="food-card-header">
                              <h3>{donation.foodName}</h3>
                              <span className={`food-type ${donation.foodType}`}>
                                {donation.foodType === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
                              </span>
                            </div>
                            
                            <div className="food-card-body">
                              <div className="info-row">
                                <span className="label">Quantity:</span>
                                <span className="value">{donation.quantity.value} {donation.quantity.unit}</span>
                              </div>
                              
                              <div className="info-row">
                                <span className="label">Donor:</span>
                                <span className="value">
                                  {donation.donor?.businessName || `${donation.donor?.firstName} ${donation.donor?.lastName}`}
                                </span>
                              </div>
                              
                              <div className="info-row">
                                <span className="label">Prepared:</span>
                                <span className="value">
                                  {new Date(donation.preparedTime).toLocaleString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>

                              <div className="info-row">
                                <span className="label">Pickup:</span>
                                <span className="value">
                                  {new Date(donation.pickupTimeStart).toLocaleString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>

                              <div className="info-row">
                                <span className="label">Location:</span>
                                <span className="value">{donation.location.address || 'See map'}</span>
                              </div>
                            </div>
                            
                            <div className="food-card-footer">
                              <button 
                                className="btn btn-primary btn-block"
                                onClick={() => handleRequestFood(donation._id)}
                                disabled={requesting || requestedDonations.has(donation._id)}
                              >
                                {requestedDonations.has(donation._id) ? '✓ Requested' : 'Request Food'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </main>
              </div>
            )}

            {/* ACTIVE REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div className="requests-section">
                <h2>Active Requests</h2>
                
                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading requests...</p>
                  </div>
                ) : activeRequests.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>No active requests.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveTab('browse')}
                    >
                      Browse Food
                    </button>
                  </div>
                ) : (
                  <div className="requests-list">
                    {activeRequests.map(request => {
                      const badge = getStatusBadge(request.status)
                      return (
                        <div key={request._id} className="request-card">
                          <div className="request-header">
                            <div>
                              <h3>{request.donation?.foodName}</h3>
                              <p className="donor-name">
                                Donor: {request.donor?.businessName || `${request.donor?.firstName} ${request.donor?.lastName}`}
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

                            {request.status === 'confirmed' && (
                              <>
                                <div className="info-row">
                                  <span className="label">Pickup Location:</span>
                                  <span className="value">{request.donation?.location?.address}</span>
                                </div>
                                <div className="info-row">
                                  <span className="label">Donor Contact:</span>
                                  <span className="value">{request.donor?.mobile}</span>
                                </div>
                              </>
                            )}

                            {request.status === 'declined' && request.declineReason && (
                              <div className="decline-reason">
                                <strong>Reason:</strong> {request.declineReason}
                              </div>
                            )}

                            {request.note && (
                              <div className="request-note">
                                <strong>Your note:</strong> {request.note}
                              </div>
                            )}
                          </div>
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
                <h2>Pickup History</h2>
                
                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading history...</p>
                  </div>
                ) : historyRequests.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📜</div>
                    <p>No completed pickups yet.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveTab('browse')}
                    >
                      Browse Food
                    </button>
                  </div>
                ) : (
                  <div className="requests-list">
                    {historyRequests.map(request => {
                      return (
                        <div key={request._id} className="request-card">
                          <div className="request-header">
                            <div>
                              <h3>{request.donation?.foodName}</h3>
                              <p className="donor-name">
                                Donor: {request.donor?.businessName || `${request.donor?.firstName} ${request.donor?.lastName}`}
                              </p>
                            </div>
                            <span className="badge badge-completed">Completed</span>
                          </div>
                          
                          <div className="request-body">
                            <div className="info-row">
                              <span className="label">Picked up:</span>
                              <span className="value">
                                {new Date(request.completedAt || request.createdAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
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
                          </div>

                          {/* REVIEW AND REPORT BUTTONS */}
                          {!request.reviewed ? (
                            <div className="request-actions" style={{ display: 'flex', gap: '12px' }}>
                              <button 
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={() => {
                                  setReviewingRequest(request)
                                  setShowReviewModal(true)
                                }}
                              >
                                ⭐ Leave Review
                              </button>
                              <button 
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                                onClick={() => {
                                  setReportingRequest(request)
                                  setShowReportModal(true)
                                }}
                              >
                                ⚠️ Report Issue
                              </button>
                            </div>
                          ) : (
                            <div className="reviewed-indicator">
                              ✓ Review submitted - Thank you for your feedback!
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {showReviewModal && reviewingRequest && (
        <ReviewModal
          donation={reviewingRequest.donation}
          onSubmit={handleSubmitReview}
          onClose={() => {
            setShowReviewModal(false)
            setReviewingRequest(null)
          }}
        />
      )}

      {/* REPORT MODAL */}
      {showReportModal && reportingRequest && (
        <ReportModal
          donation={reportingRequest.donation}
          reportType="expired_food"
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

export default ReceiverDashboard
