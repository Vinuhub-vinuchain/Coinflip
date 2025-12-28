import { FC } from "react";
import { LeaderboardEntry } from "../types";

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
}

export const Leaderboard: FC<LeaderboardProps> = ({ leaderboard }) => (
  <div className="w-full">
    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-100 text-center">
      Top Winners
    </h2>

    {leaderboard.length === 0 ? (
      <p className="text-center text-gray-400 italic">No wins recorded yet. Be the first!</p>
    ) : (
      <div className="space-y-2">
        {leaderboard.map((entry, i) => (
          <div
            key={`${entry.player}-${entry.timestamp}`}
            className="flex items-center justify-between bg-gray-700/50 rounded-lg px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-yellow-400">#{i + 1}</span>
              <span className="font-mono text-sm sm:text-base">
                {entry.player.slice(0, 6)}...{entry.player.slice(-4)}
              </span>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-400">
                {parseFloat(entry.payout).toFixed(2)} VIN
              </p>
              <p className="text-xs text-gray-400">
                {new Date(entry.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);