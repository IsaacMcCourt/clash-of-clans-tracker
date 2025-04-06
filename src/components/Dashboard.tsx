import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Account, Builder, Laboratory } from '../types';
import { deleteAccount, updateAccount } from '../utils/storageUtils';
import { formatRemainingTime, calculateEndTime } from '../utils/timeUtils';

interface DashboardProps {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

type TimerType = 'mainBuilder' | 'mainLab' | 'builderBaseBuilder' | 'builderBaseLab';

interface TimerFormData {
  days: number;
  hours: number;
  minutes: number;
}

const Dashboard = ({ accounts, setAccounts }: DashboardProps) => {
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
  const [selectedTimerType, setSelectedTimerType] = useState<TimerType>('mainBuilder');
  const [timerFormData, setTimerFormData] = useState<TimerFormData>({
    days: 0,
    hours: 0,
    minutes: 0
  });

  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      const updatedAccounts = deleteAccount(id);
      setAccounts(updatedAccounts);
    }
  };

  // Count active builders, calculate next completion time, and count completed upgrades
  const getAccountSummary = (account: Account) => {
    const now = new Date();
    const allBuilders = [
      ...account.mainVillageBuilders,
      ...account.builderBaseBuilders
    ];
    
    const activeBuilders = allBuilders.filter(builder => builder.inUse).length;
    const activeLabsCount = (account.mainVillageLab.inUse ? 1 : 0) + 
                          (account.builderBaseLab.inUse ? 1 : 0);
    
    // Count completed upgrades (end time in the past but still marked as in-use)
    let completedUpgrades = 0;
    
    // Check main village builders
    account.mainVillageBuilders.forEach(builder => {
      if (builder.inUse && builder.endTime && new Date(builder.endTime) <= now) {
        completedUpgrades++;
      }
    });
    
    // Check builder base builders
    account.builderBaseBuilders.forEach(builder => {
      if (builder.inUse && builder.endTime && new Date(builder.endTime) <= now) {
        completedUpgrades++;
      }
    });
    
    // Check main village lab
    if (account.mainVillageLab.inUse && 
        account.mainVillageLab.endTime && 
        new Date(account.mainVillageLab.endTime) <= now) {
      completedUpgrades++;
    }
    
    // Check builder base lab
    if (account.builderBaseLab.inUse && 
        account.builderBaseLab.endTime && 
        new Date(account.builderBaseLab.endTime) <= now) {
      completedUpgrades++;
    }
    
    // Get all active end times that haven't completed yet
    const futureEndTimes = [
      ...allBuilders
        .filter(b => b.inUse && b.endTime && new Date(b.endTime) > now)
        .map(b => b.endTime),
      account.mainVillageLab.inUse && account.mainVillageLab.endTime && new Date(account.mainVillageLab.endTime) > now 
        ? account.mainVillageLab.endTime 
        : null,
      account.builderBaseLab.inUse && account.builderBaseLab.endTime && new Date(account.builderBaseLab.endTime) > now 
        ? account.builderBaseLab.endTime 
        : null
    ].filter(Boolean) as string[];
    
    // Find the nearest completion time
    const nearestEndTime = futureEndTimes.length > 0 
      ? new Date(Math.min(...futureEndTimes.map(time => new Date(time).getTime()))).toISOString()
      : null;
    
    return {
      activeBuilders,
      activeLabsCount,
      nextCompletion: formatRemainingTime(nearestEndTime),
      completedUpgrades
    };
  };

  // Check availability of different builder/lab types in an account
  const getAvailability = (account: Account) => {
    return {
      mainBuilder: account.mainVillageBuilders.some(builder => !builder.inUse),
      mainLab: !account.mainVillageLab.inUse,
      builderBaseBuilder: account.builderBaseBuilders.some(builder => !builder.inUse),
      builderBaseLab: !account.builderBaseLab.inUse
    };
  };

  const toggleExpandAccount = (accountId: string) => {
    if (expandedAccountId === accountId) {
      setExpandedAccountId(null);
    } else {
      setExpandedAccountId(accountId);
      // Reset form when selecting a new account
      setTimerFormData({ days: 0, hours: 0, minutes: 0 });
      setSelectedTimerType('mainBuilder');
    }
  };

  const handleAddTimer = (account: Account) => {
    if (timerFormData.days === 0 && timerFormData.hours === 0 && timerFormData.minutes === 0) {
      alert('Please set a valid duration for the timer');
      return;
    }

    const endTime = calculateEndTime(
      timerFormData.days,
      timerFormData.hours,
      timerFormData.minutes
    );

    let updatedAccount = { ...account };

    switch (selectedTimerType) {
      case 'mainBuilder': {
        // Find the first available main village builder
        const availableBuilderIndex = updatedAccount.mainVillageBuilders.findIndex(
          builder => !builder.inUse
        );

        if (availableBuilderIndex !== -1) {
          updatedAccount.mainVillageBuilders = [...updatedAccount.mainVillageBuilders];
          updatedAccount.mainVillageBuilders[availableBuilderIndex] = {
            ...updatedAccount.mainVillageBuilders[availableBuilderIndex],
            inUse: true,
            endTime
          };
        } else {
          alert('No available main village builders');
          return;
        }
        break;
      }

      case 'mainLab': {
        if (!updatedAccount.mainVillageLab.inUse) {
          updatedAccount.mainVillageLab = {
            ...updatedAccount.mainVillageLab,
            inUse: true,
            endTime
          };
        } else {
          alert('Main village lab is already in use');
          return;
        }
        break;
      }

      case 'builderBaseBuilder': {
        // Find the first available builder base builder
        const availableBuilderIndex = updatedAccount.builderBaseBuilders.findIndex(
          builder => !builder.inUse
        );

        if (availableBuilderIndex !== -1) {
          updatedAccount.builderBaseBuilders = [...updatedAccount.builderBaseBuilders];
          updatedAccount.builderBaseBuilders[availableBuilderIndex] = {
            ...updatedAccount.builderBaseBuilders[availableBuilderIndex],
            inUse: true,
            endTime
          };
        } else {
          alert('No available builder base builders');
          return;
        }
        break;
      }

      case 'builderBaseLab': {
        if (!updatedAccount.builderBaseLab.inUse) {
          updatedAccount.builderBaseLab = {
            ...updatedAccount.builderBaseLab,
            inUse: true,
            endTime
          };
        } else {
          alert('Builder base lab is already in use');
          return;
        }
        break;
      }
    }

    // Update the account in storage
    const updatedAccounts = updateAccount(updatedAccount);
    setAccounts(updatedAccounts);

    // Reset form after adding timer
    setTimerFormData({ days: 0, hours: 0, minutes: 0 });
  };

  const handleClearCompletedUpgrades = (account: Account) => {
    const now = new Date();
    let updatedAccount = { ...account };
    let hasCompletedUpgrades = false;

    // Clear completed main village builders
    updatedAccount.mainVillageBuilders = updatedAccount.mainVillageBuilders.map(builder => {
      if (builder.inUse && builder.endTime && new Date(builder.endTime) <= now) {
        hasCompletedUpgrades = true;
        return { ...builder, inUse: false, endTime: null };
      }
      return builder;
    });

    // Clear completed builder base builders
    updatedAccount.builderBaseBuilders = updatedAccount.builderBaseBuilders.map(builder => {
      if (builder.inUse && builder.endTime && new Date(builder.endTime) <= now) {
        hasCompletedUpgrades = true;
        return { ...builder, inUse: false, endTime: null };
      }
      return builder;
    });

    // Clear completed main village lab
    if (updatedAccount.mainVillageLab.inUse && 
        updatedAccount.mainVillageLab.endTime && 
        new Date(updatedAccount.mainVillageLab.endTime) <= now) {
      hasCompletedUpgrades = true;
      updatedAccount.mainVillageLab = {
        ...updatedAccount.mainVillageLab,
        inUse: false,
        endTime: null
      };
    }

    // Clear completed builder base lab
    if (updatedAccount.builderBaseLab.inUse && 
        updatedAccount.builderBaseLab.endTime && 
        new Date(updatedAccount.builderBaseLab.endTime) <= now) {
      hasCompletedUpgrades = true;
      updatedAccount.builderBaseLab = {
        ...updatedAccount.builderBaseLab,
        inUse: false,
        endTime: null
      };
    }

    if (!hasCompletedUpgrades) {
      alert('No completed upgrades to clear for this account.');
      return;
    }

    // Update the account in storage
    const updatedAccounts = updateAccount(updatedAccount);
    setAccounts(updatedAccounts);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Your Accounts</h2>
        <Link to="/account/new" className="btn btn-primary">Add Account</Link>
      </div>

      {accounts.length === 0 ? (
        <div className="no-accounts">
          <p>You haven't added any accounts yet.</p>
          <Link to="/account/new" className="btn btn-primary">Add Your First Account</Link>
        </div>
      ) : (
        <div className="account-grid">
          {accounts.map(account => {
            const { activeBuilders, activeLabsCount, nextCompletion, completedUpgrades } = getAccountSummary(account);
            return (
              <div key={account.id} className="account-card">
                <h3>{account.name}</h3>
                <div className="account-stats">
                  <div className="stat">
                    <span className="stat-label">Active Builders:</span>
                    <span className="stat-value">{activeBuilders} / {account.mainVillageBuilders.length + account.builderBaseBuilders.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Active Labs:</span>
                    <span className="stat-value">{activeLabsCount} / 2</span>
                  </div>
                  {completedUpgrades > 0 ? (
                    <div className="stat completed-upgrades">
                      <span className="stat-label">Completed:</span>
                      <span className="stat-value">{completedUpgrades}</span>
                    </div>
                  ) : (
                    <div className="stat">
                      <span className="stat-label">Next Completion:</span>
                      <span className="stat-value">{nextCompletion || 'None'}</span>
                    </div>
                  )}
                </div>
                
                <div className="account-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => toggleExpandAccount(account.id)}
                  >
                    {expandedAccountId === account.id ? 'Close' : 'Add Timer'}
                  </button>
                  <Link to={`/account/${account.id}`} className="btn btn-secondary">View Details</Link>
                  <button 
                    onClick={() => handleDeleteAccount(account.id)} 
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="account-secondary-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleClearCompletedUpgrades(account)}
                    title="Clear all completed upgrades"
                  >
                    Clear Completed
                  </button>
                </div>

                {expandedAccountId === account.id && (
                  <div className="quick-timer-form">
                    <div className="timer-type-selection">
                      <label htmlFor={`timer-type-${account.id}`}>Timer Type:</label>
                      {(() => {
                        // Get availability for this account
                        const availability = getAvailability(account);
                        
                        // Find first available option to use as default when current option is unavailable
                        const findFirstAvailable = () => {
                          const types: TimerType[] = ['mainBuilder', 'mainLab', 'builderBaseBuilder', 'builderBaseLab'];
                          return types.find(type => availability[type]) || 'mainBuilder';
                        };
                        
                        // If current selection is unavailable, switch to an available option
                        if (!availability[selectedTimerType] && expandedAccountId === account.id) {
                          const firstAvailable = findFirstAvailable();
                          setSelectedTimerType(firstAvailable);
                        }
                        
                        return (
                          <select 
                            id={`timer-type-${account.id}`}
                            value={selectedTimerType}
                            onChange={(e) => setSelectedTimerType(e.target.value as TimerType)}
                          >
                            <option 
                              value="mainBuilder"
                              disabled={!availability.mainBuilder}
                              className={!availability.mainBuilder ? 'disabled-option' : ''}
                            >
                              Main Village Builder {!availability.mainBuilder ? '(None Available)' : ''}
                            </option>
                            <option 
                              value="mainLab"
                              disabled={!availability.mainLab}
                              className={!availability.mainLab ? 'disabled-option' : ''}
                            >
                              Main Village Lab {!availability.mainLab ? '(In Use)' : ''}
                            </option>
                            <option 
                              value="builderBaseBuilder"
                              disabled={!availability.builderBaseBuilder}
                              className={!availability.builderBaseBuilder ? 'disabled-option' : ''}
                            >
                              Builder Base Builder {!availability.builderBaseBuilder ? '(None Available)' : ''}
                            </option>
                            <option 
                              value="builderBaseLab"
                              disabled={!availability.builderBaseLab}
                              className={!availability.builderBaseLab ? 'disabled-option' : ''}
                            >
                              Builder Base Lab {!availability.builderBaseLab ? '(In Use)' : ''}
                            </option>
                          </select>
                        );
                      })()}
                    </div>

                    <div className="timer-duration">
                      <div className="time-inputs">
                        <div className="form-group">
                          <label>Days</label>
                          <input
                            type="number"
                            min="0"
                            value={timerFormData.days}
                            onChange={(e) => setTimerFormData({
                              ...timerFormData,
                              days: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Hours</label>
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={timerFormData.hours}
                            onChange={(e) => setTimerFormData({
                              ...timerFormData,
                              hours: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Minutes</label>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={timerFormData.minutes}
                            onChange={(e) => setTimerFormData({
                              ...timerFormData,
                              minutes: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleAddTimer(account)}
                      >
                        Start Timer
                      </button>
                    </div>

                    <div className="timer-status">
                      {selectedTimerType === 'mainBuilder' && (
                        <div>
                          <p>Main Village Builders: {account.mainVillageBuilders.filter(b => !b.inUse).length} available</p>
                        </div>
                      )}
                      {selectedTimerType === 'mainLab' && (
                        <div>
                          <p>Main Village Lab: {account.mainVillageLab.inUse ? 'In use' : 'Available'}</p>
                        </div>
                      )}
                      {selectedTimerType === 'builderBaseBuilder' && (
                        <div>
                          <p>Builder Base Builders: {account.builderBaseBuilders.filter(b => !b.inUse).length} available</p>
                        </div>
                      )}
                      {selectedTimerType === 'builderBaseLab' && (
                        <div>
                          <p>Builder Base Lab: {account.builderBaseLab.inUse ? 'In use' : 'Available'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;