import type { Member, PersonalEvent, PersonalEventParticipant } from '../types'

interface Game {
  id: string
  date: string
  costPerMember: number
  participants: Array<{
    id: string
    name: string
    phone?: string
    participantId: string
    hasPaid: boolean
    paidAt?: string
    prePaid: number
  }>
}

/**
 * Generates payment content for game payments
 * Optimized for QR code length constraints
 */
export const generateGamePaymentContent = (member: Member, games: Game[]): string => {
  if (!member || games.length === 0) return "Thanh toan cau long"

  const sortedGames = games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const latestGame = sortedGames[0]
  const gameDate = new Date(latestGame.date)
  const day = gameDate.getDate()
  const month = gameDate.getMonth() + 1

  let content = `${member.name.toUpperCase()} - CL -> ${day}.${month}`
  
  // Ensure content is not too long for QR code (max ~25 characters for better QR generation)
  if (content.length > 25) {
    content = `${member.name.toUpperCase()} - CL -> ${day}.${month}`
  }
  
  return content
}

/**
 * Generates payment content for individual personal event payments
 * Optimized for QR code length constraints
 */
export const generatePersonalEventPaymentContent = (
  personalEvent: PersonalEvent, 
  member: Member
): string => {
  if (!personalEvent || !member) return "Thanh toan ca nhan"

  const eventDate = new Date(personalEvent.date)
  const day = eventDate.getDate()
  const month = eventDate.getMonth() + 1
  
  let content = `${member.name.toUpperCase()} - ${personalEvent.title.toUpperCase()} -> ${day}.${month}`
  
  // Ensure content is not too long for QR code (max ~25 characters)
  if (content.length > 25) {
    content = `${member.name.toUpperCase()} - PE -> ${day}.${month}`
  }
  
  return content
}

/**
 * Generates payment content for pay all personal events
 * Optimized for QR code length constraints
 */
export const generatePayAllPersonalEventContent = (
  personalEvent: PersonalEvent, 
  unpaidParticipants: PersonalEventParticipant[]
): string => {
  if (!personalEvent || unpaidParticipants.length === 0) return "Thanh toan ca nhan"

  const eventDate = new Date(personalEvent.date)
  const day = eventDate.getDate()
  const month = eventDate.getMonth() + 1
  
  let content = `${personalEvent.title.toUpperCase()} - TAT CA -> ${day}.${month}`
  
  // Ensure content is not too long for QR code (max ~25 characters)
  if (content.length > 25) {
    content = `PE TAT CA -> ${day}.${month}`
  }
  
  return content
}

/**
 * Generates VietQR banking app URL for mobile payments
 */
export const generateBankingAppUrl = (
  accountNumber: string,
  amount: number,
  content: string
): string => {
  const baseUrl = `https://qr.sepay.vn/img?acc=${accountNumber}&bank=970436&amount=${amount}&des=${encodeURIComponent(content)}`
  
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobile = /android|iphone|ipad|ipod|mobile/.test(userAgent)

  if (isMobile) {
    return `intent://payment?bank=970436&account=${accountNumber}&amount=${amount}&content=${encodeURIComponent(content)}#Intent;scheme=vietqr;package=com.vietcombank.mobile;end`
  }

  return baseUrl
}

/**
 * Formats currency to Vietnamese dong format
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}