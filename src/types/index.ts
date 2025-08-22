export interface Member {
    id: string;
    name: string;
    phone?: string;
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