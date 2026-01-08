import { FC } from 'react';
import { FlipResult } from '../types/index';

interface ResultDisplayProps {
  result: FlipResult | null;
}

export const ResultDisplay: FC<ResultDisplayProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div className="mt-6 p-6 bg-gray-800 rounded-xl text-center animate-pulse">
      <h3 className="text-2xl font-bold mb-2">
        {result.won ? 'YOU WON!' : 'You Lost'}
      </h3>
      <p className="text-lg">
        Bet: {result.bet} VIN → Payout: {result.payout} VIN
      </p>
      <p className="text-sm text-gray-400 mt-2">
        {result.choice ? 'Heads' : 'Tails'} vs {result.result ? 'Heads' : 'Tails'}
      </p>
    </div>
  );
};
