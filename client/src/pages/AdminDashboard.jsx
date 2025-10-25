import { useState, useEffect } from 'react'
import API from '../services/api'
import Header from '../components/Header'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import toast from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import '../styles/AdminDashboard.css'

const TABS = ['Users', 'Volunteers', 'Reports', 'Reviews', 'Donations', 'Analytics']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Users')
  const [users, setUsers] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [reports, setReports] = useState([])
  const [reviews, setReviews] = useState([])
  const [donations, setDonations] = useState([])
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTab(tab)
    //eslint-disable-next-line
  }, [tab])

  const fetchTab = async (tabName) => {
    setLoading(true)
    try {
      if (tabName === 'Users') {
        const res = await API.get('/admin/users')
        setUsers(res.data)
      } else if (tabName === 'Volunteers') {
        const res = await API.get('/admin/volunteers')
        setVolunteers(res.data)
      } else if (tabName === 'Reports') {
        const res = await API.get('/admin/reports')
        setReports(res.data)
      } else if (tabName === 'Reviews') {
        const res = await API.get('/admin/reviews')
        setReviews(res.data)
      } else if (tabName === 'Donations') {
        const res = await API.get('/admin/donations')
        setDonations(res.data)
      } else if (tabName === 'Analytics') {
        const res = await API.get('/admin/donation-areas')
        setAreas(res.data)
      }
    } catch (e) {
      toast.error('Failed to load data!')
    }
    setLoading(false)
  }

  const suspendUser = async (userId) => {
    const reason = prompt('Reason for suspension?')
    if (!reason) return
    await API.post(`/admin/users/${userId}/suspend`, { reason })
    toast.success('User suspended')
    fetchTab('Users')
  }

  const unsuspendUser = async (userId) => {
    await API.post(`/admin/users/${userId}/unsuspend`)
    toast.success('User unsuspended')
    fetchTab('Users')
  }

  const approveVolunteer = async (id) => {
    await API.post(`/admin/volunteers/${id}`, { isActive: true })
    toast.success('Volunteer approved')
    fetchTab('Volunteers')
  }

  const deactivateVolunteer = async (id) => {
    await API.post(`/admin/volunteers/${id}`, { isActive: false })
    toast.success('Volunteer deactivated')
    fetchTab('Volunteers')
  }

  const moderateReport = async (reportId, status, adminNotes) => {
    await API.post(`/admin/reports/${reportId}/status`, { status, adminNotes })
    toast.success('Report updated')
    fetchTab('Reports')
  }

  const deleteReview = async (reviewId) => {
    await API.delete(`/admin/reviews/${reviewId}`)
    toast.success('Review deleted')
    fetchTab('Reviews')
  }

  return (
    <div className="admin-dashboard">
      <Header />
      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t} className={`admin-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="admin-tab-content">
        {loading ? <div className="admin-loading">Loading...</div> : (
          <>
            {tab === 'Users' && <UserTable users={users} onSuspend={suspendUser} onUnsuspend={unsuspendUser} />}
            {tab === 'Volunteers' && <VolunteerTable volunteers={volunteers} onApprove={approveVolunteer} onDeactivate={deactivateVolunteer} />}
            {tab === 'Reports' && <ReportTable reports={reports} onModerate={moderateReport} />}
            {tab === 'Reviews' && <ReviewTable reviews={reviews} onDelete={deleteReview} />}
            {tab === 'Donations' && <DonationTable donations={donations} />}
            {tab === 'Analytics' && <AdminMap areas={areas} />}
          </>
        )}
      </div>
    </div>
  )
}

// The following are simplified versions for brevity but can be easily styled and extended.

function UserTable({ users, onSuspend, onUnsuspend }) {
  return (
    <table className="admin-table">
      <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {users.map(u =>
          <tr key={u._id}>
            <td>{u.firstName} {u.lastName}</td>
            <td>{u.role}</td>
            <td>{u.email}</td>
            <td>{u.suspended ? 'Suspended' : 'Active'}</td>
            <td>
              {!u.suspended
                ? <button onClick={() => onSuspend(u._id)}>Suspend</button>
                : <button onClick={() => onUnsuspend(u._id)}>Unsuspend</button>}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

function VolunteerTable({ volunteers, onApprove, onDeactivate }) {
  return (
    <table className="admin-table">
      <thead><tr><th>Name</th><th>NGO</th><th>Area</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {volunteers.map(v =>
          <tr key={v._id}>
            <td>{v.firstName} {v.lastName}</td>
            <td>{v.ngoDetails?.ngoName}</td>
            <td>{v.ngoDetails?.areaAssigned}</td>
            <td>{v.ngoDetails?.isActive ? 'Active' : 'Inactive'}</td>
            <td>
              {v.ngoDetails?.isActive
                ? <button onClick={() => onDeactivate(v._id)}>Deactivate</button>
                : <button onClick={() => onApprove(v._id)}>Approve</button>}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

function ReportTable({ reports, onModerate }) {
  return (
    <table className="admin-table">
      <thead><tr><th>Type</th><th>Reporter</th><th>Reported</th><th>Status</th><th>Reason</th><th>Action</th></tr></thead>
      <tbody>
        {reports.map(r =>
          <tr key={r._id}>
            <td>{r.type}</td>
            <td>{r.reporter?.firstName}</td>
            <td>{r.reportedUser?.firstName}</td>
            <td>{r.status}</td>
            <td>{r.reason}</td>
            <td>
              <button onClick={() => onModerate(r._id, 'reviewed', 'Checked')}>Mark Reviewed</button>
              <button onClick={() => onModerate(r._id, 'resolved', 'Resolved')}>Mark Resolved</button>
              <button onClick={() => onModerate(r._id, 'dismissed', 'Dismissed')}>Dismiss</button>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

function ReviewTable({ reviews, onDelete }) {
  return (
    <table className="admin-table">
      <thead><tr><th>User</th><th>Donation</th><th>Rating</th><th>Text</th><th>Action</th></tr></thead>
      <tbody>
        {reviews.map(r =>
          <tr key={r._id}>
            <td>{r.user?.firstName}</td>
            <td>{r.donation?.foodName}</td>
            <td>{r.rating || ''}</td>
            <td>{r.text || ''}</td>
            <td><button onClick={() => onDelete(r._id)}>Delete</button></td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

function DonationTable({ donations }) {
  return (
    <table className="admin-table">
      <thead><tr><th>Name</th><th>Donor</th><th>Quantity</th><th>Status</th><th>Area</th></tr></thead>
      <tbody>
        {donations.map(d =>
          <tr key={d._id}>
            <td>{d.foodName}</td>
            <td>{d.donor?.businessName || ''}</td>
            <td>{d.quantity?.value || ''} {d.quantity?.unit || ''}</td>
            <td>{d.status}</td>
            <td>{d.location?.address}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

function AdminMap({ areas }) {
  return (
    <div style={{height: '480px', margin: '24px 0'}}>
      <MapContainer center={[12.9716, 77.5946]} zoom={11} style={{height: '100%', width: '100%'}}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {areas.map(a => (
          a.coords?.length > 0 &&
          <Marker key={a._id} position={a.coords[0]}>
            <Popup>
              <div>
                <strong>{a._id}</strong><br />
                Donations: {a.count}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
