import type { Member, PersonalEvent, PersonalEventParticipant } from '../types'

/**
 * Game interface for payment content generation
 */
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
 * Configuration constants for payment processing
 */
const PAYMENT_CONFIG = {
  /** Maximum length for QR code content to ensure readability */
  MAX_QR_CONTENT_LENGTH: 25,
  /** Default payment content for games */
  DEFAULT_GAME_CONTENT: "Thanh toan cau long",
  /** Default payment content for personal events */
  DEFAULT_PERSONAL_CONTENT: "Thanh toan ca nhan",
  /** Bank code for VietcomBank */
  VIETCOMBANK_CODE: "970436",
  /** Currency code for Vietnamese Dong */
  CURRENCY_CODE: "VND",
  /** Locale for Vietnamese formatting */
  VI_LOCALE: "vi-VN",
} as const

// ====================================================
// DATE FORMATTING UTILITIES
// ====================================================

/**
 * Formats a date to DD.MM format for payment content
 * @param date - Date to format
 * @returns Formatted date string (e.g., "15.3")
 */
const formatDateForPayment = (date: Date): string => {
  const day = date.getDate()
  const month = date.getMonth() + 1
  return `${day}.${month}`
}

/**
 * Truncates content to ensure QR code readability
 * @param content - Content to truncate
 * @param maxLength - Maximum allowed length
 * @returns Truncated content if necessary
 */
const truncateContentForQR = (content: string, maxLength: number = PAYMENT_CONFIG.MAX_QR_CONTENT_LENGTH): string => {
  return content.length > maxLength ? content.substring(0, maxLength) : content
}

// ====================================================
// PAYMENT CONTENT GENERATORS
// ====================================================

/**
 * Generates payment content for badminton game payments
 * Optimized for QR code length constraints and Vietnamese banking systems
 * @param member - Member making the payment
 * @param games - Array of games to pay for
 * @returns Formatted payment content string
 */
export const generateGamePaymentContent = (member: Member, games: Game[]): string => {
  // Input validation
  if (!member || games.length === 0) {
    return PAYMENT_CONFIG.DEFAULT_GAME_CONTENT
  }

  // Get the most recent game for date reference
  const sortedGames = games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const latestGame = sortedGames[0]
  const formattedDate = formatDateForPayment(new Date(latestGame.date))
  
  // Generate content: [MEMBER NAME] - CL -> [DATE]
  const content = `${member.name.toUpperCase()} - CL -> ${formattedDate}`
  
  return truncateContentForQR(content)
}

/**
 * Generates payment content for individual personal event payments
 * Optimized for QR code length constraints and banking system compatibility
 * @param personalEvent - Personal event being paid for
 * @param member - Member making the payment
 * @returns Formatted payment content string
 */
export const generatePersonalEventPaymentContent = (
  personalEvent: PersonalEvent, 
  member: Member
): string => {
  // Input validation
  if (!personalEvent || !member) {
    return PAYMENT_CONFIG.DEFAULT_PERSONAL_CONTENT
  }

  const formattedDate = formatDateForPayment(new Date(personalEvent.date))
  
  // Generate content: [MEMBER NAME] - [EVENT TITLE] -> [DATE]
  let content = `${member.name.toUpperCase()} - ${personalEvent.title.toUpperCase()} -> ${formattedDate}`
  
  // Fallback to shorter format if too long
  if (content.length > PAYMENT_CONFIG.MAX_QR_CONTENT_LENGTH) {
    content = `${member.name.toUpperCase()} - PE -> ${formattedDate}`
  }
  
  return truncateContentForQR(content)
}

/**
 * Generates payment content for bulk personal event payments (pay all mode)
 * Optimized for QR code length constraints
 * @param personalEvent - Personal event being paid for
 * @param unpaidParticipants - Array of unpaid participants
 * @returns Formatted payment content string for bulk payment
 */
export const generatePayAllPersonalEventContent = (
  personalEvent: PersonalEvent, 
  unpaidParticipants: PersonalEventParticipant[]
): string => {
  // Input validation
  if (!personalEvent || unpaidParticipants.length === 0) {
    return PAYMENT_CONFIG.DEFAULT_PERSONAL_CONTENT
  }

  const formattedDate = formatDateForPayment(new Date(personalEvent.date))
  
  // Generate content: [EVENT TITLE] - TAT CA -> [DATE]
  let content = `${personalEvent.title.toUpperCase()} - TAT CA -> ${formattedDate}`
  
  // Fallback to shorter format if too long
  if (content.length > PAYMENT_CONFIG.MAX_QR_CONTENT_LENGTH) {
    content = `PE TAT CA -> ${formattedDate}`
  }
  
  return truncateContentForQR(content)
}

// ====================================================
// BANKING AND URL UTILITIES
// ====================================================

/**
 * Detects if the current device is mobile for banking app integration
 * @returns True if the device is mobile, false otherwise
 */
const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase()
  return /android|iphone|ipad|ipod|mobile/.test(userAgent)
}

/**
 * Generates VietQR banking app URL for mobile payments
 * Supports both mobile app deep links and web QR generation
 * @param accountNumber - Bank account number for payment
 * @param amount - Payment amount in VND
 * @param content - Payment description/content
 * @returns URL for banking app integration or QR code generation
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
 * Formats a numeric amount to Vietnamese dong currency format
 * @param amount - Amount to format (in VND)
 * @returns Formatted currency string (e.g., "50.000 ₫")
 */
export const formatCurrency = (amount: number): string => {
  // Input validation
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 ₫'
  }

  return new Intl.NumberFormat(PAYMENT_CONFIG.VI_LOCALE, {
    style: "currency",
    currency: PAYMENT_CONFIG.CURRENCY_CODE,
  }).format(amount)
}