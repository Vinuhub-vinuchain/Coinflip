import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';

declare module 'canvas-confetti' {
  export default function confetti(options?: any): Promise<void>;
}

import confetti from 'canvas-confetti';
import { loadLeaderboard, saveLeaderboard } from '@/lib/storage';
import type { Address, LeaderboardEntry, FlipResult, CoinSide } from '@/types';
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


declare global {
  interface Window {
    ethereum?: any; 
  }
}

export const useCoinflip = () => {
  // === Core Web3 State ===
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
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
  const [choice, setChoice] = useState<boolean>(true); 
  const [coinSide, setCoinSide] = useState<CoinSide>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
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
      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send('eth_requestAccounts', []);
      const network = await prov.getNetwork();

      if (network.chainId !== 207n) {
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

      const signer = await prov.getSigner();
      const address = await signer.getAddress() as Address;
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tokenContract = new ethers.Contract(VIN_TOKEN_ADDRESS, VIN_ABI, signer);

      setProvider(prov);
      setSigner(signer);
      setContract(gameContract);
      setVinToken(tokenContract);
      setAccount(address);

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
  const updateBalances = async (addr: Address, game: ethers.Contract, token: ethers.Contract) => {
    try {
      const [vin, win, cont] = await Promise.all([
        token.balanceOf(addr),
        game.playerBalances(addr),
        token.balanceOf(CONTRACT_ADDRESS),
      ]);
      setVinBalance(ethers.formatEther(vin));
      setWinnings(ethers.formatEther(win));
      setContractBalance(ethers.formatEther(cont));
    } catch (e) {
      console.error('Balance update failed', e);
    }
  };

  const checkAllowance = async (addr: Address, token: ethers.Contract) => {
    try {
      const allowance = await token.allowance(addr, CONTRACT_ADDRESS);
      const needed = ethers.parseEther(betAmount || '0');
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
      const amount = ethers.parseEther('1000000'); // large approval
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

    const amount = ethers.parseEther(betAmount);
    setIsFlipping(true);
    clearError();
    playSound('flip');

    try {
      const tx = await contract.flip(choice, amount);
      await tx.wait();
      setTimeout(() => setIsFlipping(false), 1500);
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
      bet: bigint,
      payout: bigint
    ) => {
      if (player.toLowerCase() !== account.toLowerCase()) return;

      const result: FlipResult = {
        player: player as Address,
        choice,
        result: heads,
        won,
        bet: ethers.formatEther(bet),
        payout: ethers.formatEther(payout),
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

  return {
    account,
    connectWallet,
    disconnectWallet,
    vinBalance,
    winnings,
    contractBalance,
    betAmount,
    setBetAmount,
    choice,
    setChoice: (heads: boolean) => setChoice(heads),
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
  };
};