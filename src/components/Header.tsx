import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <h1>
          <Link to="/">Clash of Clans Upgrade Tracker</Link>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/account/new" className="btn btn-primary">Add Account</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;