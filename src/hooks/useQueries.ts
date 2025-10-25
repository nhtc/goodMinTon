import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../lib/api'
import type { 
  PersonalEventFilters, 
  CreatePersonalEventData, 
  UpdatePersonalEventData,
  PersonalEvent,
  PersonalEventParticipant
} from '../types'

/**
 * Member interface for type safety
 */
interface Member {
  id: string
  name: string
  phone?: string
  createdAt: string
  isActive?: boolean
}

/**
 * Game participant interface extending member data
 */
interface GameParticipant {
  /** Member's unique identifier */
  id: string
  /** Member's display name */
  name: string
  /** Member's phone number */
  phone?: string
  /** Participation record ID */
  participantId: string
  /** Payment status flag */
  hasPaid: boolean
  /** Payment timestamp */
  paidAt?: string
  /** Pre-paid amount */
  prePaid: number
  /** Custom payment amount override */
  customAmount?: number
}

/**
 * Game interface with participants and cost information
 */
interface Game {
  id: string
  date: string
  costPerMember: number
  participants: GameParticipant[]
}

/**
 * Centralized query keys for cache management and consistency
 */
export const queryKeys = {
  // Base entity keys
  members: ['members'] as const,
  activeMembers: ['members', 'active'] as const,
  games: ['games'] as const,
  
  // Parameterized keys
  game: (id: string) => ['games', id] as const,
  memberOutstanding: (memberId: string) => ['member-outstanding', memberId] as const,
  memberPaymentInfo: (memberId: string) => ['member-payment-info', memberId] as const,
  personalEvents: ['personalEvents'] as const,
  personalEventsWithFilters: (filters?: PersonalEventFilters) => ['personalEvents', filters] as const,
  personalEvent: (id: string) => ['personalEvents', id] as const,
}

/**
 * Configuration constants for query caching
 */
const CACHE_CONFIG = {
  /** Standard stale time for member data */
  MEMBERS_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  /** Standard garbage collection time */
  STANDARD_GC_TIME: 10 * 60 * 1000, // 10 minutes
  /** Shorter stale time for payment-sensitive data */
  PAYMENT_STALE_TIME: 2 * 60 * 1000, // 2 minutes
  /** Short stale time for calculations */
  CALCULATION_STALE_TIME: 1 * 60 * 1000, // 1 minute
  /** Short GC time for calculations */
  CALCULATION_GC_TIME: 5 * 60 * 1000, // 5 minutes
} as const

// ============================================
// MEMBER HOOKS
// ============================================

/**
 * Hook to fetch all members
 * @returns Query result with all members data
 */
export const useMembers = () => {
  return useQuery({
    queryKey: queryKeys.members,
    queryFn: apiService.members.getAll,
    staleTime: CACHE_CONFIG.MEMBERS_STALE_TIME,
    gcTime: CACHE_CONFIG.STANDARD_GC_TIME,
  })
}

/**
 * Hook to fetch only active members
 * @returns Query result with active members data
 */
export const useActiveMembers = () => {
  return useQuery({
    queryKey: queryKeys.activeMembers,
    queryFn: apiService.members.getActive,
    staleTime: CACHE_CONFIG.MEMBERS_STALE_TIME,
    gcTime: CACHE_CONFIG.STANDARD_GC_TIME,
  })
}

// ============================================
// GAME HOOKS  
// ============================================

/**
 * Hook to fetch all games with payment data (supports pagination and filtering)
 * @param options - Optional pagination and filter parameters
 * @returns Query result with games data (paginated or all)
 */
export const useGames = (options?: { 
  page?: number; 
  limit?: number; 
  paginate?: boolean;
  search?: string;
  paymentStatus?: 'all' | 'paid' | 'unpaid';
}) => {
  return useQuery({
    queryKey: [...queryKeys.games, options],
    queryFn: () => apiService.games.getAll(options),
    staleTime: CACHE_CONFIG.PAYMENT_STALE_TIME,
    gcTime: CACHE_CONFIG.STANDARD_GC_TIME,
  })
}

/**
 * Hook to fetch a specific game by ID
 * @param id - Game identifier
 * @returns Query result with single game data
 */
