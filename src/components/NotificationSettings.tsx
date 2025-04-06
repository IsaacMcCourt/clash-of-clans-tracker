import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationSettings = () => {
  const { preferences, updatePreferences } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleEnable = () => {
    updatePreferences({ enabled: !preferences.enabled });
  };

  const handleToggleSound = () => {
    updatePreferences({ soundEnabled: !preferences.soundEnabled });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updatePreferences({ notifyBefore: Number(e.target.value) as 1 | 5 | 15 | 30 | 60 });
  };

  // Check if notifications are supported
  const notificationsSupported = 'Notification' in window;
  
  // Function to request permission
  const requestPermission = async () => {
    if (notificationsSupported) {
      const permission = await Notification.requestPermission();
      // If permission changes, we should trigger a rerender
      if (permission === 'granted' && !preferences.enabled) {
        updatePreferences({ enabled: true });
      }
    }
  };

  return (
    <div className="notification-settings-container">
      <button 
        className="notification-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Notification Settings"
      >
        <span className="notification-icon">
          {preferences.enabled ? '🔔' : '🔕'}
        </span>
      </button>

      {isOpen && (
        <div className="notification-settings-panel">
          <div className="notification-settings-header">
            <h3>Notification Settings</h3>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {!notificationsSupported ? (
            <div className="notification-error">
              <p>Notifications are not supported in your browser.</p>
            </div>
          ) : Notification.permission === 'denied' ? (
            <div className="notification-error">
              <p>Notification permission has been blocked. Please enable notifications in your browser settings.</p>
            </div>
          ) : Notification.permission !== 'granted' ? (
            <div className="notification-permission">
              <p>Please allow notifications to receive alerts when your upgrades are about to complete.</p>
              <button 
                className="btn btn-primary"
                onClick={requestPermission}
              >
                Allow Notifications
              </button>
            </div>
          ) : (
            <div className="notification-settings-content">
              <div className="form-group">
                <label className="switch-label">
                  <span>Enable Notifications</span>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={preferences.enabled}
                      onChange={handleToggleEnable}
                    />
                    <span className="switch-slider"></span>
                  </div>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="notifyTime">Notify me before completion:</label>
                <select 
                  id="notifyTime" 
                  value={preferences.notifyBefore}
                  onChange={handleTimeChange}
                  disabled={!preferences.enabled}
                >
                  <option value="1">1 minute</option>
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>

              <div className="form-group">
                <label className="switch-label">
                  <span>Enable Sound</span>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={preferences.soundEnabled}
                      onChange={handleToggleSound}
                      disabled={!preferences.enabled}
                    />
                    <span className="switch-slider"></span>
                  </div>
                </label>
              </div>

              <div className="notification-info">
                <p>You will receive notifications when your upgrades are about to complete.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;