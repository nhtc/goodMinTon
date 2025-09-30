// src/lib/api.ts
import axios from 'axios'
import { PersonalEventFilters, CreatePersonalEventData, UpdatePersonalEventData, PersonalEventListResponse, PersonalEvent } from '../types'

/**
 * Axios instance with default configuration for API requests
 */
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Handles API errors in a consistent way across all endpoints
 * @param error - The error object from axios or fetch
 * @returns Formatted error message with status code if available
 */
const handleApiError = (error: any): Error => {
  console.error('API Error:', error)
  
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error || error.response.data?.message || 'Server error'
    return new Error(`${message} (${error.response.status})`)
  } else if (error.request) {
    // Request was made but no response received
    return new Error('Network error - please check your connection')
  } else {
    // Something else happened
    return new Error('Request failed')
  }
}

/**
 * Generic fetch wrapper with consistent error handling and auth management
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise resolving to response data
 */
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options)
    
    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      // Token is expired or invalid
      console.warn('API request failed with 401 - token may be expired')
      
      // Clear local auth data
      if (typeof window !== 'undefined') {
        const { clearAuthData } = await import('./tokenManager')
        clearAuthData()
        
        // Dispatch a custom event to notify auth context
        window.dispatchEvent(new CustomEvent('auth:token-expired'))
      }
      
      const error = await response.json().catch(() => ({ error: 'Authentication required' }))
      throw new Error(error.error || 'Authentication required. Please login again.')
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `Request failed with status ${response.status}`)
    }
    return response.json()
  } catch (error: any) {
    throw handleApiError(error)
  }
}

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    throw handleApiError(error)
  }
)

/**
 * Centralized API service with consistent error handling and JSDoc documentation
 */
