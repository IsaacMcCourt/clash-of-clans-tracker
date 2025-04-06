import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Account } from '../types';

type NotificationTimeOption = 1 | 5 | 15 | 30 | 60; // in minutes

interface NotificationPreferences {
  enabled: boolean;
  notifyBefore: NotificationTimeOption; // minutes before completion
  soundEnabled: boolean;
}

type NotificationContextType = {
  preferences: NotificationPreferences;
  updatePreferences: (newPreferences: Partial<NotificationPreferences>) => void;
  checkAndTriggerNotifications: (accounts: Account[]) => void;
  // Track notifications that have been sent to avoid duplicates
  sentNotifications: Set<string>;
};

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  notifyBefore: 1, // Default to 1 minute before completion
  soundEnabled: true,
};

const defaultContextValue: NotificationContextType = {
  preferences: defaultPreferences,
  updatePreferences: () => {},
  checkAndTriggerNotifications: () => {},
  sentNotifications: new Set<string>(),
};

export const NotificationContext = createContext<NotificationContextType>(defaultContextValue);

export function useNotifications() {
  return useContext(NotificationContext);
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // Load saved preferences from localStorage or use defaults
  const getSavedPreferences = (): NotificationPreferences => {
    const savedPrefs = localStorage.getItem('notificationPreferences');
    if (savedPrefs) {
      return { ...defaultPreferences, ...JSON.parse(savedPrefs) };
    }
    return defaultPreferences;
  };

  const [preferences, setPreferences] = useState<NotificationPreferences>(getSavedPreferences);
  const [sentNotifications, setSentNotifications] = useState<Set<string>>(new Set<string>());

  // Update preferences and save to localStorage
  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    localStorage.setItem('notificationPreferences', JSON.stringify(updatedPreferences));
  };

  // Check for permission and request if needed
  useEffect(() => {
    if (preferences.enabled && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, [preferences.enabled]);

  // Function to check all accounts and trigger notifications for upcoming completions
  const checkAndTriggerNotifications = (accounts: Account[]) => {
    if (!preferences.enabled || !("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const now = new Date();
    const notifyThresholdMs = preferences.notifyBefore * 60 * 1000; // Convert minutes to ms
    
    accounts.forEach(account => {
      // Check main village builders
      account.mainVillageBuilders.forEach((builder, index) => {
        if (builder.inUse && builder.endTime) {
          const endTime = new Date(builder.endTime);
          const timeUntilCompletion = endTime.getTime() - now.getTime();
          
          // If time until completion is within our notification threshold
          if (timeUntilCompletion > 0 && timeUntilCompletion <= notifyThresholdMs) {
            const notificationId = `${account.id}-mainBuilder-${index}-${builder.endTime}`;
            
            // Only send if we haven't already sent this notification
            if (!sentNotifications.has(notificationId)) {
              sendNotification(
                "Builder Completion Soon",
                `A builder in ${account.name} will complete in about ${preferences.notifyBefore} minute(s).`
              );
              
              // Add to sent notifications
              setSentNotifications(prev => {
                const updated = new Set(prev);
                updated.add(notificationId);
                return updated;
              });
            }
          }
        }
      });
      
      // Check builder base builders
      account.builderBaseBuilders.forEach((builder, index) => {
        if (builder.inUse && builder.endTime) {
          const endTime = new Date(builder.endTime);
          const timeUntilCompletion = endTime.getTime() - now.getTime();
          
          // If time until completion is within our notification threshold
          if (timeUntilCompletion > 0 && timeUntilCompletion <= notifyThresholdMs) {
            const notificationId = `${account.id}-builderBaseBuilder-${index}-${builder.endTime}`;
            
            // Only send if we haven't already sent this notification
            if (!sentNotifications.has(notificationId)) {
              sendNotification(
                "Builder Base Completion Soon",
                `A builder base builder in ${account.name} will complete in about ${preferences.notifyBefore} minute(s).`
              );
              
              // Add to sent notifications
              setSentNotifications(prev => {
                const updated = new Set(prev);
                updated.add(notificationId);
                return updated;
              });
            }
          }
        }
      });
      
      // Check main village lab
      if (account.config?.hasMainVillageLab && 
          account.mainVillageLab.inUse && 
          account.mainVillageLab.endTime) {
        const endTime = new Date(account.mainVillageLab.endTime);
        const timeUntilCompletion = endTime.getTime() - now.getTime();
        
        // If time until completion is within our notification threshold
        if (timeUntilCompletion > 0 && timeUntilCompletion <= notifyThresholdMs) {
          const notificationId = `${account.id}-mainLab-${account.mainVillageLab.endTime}`;
          
          // Only send if we haven't already sent this notification
          if (!sentNotifications.has(notificationId)) {
            sendNotification(
              "Lab Research Completion Soon",
              `Lab research in ${account.name} will complete in about ${preferences.notifyBefore} minute(s).`
            );
            
            // Add to sent notifications
            setSentNotifications(prev => {
              const updated = new Set(prev);
              updated.add(notificationId);
              return updated;
            });
          }
        }
      }
      
      // Check builder base lab
      if (account.config?.hasBuilderBaseLab && 
          account.builderBaseLab.inUse && 
          account.builderBaseLab.endTime) {
        const endTime = new Date(account.builderBaseLab.endTime);
        const timeUntilCompletion = endTime.getTime() - now.getTime();
        
        // If time until completion is within our notification threshold
        if (timeUntilCompletion > 0 && timeUntilCompletion <= notifyThresholdMs) {
          const notificationId = `${account.id}-builderBaseLab-${account.builderBaseLab.endTime}`;
          
          // Only send if we haven't already sent this notification
          if (!sentNotifications.has(notificationId)) {
            sendNotification(
              "Builder Base Lab Completion Soon",
              `Builder base lab research in ${account.name} will complete in about ${preferences.notifyBefore} minute(s).`
            );
            
            // Add to sent notifications
            setSentNotifications(prev => {
              const updated = new Set(prev);
              updated.add(notificationId);
              return updated;
            });
          }
        }
      }
    });
  };

  // Function to actually send the notification
  const sendNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: body,
        icon: '/vite.svg', // Uses the Vite logo as icon
      });
      
      // Play sound if enabled
      if (preferences.soundEnabled) {
        // We can implement a simple beep sound here or use an audio file
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8OC5dDMSQJ/b+dSbURUsm/DHo3Y/G0SowNGSSyg8rud3Sig9W7ONQRUHJn3pvn8Siea5Yh4wH7Db3o1qJYfCoVMwIbnk5YY6GB253/fWsXwyEYvT/+DAdCwJltz74cdqGRKm1+XAchsZpNr0xZpaHR2m3vrdrFcUKrfg58OFTCY3otz92bx6MoCYy/fddgwap9/2yqBoIjqh1P3TsXovGarY+NS2cCsdRJTX+9rFfixJrOL9yp1NFVKHw/bmoGorFovR98WtZiMoos/6wZ5VGk6M3v3bvngpM6PV9cWiXxpAlNb+1rp4KzCa0PjdqGAeLZbX9s2mYh0pqNz2075/KhCa1/7Qp2UdK5nU+N2ycSsZmdL93LVzLBqY0fjjunUpFKXd/dO3eCguk9L+1K1pJCeW0PjftXEqHaTV+dqybioindT827RxKxSu4v7FpGMhKJLN9da2cQ8tls3127xnGUmHzPXWu2gNLJfR+d26aRxQj9L52bpmG0+FzPbdvmYRRozP9t23aBtGktP72blnIEKP0PbetWQOP4zQ+d67Zh1Lh9H437pmHEqL0Pjct2YaQ4/S+tWxZhxMiMz33bNoG0uK0PfbtGcaRJHT+NqxZR5Ki8/33rhoGkiRz/fbt2UcP4zQ+d67ZRxLiM/43LVmHEaP0vnauWUc');
          audio.play();
        } catch (e) {
          console.error("Failed to play notification sound", e);
        }
      }
      
      return notification;
    }
    return null;
  };

  return (
    <NotificationContext.Provider value={{ 
      preferences, 
      updatePreferences, 
      checkAndTriggerNotifications,
      sentNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}