export const useGame = (id: string) => {
  return useQuery({
    queryKey: queryKeys.game(id),
    queryFn: () => apiService.games.getById(id),
    enabled: !!id,
    staleTime: CACHE_CONFIG.PAYMENT_STALE_TIME,
    gcTime: CACHE_CONFIG.STANDARD_GC_TIME,
  })
}

/**
 * Hook to calculate a member's outstanding payment amount
 * @param memberId - Member identifier (nullable)
 * @returns Query result with outstanding amount and unpaid games
 */
export const useMemberOutstanding = (memberId: string | null) => {
  // Fetch all games without pagination for outstanding calculations
  const { data: gamesResponse, isLoading: gamesLoading, error: gamesError, dataUpdatedAt } = useGames({ paginate: false })
  
  // Handle both paginated and non-paginated responses
  const games = Array.isArray(gamesResponse) ? gamesResponse : gamesResponse?.data || []
  
  return useQuery({
    queryKey: [...queryKeys.memberOutstanding(memberId || ''), dataUpdatedAt],
    queryFn: () => {
      console.log('🔢 Calculating member outstanding for:', memberId, 'at:', dataUpdatedAt)
      
      if (!memberId || !games || games.length === 0) {
        return {
          totalOutstanding: 0,
          unpaidGames: [] as Game[]
        }
      }

      let totalOutstanding = 0
      const unpaidGames: Game[] = []
      
      games.forEach((game: Game) => {
        const participation = game.participants.find(
          p => p.id === memberId
        )
        if (participation && !participation.hasPaid) {
          const gameOutstanding = game.costPerMember - participation.prePaid + (participation.customAmount || 0)
          totalOutstanding += gameOutstanding
          unpaidGames.push(game)
        }
      })

      console.log('💰 Member outstanding calculated:', { totalOutstanding, unpaidGamesCount: unpaidGames.length })
      
      return {
        totalOutstanding,
        unpaidGames
      }
    },
    enabled: !!memberId && !!games && !gamesLoading,
    staleTime: 0, // Always consider data stale to force refetch when dependencies change
    gcTime: CACHE_CONFIG.CALCULATION_GC_TIME,
    placeholderData: {
      totalOutstanding: 0,
      unpaidGames: [] as Game[]
    }
  })
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook to create a new game with cache invalidation
 * @returns Mutation hook for creating games
 */
export const useCreateGame = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiService.games.create,
    onSuccess: () => {
      // Invalidate and refetch games
      queryClient.invalidateQueries({ queryKey: queryKeys.games })
      // Also invalidate member outstanding calculations
      queryClient.invalidateQueries({ queryKey: ['member-outstanding'] })
    },
    onError: (error) => {
      console.error('Failed to create game:', error)
    },
  })
}

/**
 * Hook to update an existing game
 * @returns Mutation hook for updating games
 */
export const useUpdateGame = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ gameId, gameData }: { gameId: string; gameData: any }) => 
      apiService.games.update(gameId, gameData),
    onSuccess: (_, { gameId }) => {
      // Invalidate specific game and all games
      queryClient.invalidateQueries({ queryKey: queryKeys.game(gameId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.games })
      queryClient.invalidateQueries({ queryKey: ['member-outstanding'] })
    },
    onError: (error) => {
      console.error('Failed to update game:', error)
    },
  })
}

export const useTogglePayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ gameId, participantId, hasPaid }: { 
      gameId: string; 
      participantId: string; 
      hasPaid: boolean 
    }) => apiService.games.togglePayment(gameId, participantId, hasPaid),
    onSuccess: () => {
      // Invalidate games and outstanding calculations
      queryClient.invalidateQueries({ queryKey: queryKeys.games })
      queryClient.invalidateQueries({ queryKey: ['member-outstanding'] })
    },
  })
}

export const useCreateMember = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiService.members.create,
    onSuccess: () => {
      // Invalidate members queries
      queryClient.invalidateQueries({ queryKey: queryKeys.members })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeMembers })
    },
  })
}

export const useUpdateMember = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, memberData }: { id: string; memberData: any }) => 
      apiService.members.update(id, memberData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeMembers })
    },
  })
}

export const useDeleteMember = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiService.members.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeMembers })
      queryClient.invalidateQueries({ queryKey: queryKeys.games })
      queryClient.invalidateQueries({ queryKey: ['member-outstanding'] })
    },
  })
}

