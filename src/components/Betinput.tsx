import { FC } from "react";

interface BetInputProps {
  betAmount: string;
  setBetAmount: (amount: string) => void;
  disabled: boolean;
}

export const BetInput: FC<BetInputProps> = ({ betAmount, setBetAmount, disabled }) => (
  <div className="mb-6 sm:mb-8">
    <label className="block text-gray-200 text-sm sm:text-base mb-2">Bet Amount (VIN)</label>
    <div className="flex gap-2 mb-2">
      <input
        type="number"
        min="0.1"
        max="100000"
        step="0.1"
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
        placeholder="Enter amount"
        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-gray-300 disabled:bg-gray-800 disabled:cursor-not-allowed"
        disabled={disabled}
      />
      <button
        onClick={() => setBetAmount("100000")}
        className="btn-secondary text-white px-4 py-2 rounded-lg text-sm sm:text-base disabled:opacity-50"
        disabled={disabled}
      >
        Max
      </button>
    </div>
    <p className="text-gray-300 text-xs sm:text-sm">Min: 0.1 VIN | Max: 100000 VIN</p>
  </div>
);
