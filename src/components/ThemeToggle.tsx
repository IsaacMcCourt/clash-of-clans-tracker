import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="theme-toggle-container">
      <div className="theme-toggle-label">
        <span>{darkMode ? 'Dark' : 'Light'}</span>
      </div>
      <label className="theme-switch">
        <input 
          type="checkbox"
          checked={darkMode}
          onChange={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        />
        <span className="slider"></span>
      </label>
    </div>
  );
};

export default ThemeToggle;