export const useToggleMemberStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiService.members.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeMembers })
    },
  })
}

// ============================================
// PERSONAL EVENTS HOOKS
// ============================================

/**
 * Hook to fetch personal events with optional filtering
 * @param filters - Optional filters for personal events
 * @returns Query result with filtered personal events data
 */
export const usePersonalEvents = (filters?: PersonalEventFilters) => {
  return useQuery({
    queryKey: queryKeys.personalEventsWithFilters(filters),
    queryFn: () => apiService.personalEvents.getAll(filters),
    staleTime: CACHE_CONFIG.PAYMENT_STALE_TIME,
    gcTime: CACHE_CONFIG.STANDARD_GC_TIME,
  })
}

/**
 * Hook to fetch a specific personal event by ID
 * @param id - Personal event identifier
 * @returns Query result with single personal event data
 */
export const usePersonalEvent = (id: string) => {
  return useQuery({
    queryKey: queryKeys.personalEvent(id),
    queryFn: () => apiService.personalEvents.getById(id),
    enabled: !!id,
    staleTime: CACHE_CONFIG.PAYMENT_STALE_TIME,
    gcTime: CACHE_CONFIG.STANDARD_GC_TIME,
  })
}

/**
 * Hook to create a new personal event with cache management
 * @returns Mutation hook for creating personal events
 */
export const useCreatePersonalEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreatePersonalEventData) => apiService.personalEvents.create(data),
    onSuccess: () => {
      // Invalidate and refetch personal events
      queryClient.invalidateQueries({ queryKey: queryKeys.personalEvents })
      // Also invalidate filtered queries
      queryClient.invalidateQueries({ queryKey: ['personalEvents'] })
    },
    onError: (error) => {
      console.error('Failed to create personal event:', error)
    },
  })
}

/**
 * Hook to update an existing personal event
 * @returns Mutation hook for updating personal events
 */
export const useUpdatePersonalEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ eventId, eventData }: { eventId: string; eventData: UpdatePersonalEventData }) => 
      apiService.personalEvents.update(eventId, eventData),
    onSuccess: (_, { eventId }) => {
      // Invalidate specific event and all events
      queryClient.invalidateQueries({ queryKey: queryKeys.personalEvent(eventId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.personalEvents })
      queryClient.invalidateQueries({ queryKey: ['personalEvents'] })
    },
    onError: (error) => {
      console.error('Failed to update personal event:', error)
    },
  })
}

/**
 * Hook to delete a personal event
 * @returns Mutation hook for deleting personal events
 */
export const useDeletePersonalEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (eventId: string) => apiService.personalEvents.delete(eventId),
    onSuccess: () => {
      // Invalidate all personal events queries
      queryClient.invalidateQueries({ queryKey: queryKeys.personalEvents })
      queryClient.invalidateQueries({ queryKey: ['personalEvents'] })
    },
    onError: (error) => {
      console.error('Failed to delete personal event:', error)
    },
  })
}

/**
 * Hook to toggle payment status for personal events with optimistic updates
 * Provides immediate UI feedback while the server request is processing
 * @returns Mutation hook with optimistic updates and rollback functionality
 */
export const useTogglePersonalEventPayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ eventId, memberId }: { eventId: string; memberId: string }) => 
      apiService.personalEvents.togglePayment(eventId, memberId),
    
    // Optimistic updates for immediate UI feedback
    onMutate: async ({ eventId, memberId }) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: queryKeys.personalEvent(eventId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.personalEvents })

      // Snapshot the previous values for rollback
      const previousEvent = queryClient.getQueryData<PersonalEvent>(queryKeys.personalEvent(eventId))
      const previousEvents = queryClient.getQueryData<PersonalEvent[]>(queryKeys.personalEvents)

      // Optimistically update the individual event cache
      if (previousEvent) {
        const updatedEvent = {
          ...previousEvent,
          participants: previousEvent.participants.map(p => 
            p.memberId === memberId 
              ? { ...p, hasPaid: !p.hasPaid, paidAt: !p.hasPaid ? new Date().toISOString() : undefined }
              : p
          )
        }
        queryClient.setQueryData(queryKeys.personalEvent(eventId), updatedEvent)
      }

      // Optimistically update the events list cache
      if (previousEvents) {
        const updatedEvents = previousEvents.map(event =>
          event.id === eventId
            ? {
                ...event,
                participants: event.participants.map(p =>
                  p.memberId === memberId 
                    ? { ...p, hasPaid: !p.hasPaid, paidAt: !p.hasPaid ? new Date().toISOString() : undefined }
                    : p
                )
              }
            : event
        )
        queryClient.setQueryData(queryKeys.personalEvents, updatedEvents)
      }

      // Return context for potential rollback
      return { previousEvent, previousEvents, eventId, memberId }
    },
    
    // Rollback optimistic updates on failure
    onError: (err, { eventId, memberId }, context) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(queryKeys.personalEvent(eventId), context.previousEvent)
      }
      if (context?.previousEvents) {
        queryClient.setQueryData(queryKeys.personalEvents, context.previousEvents)
      }
      console.error('Personal event payment toggle failed:', err)
    },
    
    // Always refetch to ensure data consistency
    onSettled: (_, __, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalEvent(eventId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.personalEvents })
      queryClient.invalidateQueries({ queryKey: ['personalEvents'] })
    },
  })
}

