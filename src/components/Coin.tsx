import { FC } from "react";

export type CoinSide = "heads" | "tails";

interface CoinProps {
  side: CoinSide;
  isFlipping: boolean;
}

export const Coin: FC<CoinProps> = ({ side, isFlipping }) => (
  <div className="coin-container mb-6 sm:mb-8 mx-auto">
    <div className={`coin ${isFlipping ? "flipping" : side}`}>
      <div className="side heads">
        <img src="/heads.png" alt="Heads" />
      </div>
      <div className="side tails">
        <img src="/tails.png" alt="Tails" />
      </div>
    </div>
  </div>
);
