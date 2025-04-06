import { v4 as uuidv4 } from 'uuid';
import { Account, Builder, Laboratory, AccountConfig } from '../types';

const STORAGE_KEY = 'clash_of_clans_accounts';

// Default maximum values for each upgrader type
const DEFAULT_MAX_MAIN_VILLAGE_BUILDERS = 6;
const DEFAULT_MAX_BUILDER_BASE_BUILDERS = 2;

/**
 * Get all accounts from local storage
 */
export const getAccounts = (): Account[] => {
  try {
    const storedAccounts = localStorage.getItem(STORAGE_KEY);
    
    if (!storedAccounts) {
      return [];
    }
    
    const parsedAccounts = JSON.parse(storedAccounts);
    
    // Add default config to existing accounts that don't have it
    return parsedAccounts.map((account: any) => {
      if (!account.config) {
        // Create default config based on existing account data
        const defaultConfig: AccountConfig = {
          maxMainVillageBuilders: account.mainVillageBuilders.length || DEFAULT_MAX_MAIN_VILLAGE_BUILDERS,
          hasMainVillageLab: true,
          maxBuilderBaseBuilders: account.builderBaseBuilders.length || DEFAULT_MAX_BUILDER_BASE_BUILDERS,
          hasBuilderBaseLab: true
        };
        
        return {
          ...account,
          config: defaultConfig
        };
      }
      
      return account;
    });
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
  // Default account configuration
  const config: AccountConfig = {
    maxMainVillageBuilders: DEFAULT_MAX_MAIN_VILLAGE_BUILDERS,
    hasMainVillageLab: true,
    maxBuilderBaseBuilders: DEFAULT_MAX_BUILDER_BASE_BUILDERS,
    hasBuilderBaseLab: true
  };

  // Create main village builders
  const mainVillageBuilders: Builder[] = Array.from({ length: config.maxMainVillageBuilders }, (_, index) => ({
    id: uuidv4(),
    name: `Builder ${index + 1}`,
    endTime: null,
    inUse: false
  }));

  // Create builder base builders
  const builderBaseBuilders: Builder[] = Array.from({ length: config.maxBuilderBaseBuilders }, (_, index) => ({
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
    builderBaseLab,
    config
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

/**
 * Update the configuration for an account
 */
export const updateAccountConfig = (accountId: string, config: AccountConfig): Account[] => {
  const accounts = getAccounts();
  const accountIndex = accounts.findIndex(account => account.id === accountId);
  
  if (accountIndex === -1) return accounts;
  
  const account = accounts[accountIndex];
  const updatedAccount = { ...account, config };

  // Adjust main village builders based on new configuration
  if (updatedAccount.config.maxMainVillageBuilders !== account.mainVillageBuilders.length) {
    if (updatedAccount.config.maxMainVillageBuilders > account.mainVillageBuilders.length) {
      // Add more builders
      const additionalBuilders = Array.from(
        { length: updatedAccount.config.maxMainVillageBuilders - account.mainVillageBuilders.length }, 
        (_, index) => ({
          id: uuidv4(),
          name: `Builder ${account.mainVillageBuilders.length + index + 1}`,
          endTime: null,
          inUse: false
        })
      );
      updatedAccount.mainVillageBuilders = [...account.mainVillageBuilders, ...additionalBuilders];
    } else {
      // Remove excess builders (keep the ones that are in use)
      const activeBuilders = account.mainVillageBuilders.filter(builder => builder.inUse);
      const inactiveBuilders = account.mainVillageBuilders.filter(builder => !builder.inUse);
      
      if (activeBuilders.length <= updatedAccount.config.maxMainVillageBuilders) {
        // We can keep all active builders and some inactive ones
        const inactiveToKeep = inactiveBuilders.slice(
          0, 
          updatedAccount.config.maxMainVillageBuilders - activeBuilders.length
        );
        updatedAccount.mainVillageBuilders = [...activeBuilders, ...inactiveToKeep];
      } else {
        // Too many active builders, keep only some active ones
        updatedAccount.mainVillageBuilders = activeBuilders.slice(
          0, 
          updatedAccount.config.maxMainVillageBuilders
        );
      }
    }
  }

  // Adjust builder base builders similarly
  if (updatedAccount.config.maxBuilderBaseBuilders !== account.builderBaseBuilders.length) {
    if (updatedAccount.config.maxBuilderBaseBuilders > account.builderBaseBuilders.length) {
      // Add more builders
      const additionalBuilders = Array.from(
        { length: updatedAccount.config.maxBuilderBaseBuilders - account.builderBaseBuilders.length }, 
        (_, index) => ({
          id: uuidv4(),
          name: `Builder Base Builder ${account.builderBaseBuilders.length + index + 1}`,
          endTime: null,
          inUse: false
        })
      );
      updatedAccount.builderBaseBuilders = [...account.builderBaseBuilders, ...additionalBuilders];
    } else {
      // Remove excess builders (keep the ones that are in use)
      const activeBuilders = account.builderBaseBuilders.filter(builder => builder.inUse);
      const inactiveBuilders = account.builderBaseBuilders.filter(builder => !builder.inUse);
      
      if (activeBuilders.length <= updatedAccount.config.maxBuilderBaseBuilders) {
        // We can keep all active builders and some inactive ones
        const inactiveToKeep = inactiveBuilders.slice(
          0, 
          updatedAccount.config.maxBuilderBaseBuilders - activeBuilders.length
        );
        updatedAccount.builderBaseBuilders = [...activeBuilders, ...inactiveToKeep];
      } else {
        // Too many active builders, keep only some active ones
        updatedAccount.builderBaseBuilders = activeBuilders.slice(
          0, 
          updatedAccount.config.maxBuilderBaseBuilders
        );
      }
    }
  }

  // Reset main village lab if needed
  if (!updatedAccount.config.hasMainVillageLab && updatedAccount.mainVillageLab.inUse) {
    updatedAccount.mainVillageLab = {
      ...updatedAccount.mainVillageLab,
      inUse: false,
      endTime: null
    };
  }

  // Reset builder base lab if needed
  if (!updatedAccount.config.hasBuilderBaseLab && updatedAccount.builderBaseLab.inUse) {
    updatedAccount.builderBaseLab = {
      ...updatedAccount.builderBaseLab,
      inUse: false,
      endTime: null
    };
  }

  // Update the account in the array
  accounts[accountIndex] = updatedAccount;
  saveAccounts(accounts);
  
  return accounts;
};