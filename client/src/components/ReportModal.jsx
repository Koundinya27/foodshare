import { useState } from 'react'
import './ReportModal.css'

const ReportModal = ({ donation, reportType, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    reason: '',
    evidence: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.reason.trim()) {
      alert('Please provide a reason')
      return
    }
    onSubmit({ ...formData, type: reportType })
  }

  const reportInfo = {
    expired_food: {
      title: 'Report Expired Food',
      description: 'Report if you received food that was expired or unsafe to consume',
      icon: '⚠️'
    },
    no_show: {
      title: 'Report No-Show',
      description: 'Report if the receiver did not collect the food within the agreed time',
      icon: '⏰'
    }
  }

  const info = reportInfo[reportType]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{info.icon} {info.title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="report-info">
            <p>{info.description}</p>
          </div>

          <div className="donation-info">
            <p><strong>Food:</strong> {donation.foodName}</p>
            <p><strong>Date:</strong> {new Date(donation.createdAt).toLocaleDateString()}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Reason for Report *</label>
              <textarea
                className="form-input"
                rows="5"
                placeholder="Please describe the issue in detail..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                maxLength="500"
                required
              />
              <small>{formData.reason.length}/500 characters</small>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Evidence (Optional)</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Any additional details or evidence..."
                value={formData.evidence}
                onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                maxLength="1000"
              />
              <small>{formData.evidence.length}/1000 characters</small>
            </div>

            <div className="warning-box">
              ⚠️ False reports may result in account suspension
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger">
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReportModal
