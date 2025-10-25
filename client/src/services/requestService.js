import API from './api'

export const createRequest = async (donationId, note) => {
  const response = await API.post('/requests', { donationId, note })
  return response.data
}

export const getMyRequests = async () => {
  const response = await API.get('/requests/my-requests')
  return response.data
}

export const getIncomingRequests = async () => {
  const response = await API.get('/requests/incoming')
  return response.data
}

export const confirmRequest = async (requestId) => {
  const response = await API.put(`/requests/${requestId}/confirm`)
  return response.data
}

export const declineRequest = async (requestId, reason) => {
  const response = await API.put(`/requests/${requestId}/decline`, { reason })
  return response.data
}

export const completeRequest = async (requestId) => {
  const response = await API.put(`/requests/${requestId}/complete`)
  return response.data
}
