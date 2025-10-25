import API from './api'

export const createReview = async (reviewData) => {
  const response = await API.post('/reviews', reviewData)
  return response.data
}

export const getUserReviews = async (userId) => {
  const response = await API.get(`/reviews/user/${userId}`)
  return response.data
}

export const checkCanReview = async (donationId) => {
  const response = await API.get(`/reviews/can-review/${donationId}`)
  return response.data
}
