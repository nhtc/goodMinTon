import React from 'react';

interface GameRecordProps {
    date: string;
    yardCost: number;
    shuttleCockQuantity: number;
    shuttleCockPrice: number;
    additionalFees: number;
    members: { name: string; paid: boolean }[];
}

const GameRecord: React.FC<GameRecordProps> = ({
    date,
    yardCost,
    shuttleCockQuantity,
    shuttleCockPrice,
    additionalFees,
    members,
}) => {
    const totalShuttleCockCost = shuttleCockQuantity * shuttleCockPrice;
    const totalCost = yardCost + totalShuttleCockCost + additionalFees;
    const costPerMember = totalCost / members.length;

    return (
        <div className="game-record">
            <h3>Game Date: {date}</h3>
            <p>Yard Cost: ${yardCost.toFixed(2)}</p>
            <p>Shuttle Cock Quantity: {shuttleCockQuantity}</p>
            <p>Shuttle Cock Price: ${shuttleCockPrice.toFixed(2)}</p>
            <p>Total Shuttle Cock Cost: ${totalShuttleCockCost.toFixed(2)}</p>
            <p>Additional Fees: ${additionalFees.toFixed(2)}</p>
            <p>Total Cost: ${totalCost.toFixed(2)}</p>
            <p>Cost per Member: ${costPerMember.toFixed(2)}</p>
            <h4>Members:</h4>
            <ul>
                {members.map((member, index) => (
                    <li key={index}>
                        {member.name} - {member.paid ? 'Paid' : 'Not Paid'}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GameRecord;