import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../lib/api'

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