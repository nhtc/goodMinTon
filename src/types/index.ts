export interface Member {
    id: string;
    name: string;
    phone?: string;
    avatar?: string; // URL for member avatar image
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    hasPaid?: boolean; // For game participation
    paidAt?: string; // For game participation
}

export interface GameRecord {
    id: string;
    date: string;
    yardCost: number;
    shuttleCockQuantity: number;
    shuttleCockPrice: number;
    totalCost: number;
    membersInvolved: Member[];
    feesShared: Record<string, number>;
    hasPaid: boolean,
    paidAt: string
}

// Personal Event Types
export interface PersonalEvent {
    id: string;
    title: string;
    description?: string;
    date: string;
    location?: string;
    totalCost: number;
    createdAt: string;
    updatedAt: string;
    participants: PersonalEventParticipant[];
}

export interface PersonalEventParticipant {
    id: string;
    personalEventId: string;
    memberId: string;
    customAmount: number;
    hasPaid: boolean;
    paidAt?: string;
    member: Member;
}

// Form and API data types
export interface CreatePersonalEventData {
    title: string;
    description?: string;
    date: string;
    location?: string;
    totalCost?: number;
    participants: {
        memberId: string;
        customAmount: number;
        hasPaid?: boolean;
        paidAt?: string;
    }[];
}

export interface UpdatePersonalEventData {
    title?: string;
    description?: string;
    date?: string;
    location?: string;
    totalCost?: number;
    participants?: {
        memberId: string;
        customAmount: number;
        hasPaid?: boolean;
        paidAt?: string;
    }[];
}

export interface PersonalEventFilters {
    search?: string;
    startDate?: string;
    endDate?: string;
    memberId?: string;
    page?: number;
    limit?: number;
}

export interface PersonalEventListResponse {
    data: PersonalEvent[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Form data types
export interface PersonalEventFormData {
    title: string;
    description: string;
    date: string;
    location: string;
    participants: {
        memberId: string;
        memberName: string;
        customAmount: number;
    }[];
    totalCost: number;
}

// Component prop types
export interface PersonalEventCardProps {
    event: PersonalEvent;
    onClick: (event: PersonalEvent) => void;
    className?: string;
}

export interface PersonalEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event?: PersonalEvent;
    mode: 'create' | 'edit' | 'view';
    onSave?: (data: CreatePersonalEventData | UpdatePersonalEventData) => void;
    onDelete?: (eventId: string) => void;
}

export interface PaymentStatusToggleProps {
    eventId: string;
    memberId: string;
    hasPaid: boolean;
    customAmount: number;
    onToggle: (eventId: string, memberId: string) => void;
    disabled?: boolean;
}

// Utility types
export type PaymentStatus = 'paid' | 'unpaid' | 'all';
export type EventStatus = 'upcoming' | 'past' | 'all';

export interface MemberSelectionState {
    selectedMembers: string[];
    memberAmounts: Record<string, number>;
    totalAmount: number;
    equalShare: number;
}

// API Response types
export interface PersonalEventDetailResponse {
    data: PersonalEvent;
    success: boolean;
}

export interface PaginatedPersonalEventsResponse {
    data: PersonalEvent[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    success: boolean;
}

export interface PersonalEventApiResponse {
    data?: PersonalEvent;
    success: boolean;
    message?: string;
}

export interface PaymentToggleResponse {
    data: {
        participant: PersonalEventParticipant;
        event: PersonalEvent;
    };
    success: boolean;
    message?: string;
}

// Error response types
export interface ApiErrorResponse {
    success: false;
    message: string;
    error?: string;
    details?: Record<string, string[]>;
}

export interface ValidationErrorResponse extends ApiErrorResponse {
    details: Record<string, string[]>;
}

// React Query compatible types
export type PersonalEventQueryData = PersonalEvent[];
export type PersonalEventDetailQueryData = PersonalEvent;
export type PersonalEventMutationData = CreatePersonalEventData | UpdatePersonalEventData;