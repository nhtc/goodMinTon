import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePersonalEvents } from './useQueries'
import type { Member, PersonalEvent, PersonalEventParticipant } from '../types'

/**
 * Payment information interface containing bank details and transaction data
 */
interface PaymentInfo {
  /** Name of the bank for payment */
  bankName: string
  /** Account number for receiving payment */
  accountNumber: string
  /** Full name of account holder */
  accountHolder: string
  /** Payment amount in VND (optional) */
  amount?: number
  /** Payment description/content (optional) */
  content?: string
}

/**
 * Type of payment being processed
 */
type PaymentType = 'games' | 'personal-events'

/**
 * Source of payment selection
 */
type PaymentSource = 'member' | 'specific' | 'personal-event'

/**
 * Return type for usePaymentLogic hook
 */
interface UsePaymentLogicReturn {
  /** Current payment information state */
  paymentInfo: PaymentInfo
  /** Setter for payment information */
  setPaymentInfo: React.Dispatch<React.SetStateAction<PaymentInfo>>
  /** Current payment type */
  paymentType: PaymentType
  /** Setter for payment type */
  setPaymentType: React.Dispatch<React.SetStateAction<PaymentType>>
  /** Current payment source */
  paymentSource: PaymentSource
  /** Setter for payment source */
  setPaymentSource: React.Dispatch<React.SetStateAction<PaymentSource>>
  /** Currently selected personal event */
  selectedPersonalEvent: PersonalEvent | null
  /** Setter for selected personal event */
  setSelectedPersonalEvent: React.Dispatch<React.SetStateAction<PersonalEvent | null>>
  /** Currently selected event participant */
  selectedParticipant: PersonalEventParticipant | null
  /** Setter for selected participant */
  setSelectedParticipant: React.Dispatch<React.SetStateAction<PersonalEventParticipant | null>>
  /** Whether in pay-all mode for multiple payments */
  isPayAllMode: boolean
}

/**
 * Custom hook for managing payment logic and state
 * Handles URL parameters, payment type switching, and event/participant selection
 * 
 * @returns Object containing all payment-related state and setters
 */
export const usePaymentLogic = (): UsePaymentLogicReturn => {
  const searchParams = useSearchParams()
  const { data: personalEventsData } = usePersonalEvents()

  // Default payment information for badminton court payments
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    bankName: "Vietcombank",
    accountNumber: "9937822899",
    accountHolder: "NGUYEN HOANG TUAN CUONG",
    content: "Thanh toan cau long",
  })

  // Payment type state - determines UI and logic flow
  const [paymentType, setPaymentType] = useState<PaymentType>('games')
  
  // Selected personal event for personal-events payment type
  const [selectedPersonalEvent, setSelectedPersonalEvent] = useState<PersonalEvent | null>(null)
  
  // Selected participant within a personal event
  const [selectedParticipant, setSelectedParticipant] = useState<PersonalEventParticipant | null>(null)
  
  // Payment source determines the selection method
  const [paymentSource, setPaymentSource] = useState<PaymentSource>('member')

  // Pay-all mode for bulk payments
  const isPayAllMode = searchParams.get("payAll") === 'true'

  /**
   * Validates and extracts URL search parameters
   */
  const extractUrlParams = () => {
    try {
      return {
        personalEventId: searchParams.get("personalEventId"),
        participantId: searchParams.get("participantId"),
        payAll: searchParams.get("payAll")
      }
    } catch (error) {
      console.error('Error extracting URL parameters:', error)
      return { personalEventId: null, participantId: null, payAll: null }
    }
  }

  /**
   * Finds personal event by ID from available events data
   */
  const findPersonalEvent = (eventId: string) => {
    const personalEvents = personalEventsData?.data || []
    return personalEvents.find(e => e.id === eventId) || null
  }

  /**
   * Finds participant by member ID within a personal event
   */
  const findParticipant = (event: PersonalEvent, memberId: string) => {
    return event.participants.find(p => p.memberId === memberId) || null
  }

  /**
   * Sets up payment configuration for personal events
   */
  const setupPersonalEventPayment = (eventId: string) => {
    setPaymentSource('personal-event')
    setPaymentType('personal-events')
    
    const personalEvent = findPersonalEvent(eventId)
    if (personalEvent) {
      setSelectedPersonalEvent(personalEvent)
      return personalEvent
    }
    return null
  }

  /**
   * Handles participant selection for personal events
   */
  const handleParticipantSelection = (event: PersonalEvent, participantId: string) => {
    const participant = findParticipant(event, participantId)
    if (participant) {
      setSelectedParticipant(participant)
    }
  }

  // Handle URL parameters for personal events
  useEffect(() => {
    const { personalEventId, participantId, payAll } = extractUrlParams()

    if (!personalEventId) return

    const personalEvent = setupPersonalEventPayment(personalEventId)
    if (!personalEvent) return

    // Handle pay-all mode - no specific participant selection needed
    if (payAll === 'true') {
      return
    }

    // Handle individual participant selection
    if (participantId) {
      handleParticipantSelection(personalEvent, participantId)
    }
  }, [searchParams, personalEventsData])

  return {
    paymentInfo,
    setPaymentInfo,
    paymentType,
    setPaymentType,
    paymentSource,
    setPaymentSource,
    selectedPersonalEvent,
    setSelectedPersonalEvent,
    selectedParticipant,
    setSelectedParticipant,
    isPayAllMode
  }
}