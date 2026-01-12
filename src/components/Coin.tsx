import { FC } from 'react';

interface CoinProps {
  side: "heads" | "tails";
  flipping: boolean;
}

export const Coin: FC<CoinProps> = ({ coinSide, flipping }) => (
  <div className="coin-container mb-6 sm:mb-8 mx-auto">
    <div className={`coin ${flipping ? "flipping" : coinSide}`}>
      <div className="side heads">
        <img 
          src="https://photos.pinksale.finance/file/pinksale-logo-upload/1760517373672-b81d4b93ee4e5dcd9d7463e941d680c4.png" 
          alt="Heads" 
        />
      </div>
      <div className="side tails">
        <img 
          src="https://photos.pinksale.finance/file/pinksale-logo-upload/1760517398339-0e799d5e0f9ab9230cd2fc425ea13ac5.png" 
          alt="Tails" 
        />
      </div>
    </div>
  </div>
);
