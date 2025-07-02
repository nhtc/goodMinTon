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
  games: {
    async getAll() {
      const response = await fetch('/api/games')
      if (!response.ok) {
        throw new Error('Failed to fetch games')
      }
      return response.json()
    },

    async getById(id: string) {
      const response = await fetch(`/api/games/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch game')
      }
      return response.json()
    },

    async create(gameData: {
      date: string
      location: string
      yardCost: number
      shuttleCockQuantity: number
      shuttleCockPrice: number
      otherFees: number
      totalCost: number
      memberIds: string[]
      costPerMember: number
      memberPrePays?: { [key: string]: { amount: number; category: string } } // ✅ Fix pre-pays structure
    }) {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create game')
      }

      return response.json()
    },

    // ✅ Add the missing update method
    async update(gameId: string, gameData: {
      date: string
      location: string
      yardCost: number
      shuttleCockQuantity: number
      shuttleCockPrice: number
      otherFees: number
      totalCost: number
      memberIds: string[]
      costPerMember: number
      memberPrePays?: { [key: string]: { amount: number; category: string } }
    }) {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update game')
      }

      return response.json()
    },

    async delete(id: string) {
      const response = await fetch(`/api/games/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete game')
      }

      return response.json()
    },

    async togglePayment(gameId: string, participantId: string, hasPaid: boolean) {
      const response = await fetch(`/api/games/${gameId}/participants/${participantId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hasPaid }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update payment status')
      }

      return response.json()
    },
  },

  members: {
    async getAll() {
      const response = await fetch('/api/members')
      if (!response.ok) {
        throw new Error('Failed to fetch members')
      }
      return response.json()
    },

    async create(memberData: { name: string; phone?: string }) {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create member')
      }

      return response.json()
    },

    async delete(id: string) {
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete member')
      }

      return response.json()
    },

    async update(id: string, memberData: { name: string; phone?: string }) {
      const response = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update member')
      }

      return response.json()
    },
  },
}
export default api