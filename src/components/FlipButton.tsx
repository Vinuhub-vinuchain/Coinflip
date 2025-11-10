import { FC } from "react";

interface FlipButtonProps {
  flipCoin: () => void;
  disabled: boolean;
  flipping: boolean;
}

export const FlipButton: FC<FlipButtonProps> = ({ flipCoin, disabled, flipping }) => (
  <button
    onClick={flipCoin}
    className="btn-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg w-full mb-4 sm:mb-6 text-sm sm:text-base disabled:opacity-50"
    disabled={disabled}
  >
    {flipping ? "Flipping..." : "Flip Coin"}
  </button>
);
