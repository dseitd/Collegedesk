import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { initTelegramWebApp, getUserData } from './utils/telegram';
import Navigation from './components/Navigation';
import './App.css';

interface User {
  role: string;
  id: string;
  name: string;
}

interface NavigationProps {
  userRole: string;
}

type AnimatedRoutesProps = {
  user: User;
};

const AnimatedRoutes = React.memo<AnimatedRoutesProps>(({ user }) => {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition key={location.key} timeout={300} classNames="fade">
        <Routes location={location}>
          <Route path="/" element={<div>Главная страница</div>} />
          {user.role === 'admin' && (
            <Route path="/admin" element={<div>Админ панель</div>} />
          )}
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
});

AnimatedRoutes.displayName = 'AnimatedRoutes';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initApp = async () => {
      await initTelegramWebApp();
      const userData = await getUserData();
      setUser(userData);
    };
    
    initApp();
  }, []);

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Navigation userRole={user.role} />
        <AnimatedRoutes user={user} />
      </div>
    </Router>
  );
};

export default App;