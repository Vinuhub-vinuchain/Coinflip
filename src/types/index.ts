

export type Address = `0x${string}`;

export type CoinSide = 'heads' | 'tails';



export interface FlipResult {
  player: Address;
  choice: boolean;        
  result: boolean;       
  won: boolean;
  bet: string;
  payout: string;
}

export interface LeaderboardEntry {
  player: Address;
  payout: string;
  timestamp: number;
}

/* =======================
   Optional UI State Type
   (Not used in hook yet,
   but safe to keep)
======================= */

export interface Web3State {
  account: Address | null;
  vinBalance: string;
  playerBalance: string;
  contractBalance: string;
  isApproved: boolean;
  connecting: boolean;
  flipping: boolean;
  approving: boolean;
  coinSide: CoinSide;
  choice: boolean;
  betAmount: string;
  history: FlipResult[];
  leaderboard: LeaderboardEntry[];
  lastWin: LeaderboardEntry | null;
  error: string | null;
}
