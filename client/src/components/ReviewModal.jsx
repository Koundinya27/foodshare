import { useState } from 'react'
import './ReviewModal.css'

const ReviewModal = ({ donation, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    foodQuality: 'good',
    comment: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rate Your Experience</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="donation-info">
            <p><strong>Food:</strong> {donation.foodName}</p>
            <p><strong>Donor:</strong> {donation.donor?.businessName || donation.donor?.firstName}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${formData.rating >= star ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, rating: star })}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {formData.rating === 5 && '⭐ Excellent'}
                {formData.rating === 4 && '⭐ Very Good'}
                {formData.rating === 3 && '⭐ Good'}
                {formData.rating === 2 && '⭐ Fair'}
                {formData.rating === 1 && '⭐ Poor'}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Food Quality</label>
              <select
                className="form-select"
                value={formData.foodQuality}
                onChange={(e) => setFormData({ ...formData, foodQuality: e.target.value })}
                required
              >
                <option value="excellent">Excellent - Fresh & Tasty</option>
                <option value="good">Good - As Expected</option>
                <option value="average">Average - Acceptable</option>
                <option value="poor">Poor - Not Good</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Comment (Optional)</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Share your experience..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                maxLength="500"
              />
              <small>{formData.comment.length}/500 characters</small>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Skip for Now
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReviewModal
