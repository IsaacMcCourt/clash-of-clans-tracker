import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addAccount } from '../utils/storageUtils';
import { Account } from '../types';

interface AccountFormProps {
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

const AccountForm = ({ setAccounts }: AccountFormProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Account name is required');
      return;
    }
    
    const updatedAccounts = addAccount(name.trim());
    setAccounts(updatedAccounts);
    navigate('/');
  };

  return (
    <div className="account-form-container">
      <h2>Add New Account</h2>
      <form onSubmit={handleSubmit} className="account-form">
        <div className="form-group">
          <label htmlFor="name">Account Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a name for this account"
            className={error ? 'error' : ''}
          />
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;