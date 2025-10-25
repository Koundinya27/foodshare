import API from './api'

// USERS
export const getUsers = () => API.get('/admin/users')
export const suspendUser = (id, reason) => API.post(`/admin/users/${id}/suspend`, { reason })
export const unsuspendUser = (id) => API.post(`/admin/users/${id}/unsuspend`)
export const changeUserRole = (id, role) => API.post(`/admin/users/${id}/role`, { role })

// VOLUNTEERS
export const getVolunteers = () => API.get('/admin/volunteers')
export const updateVolunteer = (id, payload) => API.post(`/admin/volunteers/${id}`, payload)

// REPORTS & REVIEWS
export const getReports = () => API.get('/admin/reports')
export const setReportStatus = (id, status, notes) => API.post(`/admin/reports/${id}/status`, { status, adminNotes: notes })
export const getReviews = () => API.get('/admin/reviews')
export const deleteReview = (id) => API.delete(`/admin/reviews/${id}`)

// DONATIONS/ANALYTICS
export const getDonations = (params) => API.get('/admin/donations', { params })
export const forceCompleteDonation = (id) => API.post(`/admin/donations/${id}/complete`)
export const getAreaAnalytics = () => API.get('/admin/donation-areas')
