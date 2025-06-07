export interface Member {
    id: string;
    name: string;
    hasPaid: boolean;
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