import { useCoinflip } from './hooks/useCoinflip';
import { Coin } from './components/Coin';
import { BetControls } from './components/BetControls';
import { ResultDisplay } from './components/ResultDisplay';
import { ShareWin } from './components/ShareWin';
import { Leaderboard } from './components/Leaderboard';

function App() {
  const {
    account,
    connectWallet,
    disconnectWallet,
    vinBalance,
    winnings,
    contractBalance,
    betAmount,
    setBetAmount,
    choice,
    setChoice,
    coinSide,
    isFlipping,
    lastResult,
    leaderboard,
    approve,
    isApproving,
    isApproved,
    flip,
    error,
    clearError,
  } = useCoinflip();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="VinuHub" className="h-16 mx-auto mb-4 logo" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            VinuHub Coinflip
          </h1>
          <p className="text-gray-300 mt-2">Flip fate on VinuChain – Feeless & Fair</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/80 border border-red-500 rounded-xl text-center animate-pulse">
            <p>{error}</p>
            <button onClick={clearError} className="text-sm underline mt-2">
              Dismiss
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="card backdrop-blur-xl bg-gray-800/60 border border-gray-700 rounded-3xl p-8 shadow-2xl">

          {/* Wallet Connection */}
          {!account ? (
            <div className="text-center">
              <button
                onClick={connectWallet}
                className="btn-primary pulse px-12 py-5 text-xl rounded-2xl font-bold"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-gray-400">Connected</p>
                  <p className="font-mono text-lg">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary px-6 py-2 rounded-lg"
                >
                  Disconnect
                </button>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-2 gap-4 mb-8 text-center">
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">VIN Balance</p>
                  <p className="text-2xl font-bold">{parseFloat(vinBalance).toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4">
                  <p className="text-gray-200 text-sm">Winnings</p>
                  <p className="text-3xl font-bold">{parseFloat(winnings).toFixed(2)}</p>
                </div>
              </div>

              {/* Contract Balance */}
              <p className="text-center text-gray-400 mb-6">
                Pot: {parseFloat(contractBalance).toFixed(0)} VIN
              </p>

              {/* Approval */}
              {!isApproved && (
                <button
                  onClick={approve}
                  disabled={isApproving}
                  className="w-full btn-primary py-4 text-xl rounded-xl mb-6 font-bold"
                >
                  {isApproving ? 'Approving VIN...' : 'Approve VIN to Play'}
                </button>
              )}

              {/* Bet Controls */}
              {isApproved && (
                <>
                  <BetControls
                    betAmount={betAmount}
                    setBetAmount={setBetAmount}
                    maxBalance={vinBalance}
                    disabled={isFlipping}
                  />

                  {/* Choose Side */}
                  <div className="flex gap-4 mb-8">
                    <button
                      onClick={() => setChoice(true)}
                      disabled={isFlipping}
                      className={`flex-1 py-5 rounded-2xl text-2xl font-bold transition-all ${
                        choice
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg scale-105'
                          : 'bg-gray-700'
                      }`}
                    >
                      Heads
                    </button>
                    <button
                      onClick={() => setChoice(false)}
                      disabled={isFlipping}
                      className={`flex-1 py-5 rounded-2xl text-2xl font-bold transition-all ${
                        !choice
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg scale-105'
                          : 'bg-gray-700'
                      }`}
                    >
                      Tails
                    </button>
                  </div>

                  {/* Coin + Flip Button */}
                  <div className="flex flex-col items-center mb-8">
                    <Coin side={coinSide} isFlipping={isFlipping} />
                    <button
                      onClick={flip}
                      disabled={isFlipping || parseFloat(betAmount) < 0.1}
                      className="mt-8 btn-primary px-16 py-6 text-3xl rounded-full font-bold shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {isFlipping ? 'FLIPPING...' : 'FLIP COIN'}
                    </button>
                  </div>

                  {/* Result */}
                  {lastResult && (
                    <>
                      <ResultDisplay result={lastResult} />
                      {lastResult.won && <ShareWin payout={lastResult.payout} />}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Leaderboard */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-4">Top Winners</h2>
            <Leaderboard entries={leaderboard} />
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Powered by VinuChain • 100% on-chain • Fair & Provable
        </p>
      </div>
    </div>
  );
}