/**
 * Hook for bulk payment operations on a member's games and/or personal events
 * Handles marking all unpaid items as paid or vice versa
 * @returns Mutation hook for bulk payment operations
 */
export const useBulkPaymentOperation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      memberId, 
      operation, 
      type 
    }: { 
      memberId: string
      operation: 'mark_all_paid' | 'mark_all_unpaid'
      type: 'games' | 'personal_events' | 'both'
    }) => apiService.members.bulkPaymentOperation(memberId, operation, type),
    
    onSuccess: async (data, { type, memberId }) => {
      console.log('🔄 Bulk payment success, refetching queries...', { type, memberId })
      
      // Invalidate payment info for the specific member
      await queryClient.invalidateQueries({ queryKey: queryKeys.memberPaymentInfo(memberId) })
      
      // Invalidate all related queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['member-outstanding'] })
      
      if (type === 'games' || type === 'both') {
        await queryClient.invalidateQueries({ queryKey: queryKeys.games })
        // Force refetch games to ensure fresh data
        await queryClient.refetchQueries({ queryKey: queryKeys.games })
        console.log('✅ Games queries refetched')
      }
      
      if (type === 'personal_events' || type === 'both') {
        await queryClient.invalidateQueries({ queryKey: queryKeys.personalEvents })
        // Force refetch personal events
        await queryClient.refetchQueries({ queryKey: queryKeys.personalEvents })
        console.log('✅ Personal events queries refetched')
      }
      
      // Also invalidate and refetch members query
      await queryClient.invalidateQueries({ queryKey: queryKeys.members })
      
      // Force refetch member payment info
      await queryClient.refetchQueries({ queryKey: queryKeys.memberPaymentInfo(memberId) })
      
      // Force refetch member outstanding calculations (for backwards compatibility)
      await queryClient.refetchQueries({ queryKey: ['member-outstanding'] })
      console.log('✅ Member payment info refetched')
      
      console.log('✅ All queries refetched successfully')
    },
    
    onError: (error) => {
      console.error('❌ Bulk payment operation failed:', error)
    }
  })
}

/**
 * Hook for fetching comprehensive payment information for a member
 * This replaces the frontend calculation by calling a backend API
 * that returns all payment details (games + events) in one call
 * 
 * @param memberId - The ID of the member to fetch payment info for
 * @returns Query result with payment information
 */
export const useMemberPaymentInfo = (memberId: string | null) => {
  return useQuery({
    queryKey: queryKeys.memberPaymentInfo(memberId || ''),
    queryFn: async () => {
      if (!memberId) {
        return null
      }

      console.log('🔍 Fetching payment info for member:', memberId)
      
      const response = await fetch(`/api/members/${memberId}/payments/info`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch member payment information')
      }

      const data = await response.json()
      console.log('✅ Payment info fetched:', {
        totalOutstanding: data.summary.totalOutstanding,
        unpaidGames: data.games.unpaidGames.length,
        unpaidEvents: data.personalEvents.unpaidEvents.length
      })
      
      return data
    },
    enabled: !!memberId,
    staleTime: CACHE_CONFIG.PAYMENT_STALE_TIME,
    gcTime: CACHE_CONFIG.STANDARD_GC_TIME,
  })
}