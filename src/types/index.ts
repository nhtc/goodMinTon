// ====================================================
// CORE ENTITY TYPES
// ====================================================

/**
 * Represents a member of the badminton group
 */
export interface Member {
    /** Unique identifier for the member */
    id: string;
    /** Display name of the member */
    name: string;
    /** Optional phone number */
    phone?: string;
    /** URL for member avatar image */
    avatar?: string;
    /** Whether the member is currently active */
    isActive: boolean;
    /** When the member was created */
    createdAt: string;
    /** When the member was last updated */
    updatedAt: string;
    /** Payment status for game participation (contextual) */
    hasPaid?: boolean;
    /** When payment was made for game participation (contextual) */
    paidAt?: string;
}

/**
 * Represents a badminton game session record
 */
export interface GameRecord {
    /** Unique identifier for the game */
    id: string;
    /** Date of the game session */
    date: string;
    /** Cost of court rental */
    yardCost: number;
    /** Number of shuttlecocks used */
    shuttleCockQuantity: number;
    /** Price per shuttlecock */
    shuttleCockPrice: number;
    /** Total cost of the game session */
    totalCost: number;
    /** Members who participated in this game */
    membersInvolved: Member[];
    /** How fees are distributed among members */
    feesShared: Record<string, number>;
    /** Whether fees have been paid */
    hasPaid: boolean,
    /** When payment was completed */
    paidAt: string
}

// ====================================================
// PERSONAL EVENT TYPES
// ====================================================

/**
 * Represents a personal event that members can participate in
 */
export interface PersonalEvent {
    /** Unique identifier for the event */
    id: string;
    /** Event title/name */
    title: string;
    /** Optional event description */
    description?: string;
    /** Date of the event */
    date: string;
    /** Optional event location */
    location?: string;
    /** Total cost of the event */
    totalCost: number;
    /** When the event was created */
    createdAt: string;
    /** When the event was last updated */
    updatedAt: string;
    /** List of event participants */
    participants: PersonalEventParticipant[];
}

/**
 * Represents a member's participation in a personal event
 */
export interface PersonalEventParticipant {
    /** Unique identifier for the participation record */
    id: string;
    /** ID of the associated personal event */
    personalEventId: string;
    /** ID of the participating member */
    memberId: string;
    /** Custom amount this participant owes */
    customAmount: number;
    /** Whether this participant has paid */
    hasPaid: boolean;
    /** When payment was made (if paid) */
    paidAt?: string;
    /** Pre-paid amount for this event */
    prePaid?: number;
    /** Category of pre-payment (e.g., "Team Building", "Food") */
    prePaidCategory?: string;
    /** Full member details */
    member: Member;
}

// ====================================================
// REUSABLE UTILITY TYPES
// ====================================================

/**
 * Standard pagination information structure used across API responses
 */
export interface PaginationInfo {
    /** Current page number (1-based) */
    page: number;
    /** Number of items per page */
    limit: number;
    /** Total number of items available */
    totalCount: number;
    /** Total number of pages available */
    totalPages: number;
    /** Whether there are more pages after this one */
    hasNext: boolean;
    /** Whether there are pages before this one */
    hasPrev: boolean;
}

/**
 * Participant data structure for form submissions and API calls
 */
export interface ParticipantData {
    /** ID of the member participating */
    memberId: string;
    /** Amount this participant owes */
    customAmount: number;
    /** Whether this participant has already paid */
    hasPaid?: boolean;
    /** When payment was made (ISO string) */
    paidAt?: string;
    /** Amount this participant has prepaid */
    prePaid?: number;
    /** Category or description of the prepaid amount */
    prePaidCategory?: string;
}

// ====================================================
// FORM AND API DATA TYPES
// ====================================================

/**
 * Data structure for creating a new personal event
 */
export interface CreatePersonalEventData {
    /** Event title */
    title: string;
    /** Optional event description */
    description?: string;
    /** Event date (ISO string) */
    date: string;
    /** Optional event location */
    location?: string;
    /** Optional total cost (calculated from participants if not provided) */
    totalCost?: number;
    /** List of event participants */
    participants: ParticipantData[];
}

/**
 * Data structure for updating an existing personal event
 * All fields are optional to support partial updates
 */
export interface UpdatePersonalEventData {
    /** Updated event title */
    title?: string;
    /** Updated event description */
    description?: string;
    /** Updated event date (ISO string) */
    date?: string;
    /** Updated event location */
    location?: string;
    /** Updated total cost */
    totalCost?: number;
    /** Updated participant list */
    participants?: ParticipantData[];
}

/**
 * Filters for querying personal events
 */
export interface PersonalEventFilters {
    /** Search term for event title or description */
    search?: string;
    /** Filter events starting from this date (ISO string) */
    startDate?: string;
    /** Filter events ending before this date (ISO string) */
    endDate?: string;
    /** Filter events by specific member participation */
    memberId?: string;
    /** Page number for pagination */
    page?: number;
    /** Number of items per page */
    limit?: number;
}

