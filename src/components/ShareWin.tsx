import { FC } from 'react';

interface ShareWinProps {
  payout: string;
}

export const ShareWin: FC<ShareWinProps> = ({ payout }) => {
  const tweetText = `I just won ${payout} VIN on VinuHub Coinflip! Play now: https://vinuhub-coinflip.vercel.app #VinuChain #Web3Gaming`;

  const handleShare = () => {
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      '_blank'
    );
  };

  return (
    <button
      onClick={handleShare}
      className="btn-secondary text-white px-6 py-3 rounded-lg w-full mt-4"
    >
      Share Win on X
    </button>
  );
};
