import React from 'react';

interface NavigationProps {
  userRole: string;
}

const Navigation: React.FC<NavigationProps> = ({ userRole }) => {
  return (
    <nav>
      {/* Временная навигация */}
      <ul>
        <li>Главная</li>
        {userRole === 'admin' && <li>Админ панель</li>}
      </ul>
    </nav>
  );
};

export default Navigation;