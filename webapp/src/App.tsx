import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { initTelegramWebApp, getUserData } from './utils/telegram';
import Navigation from './components/Navigation';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

interface User {
  role: string;
  id: string;
  name: string;
  avatar?: string;
  progress?: number;
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
          <Route path="/" element={
            user.role === 'student' ? 
              <StudentDashboard user={user} /> : 
            user.role === 'teacher' ?
              <TeacherDashboard user={user} /> :
            user.role === 'admin' ?
              <AdminDashboard user={user} /> :
              <div>Неизвестная роль пользователя</div>
          } />
          {user.role === 'student' && (
            <Route path="/dashboard" element={<StudentDashboard user={user} />} />
          )}
          {user.role === 'teacher' && (
            <Route path="/teacher" element={<TeacherDashboard user={user} />} />
          )}
          {user.role === 'admin' && (
            <Route path="/admin" element={<AdminDashboard user={user} />} />
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
        Загрузка...
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {/* Навигация отображается только для студентов, у преподавателей и админов своя навигация */}
        {user.role === 'student' && <Navigation userRole={user.role} />}
        <AnimatedRoutes user={user} />
      </div>
    </Router>
  );
};

export default App;