import React, { useState, useEffect } from 'react';
import { initTelegramWebApp, getUserData } from './utils/telegram';
import StudentDashboard from './StudentDashboard';
import './App.css';

interface User {
  role: string;
  id: string;
  name: string;
  avatar?: string;
  progress?: number;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initApp = async () => {
      await initTelegramWebApp();
      const userData = await getUserData();
      // Принудительно устанавливаем роль студента для этого интерфейса
      setUser({ ...userData, role: 'student' });
    };
    
    initApp();
  }, []);

  if (!user) {
    return (
      <div style={{
        background: '#1a1a1a',
        color: '#fff',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px'
      }}>
        Загрузка студенческого интерфейса...
      </div>
    );
  }

  return (
    <div className="app">
      <StudentDashboard user={user} />
    </div>
  );
};

export default App;
