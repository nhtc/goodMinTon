// src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error'
      throw new Error(`${message} (${error.response.status})`)
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection')
    } else {
      // Something else happened
      throw new Error('Request failed')
    }
  }
)

export const apiService = {
  members: {
    getAll: async () => {
      const response = await api.get('/members')
      return response.data
    },
    create: async (memberData: { name: string; email: string; phone?: string }) => {
      const response = await api.post('/members', memberData)
      return response.data
    },
    delete: async (id: string) => {
      const response = await api.delete(`/members/${id}`)
      return response.data
    }
  },

  games: {
    getAll: async () => {
      const response = await api.get('/games')
      return response.data
    },
    
    create: async (gameData: {
      date: string
      yardCost: number
      shuttleCockQuantity: number
      shuttleCockPrice: number
      otherFees: number
      totalCost: number
      memberIds: string[]
      costPerMember: number
    }) => {
      const response = await api.post('/games', gameData)
      return response.data
    },
    
    delete: async (id: string) => {
      const response = await api.delete(`/games/${id}`)
      return response.data
    },

   // ✅ Add the missing togglePayment method
   togglePayment: async (gameId: string, participantId: string, hasPaid: boolean) => {
    const response = await fetch(`/api/games/${gameId}/participants/${participantId}/payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hasPaid }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update payment status')
    }
    
    return response.json()
  }
  }
}

export default api