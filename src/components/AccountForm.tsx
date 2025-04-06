import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addAccount } from '../utils/storageUtils';

interface AccountFormProps {
  setAccounts: React.Dispatch<React.SetStateAction<any[]>>;
}

const AccountForm = ({ setAccounts }: AccountFormProps) => {
  const navigate = useNavigate();
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!accountName.trim()) {
      setError('Account name is required');
      return;
    }
    
    // Add the account
    const updatedAccounts = addAccount(accountName.trim());
    setAccounts(updatedAccounts);
    
    // Navigate back to dashboard
    navigate('/');
  };

  return (
    <div className="account-form-container">
      <h2>Add New Account</h2>
      
      <form className="account-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="account-name">Account Name</label>
          <input
            id="account-name"
            type="text"
            value={accountName}
            onChange={(e) => {
              setAccountName(e.target.value);
              setError('');
            }}
            className={error ? 'error' : ''}
            placeholder="Enter account name"
          />
          {error && <div className="error-message">{error}</div>}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;