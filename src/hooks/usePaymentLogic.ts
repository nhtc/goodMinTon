import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePersonalEvents } from './useQueries'
import type { Member, PersonalEvent, PersonalEventParticipant } from '../types'

interface PaymentInfo {
  bankName: string
  accountNumber: string
  accountHolder: string
  amount?: number
  content?: string
}

type PaymentType = 'games' | 'personal-events'
type PaymentSource = 'member' | 'specific' | 'personal-event'

interface UsePaymentLogicReturn {
  paymentInfo: PaymentInfo
  setPaymentInfo: React.Dispatch<React.SetStateAction<PaymentInfo>>
  paymentType: PaymentType
  setPaymentType: React.Dispatch<React.SetStateAction<PaymentType>>
  paymentSource: PaymentSource
  setPaymentSource: React.Dispatch<React.SetStateAction<PaymentSource>>
  selectedPersonalEvent: PersonalEvent | null
  setSelectedPersonalEvent: React.Dispatch<React.SetStateAction<PersonalEvent | null>>
  selectedParticipant: PersonalEventParticipant | null
  setSelectedParticipant: React.Dispatch<React.SetStateAction<PersonalEventParticipant | null>>
  isPayAllMode: boolean
}

export const usePaymentLogic = () => {
  const searchParams = useSearchParams()
  const { data: personalEventsData } = usePersonalEvents()

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    bankName: "Vietcombank",
    accountNumber: "9937822899",
    accountHolder: "NGUYEN HOANG TUAN CUONG",
    content: "Thanh toan cau long",
  })

  const [paymentType, setPaymentType] = useState<PaymentType>('games')
  const [selectedPersonalEvent, setSelectedPersonalEvent] = useState<PersonalEvent | null>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<PersonalEventParticipant | null>(null)
  const [paymentSource, setPaymentSource] = useState<PaymentSource>('member')

  const isPayAllMode = searchParams.get("payAll") === 'true'

  // Handle URL parameters for personal events
  useEffect(() => {
    const personalEventId = searchParams.get("personalEventId")
    const participantId = searchParams.get("participantId")
    const payAll = searchParams.get("payAll")

    if (personalEventId) {
      setPaymentSource('personal-event')
      setPaymentType('personal-events')
      
      const personalEvents = personalEventsData?.data || []
      const personalEvent = personalEvents.find(e => e.id === personalEventId)
      
      if (personalEvent) {
        setSelectedPersonalEvent(personalEvent)
        
        if (payAll === 'true') {
          // Pay All mode handled by parent component
          return
        } else if (participantId) {
          const participant = personalEvent.participants.find(p => p.memberId === participantId)
          if (participant) {
            setSelectedParticipant(participant)
          }
        }
      }
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