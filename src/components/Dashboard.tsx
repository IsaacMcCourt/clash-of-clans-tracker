import { Link } from 'react-router-dom';
import { Account } from '../types';
import { deleteAccount } from '../utils/storageUtils';
import { formatRemainingTime } from '../utils/timeUtils';

interface DashboardProps {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

const Dashboard = ({ accounts, setAccounts }: DashboardProps) => {
  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      const updatedAccounts = deleteAccount(id);
      setAccounts(updatedAccounts);
    }
  };

  // Count active builders and calculate next completion time
  const getAccountSummary = (account: Account) => {
    const allBuilders = [
      ...account.mainVillageBuilders,
      ...account.builderBaseBuilders
    ];
    
    const activeBuilders = allBuilders.filter(builder => builder.inUse).length;
    const activeLabsCount = (account.mainVillageLab.inUse ? 1 : 0) + 
                          (account.builderBaseLab.inUse ? 1 : 0);
    
    // Get all active end times
    const endTimes = [
      ...allBuilders.filter(b => b.inUse && b.endTime).map(b => b.endTime),
      account.mainVillageLab.inUse && account.mainVillageLab.endTime ? account.mainVillageLab.endTime : null,
      account.builderBaseLab.inUse && account.builderBaseLab.endTime ? account.builderBaseLab.endTime : null
    ].filter(Boolean) as string[];
    
    // Find the nearest completion time
    const nearestEndTime = endTimes.length > 0 
      ? new Date(Math.min(...endTimes.map(time => new Date(time).getTime()))).toISOString()
      : null;
    
    return {
      activeBuilders,
      activeLabsCount,
      nextCompletion: formatRemainingTime(nearestEndTime)
    };
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
            const { activeBuilders, activeLabsCount, nextCompletion } = getAccountSummary(account);
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
                  <div className="stat">
                    <span className="stat-label">Next Completion:</span>
                    <span className="stat-value">{nextCompletion || 'None'}</span>
                  </div>
                </div>
                <div className="account-actions">
                  <Link to={`/account/${account.id}`} className="btn btn-secondary">View Details</Link>
                  <button 
                    onClick={() => handleDeleteAccount(account.id)} 
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;