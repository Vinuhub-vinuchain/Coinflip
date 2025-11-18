import { FC } from 'react';

interface BetControlsProps {
  betAmount: string;
  setBetAmount: (amount: string) => void;
  maxBalance: string;
  disabled: boolean;
}

export const BetControls: FC<BetControlsProps> = ({
  betAmount,
  setBetAmount,
  maxBalance,
  disabled,
}) => {
  return (
    <div className="mb-6">
      <label className="block text-gray-200 mb-2">Bet Amount (VIN)</label>
      <div className="flex gap-3">
        <input
          type="number"
          min="0.1"
          max="100000"
          step="0.1"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          disabled={disabled}
          className="flex-1 px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 border border-gray-600"
        />
        <button
          onClick={() => setBetAmount(maxBalance)}
          disabled={disabled}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
        >
          MAX
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">Min: 0.1 • Max: 100,000 VIN</p>
    </div>
  );
};
