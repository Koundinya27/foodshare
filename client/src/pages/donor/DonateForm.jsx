import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createDonation } from '../../services/donationService'

const DonateForm = ({ onSuccess }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    foodType: '',
    foodName: '',
    quantity: {
      value: '',
      unit: 'servings'
    },
    preparedTime: '',
    pickupTimeStart: '',
    pickupTimeEnd: '',
    location: user?.location || {
      type: 'Point',
      coordinates: [77.5946, 12.9716],
      address: ''
    },
    willDeliver: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'quantityValue') {
      setFormData(prev => ({
        ...prev,
        quantity: { ...prev.quantity, value: value }
      }))
    } else if (name === 'quantityUnit') {
      setFormData(prev => ({
        ...prev,
        quantity: { ...prev.quantity, unit: value }
      }))
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      // Calculate expiry (pickup end time)
      const expiresAt = new Date(formData.pickupTimeEnd)
      
      const donationData = {
        ...formData,
        expiresAt
      }

      await createDonation(donationData)
      setSuccess(true)
      
      // Reset form
      setFormData({
        foodType: '',
        foodName: '',
        quantity: { value: '', unit: 'servings' },
        preparedTime: '',
        pickupTimeStart: '',
        pickupTimeEnd: '',
        location: user?.location,
        willDeliver: false
      })

      // Notify parent
      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 2000)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create donation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="donate-form-container">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Donation created successfully! 🎉</div>}

      <form onSubmit={handleSubmit} className="donate-form">
        <div className="form-group">
          <label className="form-label">Food Type *</label>
          <select
            name="foodType"
            className="form-select"
            value={formData.foodType}
            onChange={handleChange}
            required
          >
            <option value="">Select Food Type</option>
            <option value="veg">🌱 Vegetarian</option>
            <option value="non_veg">🍗 Non-Vegetarian</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Food Name *</label>
          <input
            type="text"
            name="foodName"
            className="form-input"
            placeholder="e.g., Biryani, Pasta, Mixed Vegetables"
            value={formData.foodName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              name="quantityValue"
              className="form-input"
              placeholder="e.g., 10"
              min="1"
              value={formData.quantity.value}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit *</label>
            <select
              name="quantityUnit"
              className="form-select"
              value={formData.quantity.unit}
              onChange={handleChange}
              required
            >
              <option value="servings">Servings</option>
              <option value="kg">Kilograms</option>
              <option value="plates">Plates</option>
              <option value="liters">Liters</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Food Prepared Time *</label>
          <input
            type="datetime-local"
            name="preparedTime"
            className="form-input"
            value={formData.preparedTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Pickup Start Time *</label>
            <input
              type="datetime-local"
              name="pickupTimeStart"
              className="form-input"
              value={formData.pickupTimeStart}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pickup End Time *</label>
            <input
              type="datetime-local"
              name="pickupTimeEnd"
              className="form-input"
              value={formData.pickupTimeEnd}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="willDeliver"
              checked={formData.willDeliver}
              onChange={handleChange}
            />
            <span>I am willing to deliver this donation (optional)</span>
          </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Donation'}
        </button>
      </form>
    </div>
  )
}

export default DonateForm
