import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../services/authService'
import Header from '../components/Header'
import './AuthPages.css'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    gender: '',
    role: '',
    donorType: '',
    businessType: '',
    businessName: '',
    receiverType: '',
    organizationType: '',
    organizationName: '',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716],
      address: ''
    }
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      // Clean the data - only send relevant fields
      const cleanData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        gender: formData.gender,
        role: formData.role,
        location: formData.location
      }

      // Add donor-specific fields only if role is donor
      if (formData.role === 'donor') {
        cleanData.donorType = formData.donorType
        if (formData.donorType === 'small_business') {
          cleanData.businessType = formData.businessType
          cleanData.businessName = formData.businessName
        }
      }

      // Add receiver-specific fields only if role is receiver
      if (formData.role === 'receiver') {
        cleanData.receiverType = formData.receiverType
        if (formData.receiverType === 'group') {
          cleanData.organizationType = formData.organizationType
          cleanData.organizationName = formData.organizationName
        }
      }

      console.log('Sending registration data:', cleanData)

      const data = await register(cleanData)
      login(data, data.token)
      
      // Redirect based on role
      if (data.role === 'donor') {
        navigate('/donor/dashboard')
      } else {
        navigate('/receiver/dashboard')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <Header />
      
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join our food sharing community</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-input"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                className="form-input"
                placeholder="10-digit mobile number"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">I am a</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="donor">Donor</option>
                <option value="receiver">Receiver</option>
              </select>
            </div>

            {/* Donor-specific fields */}
            {formData.role === 'donor' && (
              <>
                <div className="form-group">
                  <label className="form-label">Donor Type</label>
                  <select
                    name="donorType"
                    className="form-select"
                    value={formData.donorType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="individual">Individual</option>
                    <option value="small_business">Small Business</option>
                  </select>
                </div>

                {formData.donorType === 'small_business' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Business Type</label>
                      <select
                        name="businessType"
                        className="form-select"
                        value={formData.businessType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Business Type</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="hotel">Hotel</option>
                        <option value="catering">Catering Service</option>
                        <option value="function_hall">Function Hall</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Business Name</label>
                      <input
                        type="text"
                        name="businessName"
                        className="form-input"
                        value={formData.businessName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Receiver-specific fields */}
            {formData.role === 'receiver' && (
              <>
                <div className="form-group">
                  <label className="form-label">Receiver Type</label>
                  <select
                    name="receiverType"
                    className="form-select"
                    value={formData.receiverType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="individual">Individual</option>
                    <option value="group">Group/Organization</option>
                  </select>
                </div>

                {formData.receiverType === 'group' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Organization Type</label>
                      <select
                        name="organizationType"
                        className="form-select"
                        value={formData.organizationType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Organization Type</option>
                        <option value="charity">Charity</option>
                        <option value="orphanage">Orphanage</option>
                        <option value="trust">Trust</option>
                        <option value="other_ngo">Other NGO</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Organization Name</label>
                      <input
                        type="text"
                        name="organizationName"
                        className="form-input"
                        value={formData.organizationName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                className="form-input"
                placeholder="Enter your address"
                value={formData.location.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, address: e.target.value }
                }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
