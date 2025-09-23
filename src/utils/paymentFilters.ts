/**
 * Payment filtering utilities for games and personal events
 */

import { PersonalEvent, PersonalEventParticipant } from '@/types'

// Types for game data (compatible with existing codebase)
export interface GameParticipant {
  id: string
  name: string
  hasPaid?: boolean
  paidAt?: string
  prePaid?: number
  prePaidCategory?: string
  customAmount?: number
  avatar?: string
  phone?: string
  participantId?: string
}

export interface Game {
  id: string
  date: string
  location?: string
  yardCost: number
  shuttleCockQuantity: number
  shuttleCockPrice: number
  otherFees: number
  totalCost: number
  costPerMember: number
  participants: GameParticipant[]
  createdAt: string
  [key: string]: any // Allow other properties
}

export type PaymentStatusFilter = 'all' | 'paid' | 'unpaid'

/**
 * Check if a game has any unpaid participants
 */
export const hasUnpaidParticipants = (game: Game): boolean => {
  return game.participants.some(participant => !participant.hasPaid)
}

/**
 * Check if all participants in a game have paid
 */
export const allParticipantsPaid = (game: Game): boolean => {
  return game.participants.length > 0 && game.participants.every(participant => participant.hasPaid)
}

/**
 * Filter games based on payment status
 */
export const filterGamesByPaymentStatus = (
  games: Game[],
  paymentStatus: PaymentStatusFilter
): Game[] => {
  if (paymentStatus === 'all') {
    return games
  }

  return games.filter(game => {
    if (paymentStatus === 'unpaid') {
      return hasUnpaidParticipants(game)
    } else if (paymentStatus === 'paid') {
      return allParticipantsPaid(game)
    }
    return true
  })
}

/**
 * Check if a personal event has any unpaid participants
 */
export const personalEventHasUnpaidParticipants = (event: PersonalEvent): boolean => {
  return event.participants.some(participant => !participant.hasPaid)
}

/**
 * Check if all participants in a personal event have paid
 */
export const personalEventAllParticipantsPaid = (event: PersonalEvent): boolean => {
  return event.participants.length > 0 && event.participants.every(participant => participant.hasPaid)
}

/**
 * Filter personal events based on payment status
 */
export const filterPersonalEventsByPaymentStatus = (
  events: PersonalEvent[],
  paymentStatus: PaymentStatusFilter
): PersonalEvent[] => {
  if (paymentStatus === 'all') {
    return events
  }

  return events.filter(event => {
    if (paymentStatus === 'unpaid') {
      return personalEventHasUnpaidParticipants(event)
    } else if (paymentStatus === 'paid') {
      return personalEventAllParticipantsPaid(event)
    }
    return true
  })
}

/**
 * Get payment status statistics for games
 */
export const getGamePaymentStats = (games: Game[]) => {
  const totalGames = games.length
  const paidGames = games.filter(allParticipantsPaid).length
  const unpaidGames = games.filter(hasUnpaidParticipants).length
  
  return {
    total: totalGames,
    paid: paidGames,
    unpaid: unpaidGames,
    paidPercentage: totalGames > 0 ? Math.round((paidGames / totalGames) * 100) : 0
  }
}

/**
 * Get payment status statistics for personal events
 */
export const getPersonalEventPaymentStats = (events: PersonalEvent[]) => {
  const totalEvents = events.length
  const paidEvents = events.filter(personalEventAllParticipantsPaid).length
  const unpaidEvents = events.filter(personalEventHasUnpaidParticipants).length
  
  return {
    total: totalEvents,
    paid: paidEvents,
    unpaid: unpaidEvents,
    paidPercentage: totalEvents > 0 ? Math.round((paidEvents / totalEvents) * 100) : 0
  }
}