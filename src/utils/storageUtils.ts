import { v4 as uuidv4 } from 'uuid';
import { Account, Builder, Laboratory } from '../types';

const STORAGE_KEY = 'clash_of_clans_accounts';

/**
 * Get all accounts from local storage
 */
export const getAccounts = (): Account[] => {
  try {
    const storedAccounts = localStorage.getItem(STORAGE_KEY);
    return storedAccounts ? JSON.parse(storedAccounts) : [];
  } catch (error) {
    console.error('Error retrieving accounts:', error);
    return [];
  }
};

/**
 * Save accounts to local storage
 */
export const saveAccounts = (accounts: Account[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('Error saving accounts:', error);
  }
};

/**
 * Create a new account with default builders and labs
 */
export const createNewAccount = (name: string): Account => {
  // Create 6 main village builders
  const mainVillageBuilders: Builder[] = Array.from({ length: 6 }, (_, index) => ({
    id: uuidv4(),
    name: `Builder ${index + 1}`,
    endTime: null,
    inUse: false
  }));

  // Create 2 builder base builders
  const builderBaseBuilders: Builder[] = Array.from({ length: 2 }, (_, index) => ({
    id: uuidv4(),
    name: `Builder Base Builder ${index + 1}`,
    endTime: null,
    inUse: false
  }));

  // Create labs
  const mainVillageLab: Laboratory = {
    id: uuidv4(),
    endTime: null,
    inUse: false
  };

  const builderBaseLab: Laboratory = {
    id: uuidv4(),
    endTime: null,
    inUse: false
  };

  // Create and return the new account
  return {
    id: uuidv4(),
    name,
    mainVillageBuilders,
    mainVillageLab,
    builderBaseBuilders,
    builderBaseLab
  };
};

/**
 * Add a new account to storage
 */
export const addAccount = (name: string): Account[] => {
  const accounts = getAccounts();
  const newAccount = createNewAccount(name);
  const updatedAccounts = [...accounts, newAccount];
  saveAccounts(updatedAccounts);
  return updatedAccounts;
};

/**
 * Update an existing account in storage
 */
export const updateAccount = (updatedAccount: Account): Account[] => {
  const accounts = getAccounts();
  const updatedAccounts = accounts.map(account => 
    account.id === updatedAccount.id ? updatedAccount : account
  );
  saveAccounts(updatedAccounts);
  return updatedAccounts;
};

/**
 * Delete an account from storage
 */
export const deleteAccount = (accountId: string): Account[] => {
  const accounts = getAccounts();
  const updatedAccounts = accounts.filter(account => account.id !== accountId);
  saveAccounts(updatedAccounts);
  return updatedAccounts;
};