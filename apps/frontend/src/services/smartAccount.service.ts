/**
 * Smart Account Service
 * 
 * Frontend service for ERC-4337 Smart Account operations:
 * - Create Smart Account
 * - Check account status
 * - Get operations history
 * - Get daily limit
 */

import { BrowserProvider, Contract, ethers } from 'ethers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://aicetro.com';
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_SMART_ACCOUNT_FACTORY_ADDRESS || '0xf2200e301d66a3E77C370A813bea612d064EB64D';

const FACTORY_ABI = [
  'function createAccount(address owner, uint256 salt) returns (address)',
  'function getAddress(address owner, uint256 salt) view returns (address)'
];

export class SmartAccountService {
  
  /**
   * Get predicted Smart Account address for a user
   */
  async getPredictedAddress(ownerAddress: string): Promise<string> {
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');
      
      const provider = new BrowserProvider(window.ethereum);
      const factory = new Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
      
      // Generate deterministic salt
      const salt = ethers.keccak256(ethers.toUtf8Bytes(ownerAddress));
      // Use getFunction() to avoid conflict with Contract.getAddress()
      const predicted = await factory.getFunction('getAddress')(ownerAddress, BigInt(salt));
      
      return predicted;
    } catch (error) {
      console.error('[SmartAccount] Failed to get predicted address:', error);
      throw error;
    }
  }
  
  /**
   * Check if Smart Account exists
   */
  async checkAccountExists(address: string): Promise<boolean> {
    try {
      if (!window.ethereum) return false;
      
      const provider = new BrowserProvider(window.ethereum);
      const code = await provider.getCode(address);
      
      return !!(code && code !== '0x');
    } catch (error) {
      console.error('[SmartAccount] Failed to check account:', error);
      return false;
    }
  }
  
  /**
   * Create Smart Account via backend
   */
  async createSmartAccount(ownerAddress: string): Promise<{
    success: boolean;
    smartAccount: string;
    txHash?: string;
    alreadyExists?: boolean;
  }> {
    try {
      const response = await fetch(`${API_BASE}/api/smart-account/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerAddress })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[SmartAccount] Failed to create account:', error);
      throw error;
    }
  }
  
  /**
   * Get Smart Account info
   */
  async getAccountInfo(address: string) {
    try {
      const response = await fetch(`${API_BASE}/api/smart-account/${address}/info`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[SmartAccount] Failed to get info:', error);
      throw error;
    }
  }
  
  /**
   * Get operations history
   */
  async getOperations(address: string, limit: number = 50) {
    try {
      const response = await fetch(`${API_BASE}/api/smart-account/${address}/operations?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[SmartAccount] Failed to get operations:', error);
      return { operations: [], count: 0 };
    }
  }
  
  /**
   * Get daily limit status
   */
  async getDailyLimitStatus(address: string) {
    try {
      const response = await fetch(`${API_BASE}/api/smart-account/${address}/daily-limit`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[SmartAccount] Failed to get daily limit:', error);
      return {
        spentToday: 0,
        limit: 1000,
        remaining: 1000,
        percentUsed: 0
      };
    }
  }
}

export const smartAccountService = new SmartAccountService();
