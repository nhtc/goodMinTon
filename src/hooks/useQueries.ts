import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../lib/api'
import type { 
  PersonalEventFilters, 
  CreatePersonalEventData, 
  UpdatePersonalEventData,
  PersonalEvent,
  PersonalEventParticipant
} from '../types'

// Types
interface Member {
  id: string
  name: string
  phone?: string
  createdAt: string
  isActive?: boolean
}

interface GameParticipant {
  id: string // This is the member's ID (from member object)
  name: string
  phone?: string
  participantId: string // This is the participation record ID
  hasPaid: boolean
  paidAt?: string
  prePaid: number
  customAmount?: number
}

interface Game {
  id: string
  date: string
  costPerMember: number
  participants: GameParticipant[]
}

// Query Keys - centralized for consistency
export const queryKeys = {
  members: ['members'] as const,
  activeMembers: ['members', 'active'] as const,
  games: ['games'] as const,
  game: (id: string) => ['games', id] as const,
  memberOutstanding: (memberId: string) => ['member-outstanding', memberId] as const,
  personalEvents: ['personalEvents'] as const,
  personalEventsWithFilters: (filters?: PersonalEventFilters) => ['personalEvents', filters] as const,
  personalEvent: (id: string) => ['personalEvents', id] as const,
}

// Members Hooks
export const useMembers = () => {
  return useQuery({
    queryKey: queryKeys.members,
    queryFn: apiService.members.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useActiveMembers = () => {
  return useQuery({
    queryKey: queryKeys.activeMembers,
    queryFn: apiService.members.getActive,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Games Hooks
export const useGames = () => {
  return useQuery({
    queryKey: queryKeys.games,
    queryFn: apiService.games.getAll,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for payment data)
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useGame = (id: string) => {
  return useQuery({
    queryKey: queryKeys.game(id),
    queryFn: () => apiService.games.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Custom hook for member outstanding amount calculation
export const useMemberOutstanding = (memberId: string | null) => {
  const { data: games, isLoading: gamesLoading, error: gamesError } = useGames()
  
  return useQuery({
    queryKey: queryKeys.memberOutstanding(memberId || ''),
    queryFn: () => {
      if (!memberId || !games) {
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
          const gameOutstanding = game.costPerMember - participation.prePaid
          totalOutstanding += gameOutstanding
          unpaidGames.push(game)
        }
      })

      return {
        totalOutstanding,
        unpaidGames
      }
    },
    enabled: !!memberId && !!games && !gamesLoading,
    staleTime: 1 * 60 * 1000, // 1 minute for outstanding calculations
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Add placeholderData to prevent flashing
    placeholderData: {
      totalOutstanding: 0,
      unpaidGames: [] as Game[]
    }
  })
}

// Mutation hooks for updating data
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
  })
}

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

// Personal Events Hooks
export const usePersonalEvents = (filters?: PersonalEventFilters) => {
  return useQuery({
    queryKey: queryKeys.personalEventsWithFilters(filters),
    queryFn: () => apiService.personalEvents.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const usePersonalEvent = (id: string) => {
  return useQuery({
    queryKey: queryKeys.personalEvent(id),
    queryFn: () => apiService.personalEvents.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

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
  })
}

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
  })
}

export const useDeletePersonalEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (eventId: string) => apiService.personalEvents.delete(eventId),
    onSuccess: () => {
      // Invalidate all personal events queries
      queryClient.invalidateQueries({ queryKey: queryKeys.personalEvents })
      queryClient.invalidateQueries({ queryKey: ['personalEvents'] })
    },
  })
}

export const useTogglePersonalEventPayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ eventId, memberId }: { eventId: string; memberId: string }) => 
      apiService.personalEvents.togglePayment(eventId, memberId),
    // Optimistic updates
    onMutate: async ({ eventId, memberId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.personalEvent(eventId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.personalEvents })

      // Snapshot the previous values
      const previousEvent = queryClient.getQueryData<PersonalEvent>(queryKeys.personalEvent(eventId))
      const previousEvents = queryClient.getQueryData<PersonalEvent[]>(queryKeys.personalEvents)

      // Optimistically update the individual event
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

      // Optimistically update the events list
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

      // Return a context object with the snapshotted values
      return { previousEvent, previousEvents, eventId, memberId }
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, { eventId, memberId }, context) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(queryKeys.personalEvent(eventId), context.previousEvent)
      }
      if (context?.previousEvents) {
        queryClient.setQueryData(queryKeys.personalEvents, context.previousEvents)
      }
      console.error('Payment toggle failed:', err)
    },
    // Always refetch after error or success
    onSettled: (_, __, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalEvent(eventId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.personalEvents })
      queryClient.invalidateQueries({ queryKey: ['personalEvents'] })
    },
  })
}