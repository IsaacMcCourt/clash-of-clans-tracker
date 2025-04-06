import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Account } from './types';
import { getAccounts } from './utils/storageUtils';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './App.css';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AccountDetail from './components/AccountDetail';
import AccountForm from './components/AccountForm';
import ThemeToggle from './components/ThemeToggle';
import NotificationSettings from './components/NotificationSettings';

function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  useEffect(() => {
    // Load accounts from local storage on component mount
    const savedAccounts = getAccounts();
    setAccounts(savedAccounts);
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <div className="app-container">
            <Header />
            <main className="content">
              <Routes>
                <Route path="/" element={<Dashboard accounts={accounts} setAccounts={setAccounts} />} />
                <Route path="/account/new" element={<AccountForm setAccounts={setAccounts} />} />
                <Route path="/account/:id" element={<AccountDetail accounts={accounts} setAccounts={setAccounts} />} />
              </Routes>
            </main>
            <footer className="footer">
              <p>Clash of Clans Upgrade Tracker © {new Date().getFullYear()}</p>
              <p className="disclaimer">This material is unofficial and is not endorsed by Supercell. For more information see Supercell's Fan Content Policy: <a href="https://www.supercell.com/fan-content-policy" target="_blank" rel="noopener noreferrer">www.supercell.com/fan-content-policy</a>.</p>
            </footer>
            <div className="floating-controls">
              <ThemeToggle />
              <NotificationSettings />
            </div>
          </div>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
