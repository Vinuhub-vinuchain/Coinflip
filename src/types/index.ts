export interface FlipResult {
  heads: boolean;
  won: boolean;
  bet: string;
  payout: string;
}

export interface LeaderboardEntry {
  player: string;
  payout: string;
  timestamp: number;
}

export interface Web3State {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  vinToken: ethers.Contract | null;
  account: string | null;
  vinBalance: string;
  playerBalance: string;
  contractBalance: string;
  isApproved: boolean;
  connecting: boolean;
  flipping: boolean;
  approving: boolean;
  coinSide: "heads" | "tails";
  choice: boolean;
  betAmount: string;
  history: FlipResult[];
  leaderboard: LeaderboardEntry[];
  lastWin: LeaderboardEntry | null;
  error: string | null;
}
