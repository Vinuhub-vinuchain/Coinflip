import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Web3State, FlipResult, LeaderboardEntry } from "../types";
import contractAddresses from "../../contract-addresses.json";

const VINUCHAIN_CONFIG = {
  chainId: "0xCF",
  chainName: "VinuChain",
  rpcUrls: ["https://rpc.vinuchain.org", "https://vinuchain-rpc.com"],
  nativeCurrency: { name: "VinuChain", symbol: "VC", decimals: 18 },
  blockExplorerUrls: ["https://vinuexplorer.org"],
};

const CONTRACT_ABI = [
  "function flip(bool _heads, uint256 _amount) external",
  "function withdraw() external",
  "function playerBalances(address) view returns (uint256)",
  "event FlipResult(address indexed player, bool heads, bool won, uint256 bet, uint256 payout)",
  "event Withdrawal(address indexed player, uint256 amount)",
];

const VIN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export const useWeb3 = () => {
  const [state, setState] = useState<Web3State>({
    provider: null,
    signer: null,
    contract: null,
    vinToken: null,
    account: null,
    vinBalance: "0",
    playerBalance: "0",
    contractBalance: "0",
    isApproved: false,
    connecting: false,
    flipping: false,
    approving: false,
    coinSide: "heads",
    choice: true,
    betAmount: "0.1",
    history: [],
    leaderboard: JSON.parse(localStorage.getItem("leaderboard") || "[]"),
    lastWin: null,
    error: null,
  });

  const setError = (error: string | null) => setState((prev) => ({ ...prev, error }));

  const connectWallet = useCallback(async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      setError("MetaMask not detected. Please install MetaMask.");
      return;
    }
    setState((prev) => ({ ...prev, connecting: true }));
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const network = await provider.getNetwork();
      if (network.chainId !== 207) {
        try {
          await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xCF" }] });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({ method: "wallet_addEthereumChain", params: [VINUCHAIN_CONFIG] });
          } else {
            throw new Error("Failed to switch to VinuChain");
          }
        }
      }
      await provider.getBlockNumber(); // Test RPC
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddresses.Coinflip, CONTRACT_ABI, signer);
      const vinToken = new ethers.Contract(contractAddresses.VinToken, VIN_ABI, signer);
      setState((prev) => ({
        ...prev,
        provider,
        signer,
        contract,
        vineyard,
        account: accounts[0],
        connecting: false,
      }));
      checkBalances(provider, contract, vinToken, accounts[0]);
      checkAllowance(vinToken, accounts[0], prev.betAmount);
    } catch (error: any) {
      setError(error.message || "Failed to connect wallet");
      setState((prev) => ({ ...prev, connecting: false }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setState((prev) => ({
      ...prev,
      provider: null,
      signer: null,
      contract: null,
      vinToken: null,
      account: null,
      isApproved: false,
      vinBalance: "0",
      playerBalance: "0",
      contractBalance: "0",
      history: [],
      lastWin: null,
      coinSide: "heads",
      error: null,
    }));
  }, []);

  const checkBalances = useCallback(async (provider: ethers.providers.Web3Provider, contract: ethers.Contract, vinToken: ethers.Contract, account: string) => {
    try {
      const vinBalance = ethers.utils.formatEther(await vinToken.balanceOf(account));
      const playerBalance = ethers.utils.formatEther(await contract.playerBalances(account));
      const contractBalance = ethers.utils.formatEther(await vinToken.balanceOf(contractAddresses.Coinflip));
      setState((prev) => ({ ...prev, vinBalance, playerBalance, contractBalance }));
    } catch (error: any) {
      setError("Failed to fetch balances: " + error.message);
    }
  }, []);

  const checkAllowance = useCallback(async (vinToken: ethers.Contract, account: string, betAmount: string) => {
    try {
      const allowance = await vinToken.allowance(account, contractAddresses.Coinflip);
      setState((prev) => ({ ...prev, isApproved: allowance.gte(ethers.utils.parseEther(betAmount || "0")) }));
    } catch (error: any) {
      setError("Failed to fetch allowance: " + error.message);
    }
  }, []);

  const approveVin = useCallback(async () => {
    if (!state.vinToken || !state.signer || !validateBet(state.betAmount)) return;
    setState((prev) => ({ ...prev, approving: true }));
    try {
      const amount = ethers.utils.parseEther(state.betAmount);
      const gasSettings = await getGasSettings(state.provider!);
      const tx = await state.vinToken.approve(contractAddresses.Coinflip, amount, gasSettings);
      await tx.wait();
      setState((prev) => ({ ...prev, isApproved: true, approving: false }));
      setError("VIN approved successfully!");
    } catch (error: any) {
      setError(error.code === -32603 || error.message.includes("insufficient funds") ? "Approval failed: Insufficient funds for gas." : "Approval failed: " + error.message);
      setState((prev) => ({ ...prev, approving: false }));
    }
  }, [state.vinToken, state.signer, state.betAmount, state.provider]);

  const flipCoin = useCallback(async () => {
    if (!state.contract || !state.signer || !validateBet(state.betAmount) || !state.isApproved) return;
    setState((prev) => ({ ...prev, flipping: true }));
    try {
      const gasSettings = await getGasSettings(state.provider!);
      const tx = await state.contract.flip(state.choice, ethers.utils.parseEther(state.betAmount), gasSettings);
      await tx.wait();
      setTimeout(() => setState((prev) => ({ ...prev, flipping: false })), 1000);
    } catch (error: any) {
      setError(error.code === -32603 || error.message.includes("insufficient funds") ? "Flip failed: Insufficient funds for gas." : "Flip failed: " + error.message);
      setState((prev) => ({ ...prev, flipping: false }));
    }
  }, [state.contract, state.signer, state.betAmount, state.isApproved, state.choice, state.provider]);

  const withdraw = useCallback(async () => {
    if (!state.contract || !state.signer) return;
    try {
      const gasSettings = await getGasSettings(state.provider!);
      const tx = await state.contract.withdraw(gasSettings);
      await tx.wait();
    } catch (error: any) {
      setError(error.code === -32603 || error.message.includes("insufficient funds") ? "Withdrawal failed: Insufficient funds for gas." : "Withdrawal failed: " + error.message);
    }
  }, [state.contract, state.signer, state.provider]);

  const validateBet = (amount: string): boolean => {
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0.1) {
      setError("Minimum bet: 0.1 VIN");
      return false;
    }
    if (num > 100000) {
      setError("Maximum bet: 100000 VIN");
      return false;
    }
    if (num > parseFloat(state.vinBalance)) {
      setError("Insufficient VIN balance");
      return false;
    }
    setError(null);
    return true;
  };

  const getGasSettings = async (provider: ethers.providers.Web3Provider) => {
    try {
      const feeData = await provider.getFeeData();
      return {
        gasLimit: 200000,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.utils.parseUnits("1", "gwei"),
        maxFeePerGas: feeData.maxFeePerGas || ethers.utils.parseUnits("2", "gwei"),
      };
    } catch {
      return { gasLimit: 200000, gasPrice: ethers.utils.parseUnits("1", "gwei") };
    }
  };

  useEffect(() => {
    if (state.contract && state.account) {
      state.contract.on("FlipResult", (player: string, heads: boolean, won: boolean, bet: ethers.BigNumber, payout: ethers.BigNumber) => {
        const result: FlipResult = { heads, won, bet: ethers.utils.formatEther(bet), payout: ethers.utils.formatEther(payout) };
        if (player.toLowerCase() === state.account?.toLowerCase()) {
          setState((prev) => ({
            ...prev,
            coinSide: heads ? "heads" : "tails",
            history: [...prev.history.slice(-4), result],
            lastWin: won ? { player, payout: ethers.utils.formatEther(payout), timestamp: Date.now() } : null,
            flipping: false,
          }));
          if (won) {
            setState((prev) => {
              const newLeaderboard = [...prev.leaderboard.filter((entry) => entry.player !== player).slice(-4), { player, payout: ethers.utils.formatEther(payout), timestamp: Date.now() }].slice(-5);
              localStorage.setItem("leaderboard", JSON.stringify(newLeaderboard));
              return { ...prev, leaderboard: newLeaderboard };
            });
            // Play win sound (implement audio logic)
            // confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#ffffff"] });
          } else {
            // Play loss sound
          }
          checkBalances(state.provider!, state.contract!, state.vinToken!, state.account!);
        } else if (won) {
          setState((prev) => {
            const newLeaderboard = [...prev.leaderboard.filter((entry) => entry.player !== player).slice(-4), { player, payout: ethers.utils.formatEther(payout), timestamp: Date.now() }].slice(-5);
            localStorage.setItem("leaderboard", JSON.stringify(newLeaderboard));
            return { ...prev, leaderboard: newLeaderboard };
          });
        }
      });
      state.contract.on("Withdrawal", (player: string, amount: ethers.BigNumber) => {
        if (player.toLowerCase() === state.account?.toLowerCase()) {
          setState((prev) => ({ ...prev, playerBalance: "0", lastWin: null }));
          checkBalances(state.provider!, state.contract!, state.vinToken!, state.account!);
        }
      });
    }
  }, [state.contract, state.account]);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    approveVin,
    flipCoin,
    withdraw,
    setBetAmount: (amount: string) => setState((prev) => ({ ...prev, betAmount: amount })),
    setChoice: (choice: boolean) => setState((prev) => ({ ...prev, choice })),
  };
};
