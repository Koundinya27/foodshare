import API from './api'

export const createDonation = async (donationData) => {
  const response = await API.post('/donations', donationData)
  return response.data
}

export const getDonationsNearby = async (lng, lat, radius = 20) => {
  const response = await API.get(`/donations/nearby?lng=${lng}&lat=${lat}&radius=${radius}`)
  return response.data
}

export const getMyDonations = async () => {
  const response = await API.get('/donations/my-donations')
  return response.data
}

export const getLeaderboard = async (period = 'week') => {
  const response = await API.get(`/donations/leaderboard?period=${period}`)
  return response.data
}
