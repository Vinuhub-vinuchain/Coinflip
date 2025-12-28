import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import confetti from 'canvas-confetti';
import { loadLeaderboard, saveLeaderboard } from '@/lib/storage';
import type {
  Address,
  LeaderboardEntry,
  FlipResult,
  CoinSide,
} from '@/types';

import contractAddresses from '../../contracts/contract-addresses.json';

const CONTRACT_ADDRESS = contractAddresses.Coinflip as Address;
const VIN_TOKEN_ADDRESS = contractAddresses.VinToken as Address;

const CONTRACT_ABI = [
  'function flip(bool _heads, uint256 _amount) external',
  'function withdraw() external',
  'function playerBalances(address) view returns (uint256)',
  'event FlipResult(address indexed player, bool heads, bool won, uint256 bet, uint256 payout)',
  'event Withdrawal(address indexed player, uint256 amount)',
];

const VIN_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
];

export const useCoinflip = () => {
  // === Core Web3 State ===
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [vinToken, setVinToken] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<Address | null>(null);

  // === Game State ===
  const [vinBalance, setVinBalance] = useState<string>('0');
  const [winnings, setWinnings] = useState<string>('0');
  const [contractBalance, setContractBalance] = useState<string>('0');
  const [isApproved, setIsApproved] = useState(false);
  const [betAmount, setBetAmount] = useState<string>('1');
  const [choice, setChoice] = useState<boolean>(true); // true = heads
  const [coinSide, setCoinSide] = useState<CoinSide>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  // Fixed typo: was "|Quart null" → now "| null"
  const [lastResult, setLastResult] = useState<FlipResult | null>(null);
  const [error, setError] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(loadLeaderboard());

  const eventListenerSetup = useRef(false);

  // === Helpers ===
  const clearError = () => setError('');
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(clearError, 8000);
  };

  const playSound = (type: 'flip' | 'win' | 'lose') => {
    const sounds = {
      flip: '/sounds/flip.mp3',
      win: '/sounds/win.mp3',
      lose: '/sounds/lose.mp3',
    };
    const audio = new Audio(sounds[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  // === Wallet Connection ===
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      showError('MetaMask not detected');
      return;
    }

    try {
      const prov = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await prov.send('eth_requestAccounts', []);
      const network = await prov.getNetwork();

      if (network.chainId !== 207) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xCF' }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xCF',
                chainName: 'VinuChain',
                rpcUrls: ['https://rpc.vinuchain.org'],
                nativeCurrency: { name: 'VC', symbol: 'VC', decimals: 18 },
                blockExplorerUrls: ['https://vinuexplorer.org'],
              }],
            });
          }
        }
      }

      const signer = prov.getSigner();
      const address = await signer.getAddress();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tokenContract = new ethers.Contract(VIN_TOKEN_ADDRESS, VIN_ABI, signer);

      setProvider(prov);
      setSigner(signer);
      setContract(gameContract);
      setVinToken(tokenContract);
      setAccount(address as Address);

      await Promise.all([updateBalances(address, gameContract, tokenContract), checkAllowance(address, tokenContract)]);
    } catch (err: any) {
      showError(err.message || 'Failed to connect wallet');
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setVinToken(null);
    setAccount(null);
    setIsApproved(false);
    setWinnings('0');
    setLastResult(null);
    eventListenerSetup.current = false;
  }, []);

  // === Balance & Allowance ===
  const updateBalances = async (addr: string, game: ethers.Contract, token: ethers.Contract) => {
    try {
      const [vin, win, cont] = await Promise.all([
        token.balanceOf(addr),
        game.playerBalances(addr),
        token.balanceOf(CONTRACT_ADDRESS),
      ]);
      setVinBalance(ethers.utils.formatEther(vin));
      setWinnings(ethers.utils.formatEther(win));
      setContractBalance(ethers.utils.formatEther(cont));
    } catch (e) {
      console.error('Balance update failed', e);
    }
  };

  const checkAllowance = async (addr: string, token: ethers.Contract) => {
    try {
      const allowance = await token.allowance(addr, CONTRACT_ADDRESS);
      const needed = ethers.utils.parseEther(betAmount || '0');
      setIsApproved(allowance.gte(needed));
    } catch (e) {
      setIsApproved(false);
    }
  };

  // === Approval ===
  const approve = async () => {
    if (!vinToken || !account) return;
    setIsApproving(true);
    clearError();
    try {
      const amount = ethers.utils.parseEther('1000000'); // large approval
      const tx = await vinToken.approve(CONTRACT_ADDRESS, amount);
      await tx.wait();
      setIsApproved(true);
      showError('Approved successfully!');
    } catch (err: any) {
      showError(err.reason || err.message || 'Approval failed');
    } finally {
      setIsApproving(false);
    }
  };

  // === Flip ===
  const flip = async () => {
    if (!contract || !account || !isApproved) return;

    const amount = ethers.utils.parseEther(betAmount);
    setIsFlipping(true);
    clearError();
    playSound('flip');

    try {
      const tx = await contract.flip(choice, amount);
      await tx.wait();

      // Animation while waiting for event
      setTimeout(() => {
        setIsFlipping(false);
      }, 1500);
    } catch (err: any) {
      setIsFlipping(false);
      showError(err.reason || err.message || 'Flip failed');
    }
  };

  // === Event Listeners (only once) ===
  useEffect(() => {
    if (!contract || !account || eventListenerSetup.current) return;

    const onFlipResult = (
      player: string,
      heads: boolean,
      won: boolean,
      bet: ethers.BigNumber,
      payout: ethers.BigNumber
    ) => {
      if (player.toLowerCase() !== account.toLowerCase()) return;

      const result: FlipResult = {
        player: player as Address,
        choice,
        result: heads,
        won,
        bet: ethers.utils.formatEther(bet),
        payout: ethers.utils.formatEther(payout),
      };

      setLastResult(result);
      setCoinSide(heads ? 'heads' : 'tails');

      if (won) {
        playSound('win');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        });

        const entry: LeaderboardEntry = {
          player: account,
          payout: result.payout,
          timestamp: Date.now(),
        };

        const updated = [...leaderboard.filter(e => e.player !== account), entry]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);

        setLeaderboard(updated);
        saveLeaderboard(updated);
      } else {
        playSound('lose');
      }

      updateBalances(account, contract, vinToken!);
    };

    contract.on('FlipResult', onFlipResult);
    eventListenerSetup.current = true;

    return () => {
      contract.off('FlipResult', onFlipResult);
    };
  }, [contract, account, choice, leaderboard, vinToken]);

  // === Expose Everything ===
  return {
    // Web3
    account,
    connectWallet,
    disconnectWallet,

    // Balances
    vinBalance,
    winnings,
    contractBalance,

    // Game state
    betAmount,
    setBetAmount,
    choice,
    setChoice: (heads: boolean) => setChoice(heads),
    coinSide,
    isFlipping,
    lastResult,
    leaderboard,

    // Actions
    approve,
    isApproving,
    isApproved,
    flip,

    // UI
    error,
    clearError,
  };
};