/**
 * Standard API response for paginated personal events
 */
export interface PersonalEventListResponse {
    /** Array of personal events */
    data: PersonalEvent[];
    /** Pagination metadata */
    pagination: PaginationInfo;
}

// ====================================================
// FORM DATA TYPES
// ====================================================

/**
 * Form data structure for personal event creation/editing
 */
export interface PersonalEventFormData {
    /** Event title */
    title: string;
    /** Event description */
    description: string;
    /** Event date (ISO string) */
    date: string;
    /** Event location */
    location: string;
    /** Participant information with display names */
    participants: {
        memberId: string;
        memberName: string;
        customAmount: number;
    }[];
    /** Total calculated cost */
    totalCost: number;
}

/**
 * Member selection state for forms
 */
export interface MemberSelectionState {
    /** Array of selected member IDs */
    selectedMembers: string[];
    /** Mapping of member ID to custom amount */
    memberAmounts: Record<string, number>;
    /** Total amount across all members */
    totalAmount: number;
    /** Equal share per member if split evenly */
    equalShare: number;
}

// ====================================================
// COMPONENT PROP TYPES
// ====================================================

/**
 * Props for PersonalEventCard component
 */
export interface PersonalEventCardProps {
    /** Event to display */
    event: PersonalEvent;
    /** Click handler for event selection */
    onClick: (event: PersonalEvent) => void;
    /** Payment toggle handler for participant */
    onPaymentToggle?: (eventId: string, memberId: string) => void;
    /** Optional additional CSS classes */
    className?: string;
}

/**
 * Props for PersonalEventModal component
 */
export interface PersonalEventModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Handler for closing the modal */
    onClose: () => void;
    /** Event to display/edit (undefined for create mode) */
    event?: PersonalEvent;
    /** Modal operation mode */
    mode: 'create' | 'edit' | 'view';
    /** Handler for saving event data */
    onSave?: (data: CreatePersonalEventData | UpdatePersonalEventData) => void;
    /** Handler for deleting an event */
    onDelete?: (eventId: string) => void;
}

/**
 * Props for payment status toggle component
 */
export interface PaymentStatusToggleProps {
    /** ID of the event */
    eventId: string;
    /** ID of the member */
    memberId: string;
    /** Current payment status */
    hasPaid: boolean;
    /** Amount to be paid */
    customAmount: number;
    /** Handler for payment status toggle */
    onToggle: (eventId: string, memberId: string) => void;
    /** Whether the toggle is disabled */
    disabled?: boolean;
}

// ====================================================
// UTILITY ENUMS AND TYPES
// ====================================================

/** Payment status options for filtering and display */
export type PaymentStatus = 'paid' | 'unpaid' | 'all';

/** Event status based on date for filtering */
export type EventStatus = 'upcoming' | 'past' | 'all';

// ====================================================
// API RESPONSE TYPES
// ====================================================

/**
 * Standard success API response structure
 */
export interface ApiSuccessResponse<T = any> {
    /** Response data */
    data?: T;
    /** Success flag */
    success: true;
    /** Optional success message */
    message?: string;
}

/**
 * Standard error API response structure
 */
export interface ApiErrorResponse {
    /** Success flag (always false) */
    success: false;
    /** Error message */
    message: string;
    /** Optional detailed error description */
    error?: string;
    /** Optional validation error details */
    details?: Record<string, string[]>;
}

/**
 * Validation error response with field-specific errors
 */
export interface ValidationErrorResponse extends ApiErrorResponse {
    /** Field-specific validation errors */
    details: Record<string, string[]>;
}

/**
 * Response for personal event detail API calls
 */
export interface PersonalEventDetailResponse extends ApiSuccessResponse<PersonalEvent> {}

/**
 * Response for paginated personal events API calls
 */
export interface PaginatedPersonalEventsResponse extends ApiSuccessResponse {
    /** Personal events data */
    data: PersonalEvent[];
    /** Pagination information */
    pagination: PaginationInfo;
}

/**
 * Response for personal event CRUD operations
 */
export interface PersonalEventApiResponse extends ApiSuccessResponse<PersonalEvent> {}

/**
 * Response for payment toggle operations
 */
export interface PaymentToggleResponse extends ApiSuccessResponse {
    /** Updated participant and event data */
    data: {
        participant: PersonalEventParticipant;
        event: PersonalEvent;
    };
}

// ====================================================
// REACT QUERY COMPATIBLE TYPES
// ====================================================

/** Query data type for personal events list */
export type PersonalEventQueryData = PersonalEvent[];

/** Query data type for personal event detail */
export type PersonalEventDetailQueryData = PersonalEvent;

/** Mutation data type for personal event operations */
export type PersonalEventMutationData = CreatePersonalEventData | UpdatePersonalEventData;