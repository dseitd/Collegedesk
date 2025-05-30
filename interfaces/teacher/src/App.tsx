import React, { useState, useEffect } from 'react';
import { initTelegramWebApp, getUserData } from './utils/telegram';
import TeacherDashboard from './TeacherDashboard';
import './App.css';

interface User {
  role: string;
  id: string;
  name: string;
  avatar?: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initApp = async () => {
      await initTelegramWebApp();
      const userData = await getUserData();
      // Принудительно устанавливаем роль преподавателя для этого интерфейса
      setUser({ ...userData, role: 'teacher' });
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
        Загрузка интерфейса преподавателя...
      </div>
    );
  }

  return (
    <div className="app">
      <TeacherDashboard user={user} />
    </div>
  );
};

export default App;
