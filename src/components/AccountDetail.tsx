import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Account, Builder, Laboratory } from '../types';
import { updateAccount } from '../utils/storageUtils';
import { formatRemainingTime, calculateEndTime } from '../utils/timeUtils';

interface AccountDetailProps {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

interface TimerFormData {
  days: number;
  hours: number;
  minutes: number;
}

const AccountDetail = ({ accounts, setAccounts }: AccountDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [showTimerForm, setShowTimerForm] = useState(false);
  const [timerFormData, setTimerFormData] = useState<TimerFormData>({
    days: 0,
    hours: 0,
    minutes: 0
  });

  // Update the display every minute to keep times current
  useEffect(() => {
    const interval = setInterval(() => {
      if (account) {
        setAccount({ ...account });
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [account]);

  // Find the account by ID when component mounts or accounts change
  useEffect(() => {
    if (id) {
      const foundAccount = accounts.find(acc => acc.id === id);
      if (foundAccount) {
        setAccount(foundAccount);
      } else {
        navigate('/');
      }
    }
  }, [id, accounts, navigate]);

  // If account is not found, show loading
  if (!account) {
    return <div className="loading">Loading account...</div>;
  }

  const handleBuilderClick = (builder: Builder) => {
    setSelectedBuilder(builder);
    setSelectedLab(null);
    
    if (builder.inUse && builder.endTime) {
      setShowTimerForm(false);
    } else {
      setShowTimerForm(true);
      setTimerFormData({ days: 0, hours: 0, minutes: 0 });
    }
  };

  const handleLabClick = (lab: Laboratory) => {
    setSelectedLab(lab);
    setSelectedBuilder(null);
    
    if (lab.inUse && lab.endTime) {
      setShowTimerForm(false);
    } else {
      setShowTimerForm(true);
      setTimerFormData({ days: 0, hours: 0, minutes: 0 });
    }
  };

  const handleSetTimer = () => {
    if (!account) return;
    
    const { days, hours, minutes } = timerFormData;
    if (days === 0 && hours === 0 && minutes === 0) return;
    
    const endTime = calculateEndTime(days, hours, minutes);
    let updatedAccount = { ...account };
    
    if (selectedBuilder) {
      const updatedBuilders = selectedBuilder.name.includes('Builder Base')
        ? updatedAccount.builderBaseBuilders.map(b => 
            b.id === selectedBuilder.id ? { ...b, endTime, inUse: true } : b
          )
        : updatedAccount.mainVillageBuilders.map(b => 
            b.id === selectedBuilder.id ? { ...b, endTime, inUse: true } : b
          );
      
      if (selectedBuilder.name.includes('Builder Base')) {
        updatedAccount = { ...updatedAccount, builderBaseBuilders: updatedBuilders };
      } else {
        updatedAccount = { ...updatedAccount, mainVillageBuilders: updatedBuilders };
      }
    }
    
    if (selectedLab) {
      if (selectedLab.id === account.mainVillageLab.id) {
        updatedAccount = { 
          ...updatedAccount, 
          mainVillageLab: { ...selectedLab, endTime, inUse: true } 
        };
      } else {
        updatedAccount = { 
          ...updatedAccount, 
          builderBaseLab: { ...selectedLab, endTime, inUse: true } 
        };
      }
    }
    
    const updatedAccounts = updateAccount(updatedAccount);
    setAccounts(updatedAccounts);
    setAccount(updatedAccount);
    setShowTimerForm(false);
  };

  const handleCancelTimer = () => {
    if (!account) return;
    
    let updatedAccount = { ...account };
    
    if (selectedBuilder) {
      const updatedBuilders = selectedBuilder.name.includes('Builder Base')
        ? updatedAccount.builderBaseBuilders.map(b => 
            b.id === selectedBuilder.id ? { ...b, endTime: null, inUse: false } : b
          )
        : updatedAccount.mainVillageBuilders.map(b => 
            b.id === selectedBuilder.id ? { ...b, endTime: null, inUse: false } : b
          );
      
      if (selectedBuilder.name.includes('Builder Base')) {
        updatedAccount = { ...updatedAccount, builderBaseBuilders: updatedBuilders };
      } else {
        updatedAccount = { ...updatedAccount, mainVillageBuilders: updatedBuilders };
      }
    }
    
    if (selectedLab) {
      if (selectedLab.id === account.mainVillageLab.id) {
        updatedAccount = { 
          ...updatedAccount, 
          mainVillageLab: { ...selectedLab, endTime: null, inUse: false } 
        };
      } else {
        updatedAccount = { 
          ...updatedAccount, 
          builderBaseLab: { ...selectedLab, endTime: null, inUse: false } 
        };
      }
    }
    
    const updatedAccounts = updateAccount(updatedAccount);
    setAccounts(updatedAccounts);
    setAccount(updatedAccount);
    setSelectedBuilder(null);
    setSelectedLab(null);
  };

  return (
    <div className="account-detail">
      <div className="account-header">
        <h2>{account.name}</h2>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>

      <div className="account-sections">
        <section className="village-section">
          <h3>Main Village</h3>
          
          <div className="builders-container">
            <h4>Builders</h4>
            <div className="builders-grid">
              {account.mainVillageBuilders.map(builder => (
                <div 
                  key={builder.id} 
                  className={`builder-card ${builder.inUse ? 'active' : ''} ${selectedBuilder?.id === builder.id ? 'selected' : ''}`}
                  onClick={() => handleBuilderClick(builder)}
                >
                  <h5>{builder.name}</h5>
                  <div className="status">
                    {builder.inUse ? (
                      <>
                        <span className="status-label">Time left:</span>
                        <span className="status-value">{formatRemainingTime(builder.endTime)}</span>
                      </>
                    ) : (
                      <span className="status-value">Available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lab-container">
            <h4>Laboratory</h4>
            <div 
              className={`lab-card ${account.mainVillageLab.inUse ? 'active' : ''} ${selectedLab?.id === account.mainVillageLab.id ? 'selected' : ''}`}
              onClick={() => handleLabClick(account.mainVillageLab)}
            >
              <h5>Main Village Lab</h5>
              <div className="status">
                {account.mainVillageLab.inUse ? (
                  <>
                    <span className="status-label">Time left:</span>
                    <span className="status-value">{formatRemainingTime(account.mainVillageLab.endTime)}</span>
                  </>
                ) : (
                  <span className="status-value">Available</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="village-section">
          <h3>Builder Base</h3>
          
          <div className="builders-container">
            <h4>Builders</h4>
            <div className="builders-grid">
              {account.builderBaseBuilders.map(builder => (
                <div 
                  key={builder.id} 
                  className={`builder-card ${builder.inUse ? 'active' : ''} ${selectedBuilder?.id === builder.id ? 'selected' : ''}`}
                  onClick={() => handleBuilderClick(builder)}
                >
                  <h5>{builder.name}</h5>
                  <div className="status">
                    {builder.inUse ? (
                      <>
                        <span className="status-label">Time left:</span>
                        <span className="status-value">{formatRemainingTime(builder.endTime)}</span>
                      </>
                    ) : (
                      <span className="status-value">Available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lab-container">
            <h4>Laboratory</h4>
            <div 
              className={`lab-card ${account.builderBaseLab.inUse ? 'active' : ''} ${selectedLab?.id === account.builderBaseLab.id ? 'selected' : ''}`}
              onClick={() => handleLabClick(account.builderBaseLab)}
            >
              <h5>Builder Base Lab</h5>
              <div className="status">
                {account.builderBaseLab.inUse ? (
                  <>
                    <span className="status-label">Time left:</span>
                    <span className="status-value">{formatRemainingTime(account.builderBaseLab.endTime)}</span>
                  </>
                ) : (
                  <span className="status-value">Available</span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {(selectedBuilder || selectedLab) && (
        <div className="selected-item-actions">
          <h4>
            Selected: {selectedBuilder?.name || (selectedLab?.id === account.mainVillageLab.id ? 'Main Village Lab' : 'Builder Base Lab')}
          </h4>
          
          {((selectedBuilder && selectedBuilder.inUse) || (selectedLab && selectedLab.inUse)) ? (
            <button onClick={handleCancelTimer} className="btn btn-danger">
              Cancel Timer
            </button>
          ) : (
            showTimerForm ? (
              <div className="timer-form">
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
                <div className="form-actions">
                  <button 
                    onClick={() => {
                      setSelectedBuilder(null);
                      setSelectedLab(null);
                      setShowTimerForm(false);
                    }} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button onClick={handleSetTimer} className="btn btn-primary">
                    Start Timer
                  </button>
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default AccountDetail;