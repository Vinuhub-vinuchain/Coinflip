import { FC } from "react";

interface CoinProps {
  coinSide: "heads" | "tails";
  flipping: boolean;
}

export const Coin: FC<CoinProps> = ({ coinSide, flipping }) => (
  <div className="coin-container mb-6 sm:mb-8 mx-auto">
    <div className={`coin ${flipping ? "flipping" : coinSide}`}>
      <div className="side heads">
        <img src="/heads.png" alt="Heads" />
      </div>
      <div className="side tails">
        <img src="/tails.png" alt="Tails" />
      </div>
    </div>
  </div>
);
