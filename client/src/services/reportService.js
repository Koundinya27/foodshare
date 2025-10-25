import API from './api'

export const createReport = async (reportData) => {
  const response = await API.post('/reports', reportData)
  return response.data
}

export const getMyReports = async () => {
  const response = await API.get('/reports/my-reports')
  return response.data
}

export const getReportsAgainstMe = async () => {
  const response = await API.get('/reports/against-me')
  return response.data
}
