import { FC } from "react";
import { LeaderboardEntry } from "../types";

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
}

export const Leaderboard: FC<LeaderboardProps> = ({ leaderboard }) => (
  <div>
    <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-100">Leaderboard</h2>
    {leaderboard.length === 0 ? (
      <p className="text-gray-300 text-sm sm:text-base">No wins yet.</p>
    ) : (
      <ul className="text-gray-200 text-sm sm:text-base">
        {leaderboard.map((entry, i) => (
          <li key={i} className="mb-1">
            {entry.player.slice(0, 6)}...{entry.player.slice(-4)} won {entry.payout} VIN ({new Date(entry.timestamp).toLocaleString()})
          </li>
        ))}
      </ul>
    )}
  </div>
);
