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