export const apiService = {
  games: {
    /**
     * Retrieves all games from the server
     * @returns Promise resolving to array of game objects
     */
    async getAll() {
      return fetchWithErrorHandling('/api/games')
    },

    /**
     * Retrieves a specific game by ID
     * @param id - Unique game identifier
     * @returns Promise resolving to game object
     */
    async getById(id: string) {
      return fetchWithErrorHandling(`/api/games/${id}`)
    },

    /**
     * Creates a new game with the provided data
     * @param gameData - Game creation data including costs, members, and payments
     * @returns Promise resolving to created game object
     */
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
      memberPrePays?: { [key: string]: { amount: number; category: string } }
      memberCustomAmounts?: { [key: string]: number }
    }) {
      return fetchWithErrorHandling('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      })
    },

    /**
     * Updates an existing game with new data
     * @param gameId - Game identifier to update
     * @param gameData - Updated game data
     * @returns Promise resolving to updated game object
     */
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
      memberCustomAmounts?: { [key: string]: number }
    }) {
      return fetchWithErrorHandling(`/api/games/${gameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      })
    },

    /**
     * Deletes a game by ID
     * @param id - Game identifier to delete
     * @returns Promise resolving to deletion confirmation
     */
    async delete(id: string) {
      return fetchWithErrorHandling(`/api/games/${id}`, {
        method: 'DELETE',
      })
    },

    /**
     * Toggles payment status for a game participant
     * @param gameId - Game identifier
     * @param participantId - Participant identifier
     * @param hasPaid - New payment status
     * @returns Promise resolving to updated payment status
     */
    async togglePayment(gameId: string, participantId: string, hasPaid: boolean) {
      return fetchWithErrorHandling(`/api/games/${gameId}/participants/${participantId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasPaid }),
      })
    },
  },

  members: {
    /**
     * Retrieves all members from the server
     * @returns Promise resolving to array of member objects
     */
    async getAll() {
      return fetchWithErrorHandling('/api/members')
    },

    /**
     * Retrieves only active members from the server
     * @returns Promise resolving to array of active member objects
     */
    async getActive() {
      return fetchWithErrorHandling('/api/members?activeOnly=true')
    },

    /**
     * Creates a new member with the provided data
     * @param memberData - Member creation data (name and optional phone)
     * @returns Promise resolving to created member object
     */
    async create(memberData: { name: string; phone?: string }) {
      return fetchWithErrorHandling('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      })
    },

    /**
     * Updates an existing member with new data
     * @param id - Member identifier to update
     * @param memberData - Updated member data
     * @returns Promise resolving to updated member object
     */
    async update(id: string, memberData: { name: string; phone?: string }) {
      return fetchWithErrorHandling(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      })
    },

    /**
     * Deletes a member by ID
     * @param id - Member identifier to delete
     * @returns Promise resolving to deletion confirmation
     */
    async delete(id: string) {
      return fetchWithErrorHandling(`/api/members/${id}`, {
        method: 'DELETE',
      })
    },

    /**
     * Toggles the active status of a member
     * @param id - Member identifier
     * @returns Promise resolving to updated member status
     */
    async toggleStatus(id: string) {
      return fetchWithErrorHandling(`/api/members/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
    },

    /**
     * Bulk payment operation for a member's games and/or personal events
     * @param memberId - Member identifier
     * @param operation - 'mark_all_paid' or 'mark_all_unpaid'
     * @param type - 'games', 'personal_events', or 'both'
     * @returns Promise resolving to operation result
     */
    async bulkPaymentOperation(memberId: string, operation: 'mark_all_paid' | 'mark_all_unpaid', type: 'games' | 'personal_events' | 'both') {
      return fetchWithErrorHandling(`/api/members/${memberId}/payments/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, type }),
      })
    },
  },

  personalEvents: {
    /**
     * Retrieves personal events with optional filtering
     * @param filters - Optional filters for search, date range, member, and pagination
     * @returns Promise resolving to paginated personal events response
     */
    async getAll(filters?: PersonalEventFilters): Promise<PersonalEventListResponse> {
      const searchParams = new URLSearchParams()
      
      if (filters?.search) searchParams.set('search', filters.search)
      if (filters?.startDate) searchParams.set('startDate', filters.startDate)
      if (filters?.endDate) searchParams.set('endDate', filters.endDate)
      if (filters?.memberId) searchParams.set('memberId', filters.memberId)
      if (filters?.page) searchParams.set('page', filters.page.toString())
      if (filters?.limit) searchParams.set('limit', filters.limit.toString())

      const queryString = searchParams.toString()
      const url = `/api/personal-events${queryString ? `?${queryString}` : ''}`
      
      return fetchWithErrorHandling(url)
    },

    /**
     * Retrieves a specific personal event by ID
     * @param id - Personal event identifier
     * @returns Promise resolving to personal event object
     */
    async getById(id: string): Promise<PersonalEvent> {
      return fetchWithErrorHandling(`/api/personal-events/${id}`)
    },

    /**
     * Creates a new personal event
     * @param data - Personal event creation data
     * @returns Promise resolving to created personal event object
     */
    async create(data: CreatePersonalEventData): Promise<PersonalEvent> {
      return fetchWithErrorHandling('/api/personal-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },

    /**
     * Updates an existing personal event
     * @param id - Personal event identifier to update
     * @param data - Updated personal event data
     * @returns Promise resolving to updated personal event object
     */
    async update(id: string, data: UpdatePersonalEventData): Promise<PersonalEvent> {
      return fetchWithErrorHandling(`/api/personal-events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },

    /**
     * Deletes a personal event by ID
     * @param id - Personal event identifier to delete
     * @returns Promise resolving to deletion confirmation message
     */
    async delete(id: string): Promise<{ message: string }> {
      return fetchWithErrorHandling(`/api/personal-events/${id}`, {
        method: 'DELETE',
      })
    },

    /**
     * Toggles payment status for a personal event participant
     * @param eventId - Personal event identifier
     * @param memberId - Member identifier
     * @returns Promise resolving to payment status update confirmation
     */
    async togglePayment(eventId: string, memberId: string): Promise<{ message: string; participant: any }> {
      return fetchWithErrorHandling(`/api/personal-events/${eventId}/participants/${memberId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    },
  },
}
export default api