import React, { useState } from 'react';
import './AdminDashboard.css';

interface User {
  role: string;
  id: string;
  name: string;
  avatar?: string;
}

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const systemStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalTeachers: 45,
    totalStudents: 1180,
    totalClasses: 48,
    systemUptime: '99.8%'
  };

  const recentActivity = [
    { type: 'user_login', user: 'Иванов А.А.', action: 'Вход в систему', time: '10:30', status: 'success' },
    { type: 'grade_added', user: 'Петрова М.В.', action: 'Добавлена оценка', time: '10:25', status: 'info' },
    { type: 'user_registered', user: 'Сидоров П.П.', action: 'Регистрация', time: '10:20', status: 'success' },
    { type: 'system_error', user: 'Система', action: 'Ошибка подключения к БД', time: '10:15', status: 'error' },
    { type: 'backup_completed', user: 'Система', action: 'Резервное копирование', time: '09:00', status: 'success' }
  ];

  const pendingRequests = [
    { type: 'Регистрация преподавателя', name: 'Козлов И.И.', subject: 'Физика', date: '15.01.2024' },
    { type: 'Смена группы', name: 'Морозова А.А.', details: '10А → 10Б', date: '15.01.2024' },
    { type: 'Восстановление пароля', name: 'Волков С.С.', details: 'Студент', date: '14.01.2024' }
  ];

  const renderOverview = () => (
    <div className="overview-content">
      {/* System Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-number">{systemStats.totalUsers}</div>
            <div className="stat-label">Всего пользователей</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-info">
            <div className="stat-number">{systemStats.activeUsers}</div>
            <div className="stat-label">Активных пользователей</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <div className="stat-number">{systemStats.totalTeachers}</div>
            <div className="stat-label">Преподавателей</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <div className="stat-number">{systemStats.totalStudents}</div>
            <div className="stat-label">Студентов</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏫</div>
          <div className="stat-info">
            <div className="stat-number">{systemStats.totalClasses}</div>
            <div className="stat-label">Классов</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <div className="stat-number">{systemStats.systemUptime}</div>
            <div className="stat-label">Время работы</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h3>Последняя активность</h3>
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
            <div key={index} className={`activity-item ${activity.status}`}>
              <div className="activity-icon">
                {activity.status === 'success' && '✅'}
                {activity.status === 'error' && '❌'}
                {activity.status === 'info' && 'ℹ️'}
              </div>
              <div className="activity-details">
                <div className="activity-user">{activity.user}</div>
                <div className="activity-action">{activity.action}</div>
              </div>
              <div className="activity-time">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Requests */}
      <div className="requests-section">
        <h3>Ожидающие запросы</h3>
        <div className="requests-list">
          {pendingRequests.map((request, index) => (
            <div key={index} className="request-item">
              <div className="request-info">
                <div className="request-type">{request.type}</div>
                <div className="request-name">{request.name}</div>
                <div className="request-details">{request.details || request.subject}</div>
              </div>
              <div className="request-actions">
                <button className="btn-approve">Одобрить</button>
                <button className="btn-reject">Отклонить</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="users-content">
      <div className="users-header">
        <h3>Управление пользователями</h3>
        <button className="btn-add-user">Добавить пользователя</button>
      </div>
      <div className="users-filters">
        <select className="filter-select">
          <option value="all">Все роли</option>
          <option value="student">Студенты</option>
          <option value="teacher">Преподаватели</option>
          <option value="admin">Администраторы</option>
        </select>
        <input type="text" placeholder="Поиск пользователей..." className="search-input" />
      </div>
      <div className="placeholder-content">
        <p>Здесь будет список пользователей с возможностью редактирования</p>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="system-content">
      <h3>Системные настройки</h3>
      <div className="system-sections">
        <div className="system-section">
          <h4>Резервное копирование</h4>
          <p>Последнее: 15.01.2024 09:00</p>
          <button className="btn-backup">Создать резервную копию</button>
        </div>
        <div className="system-section">
          <h4>Логи системы</h4>
          <p>Просмотр системных логов</p>
          <button className="btn-logs">Открыть логи</button>
        </div>
        <div className="system-section">
          <h4>Обновления</h4>
          <p>Версия: 1.0.0</p>
          <button className="btn-update">Проверить обновления</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-info">
          <div className="admin-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="admin-details">
            <h2>Панель администратора</h2>
            <p className="admin-name">{user.name}</p>
          </div>
        </div>
        <div className="admin-actions">
          <button className="btn-notifications">🔔</button>
          <button className="btn-settings">⚙️</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Обзор
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Пользователи
        </button>
        <button 
          className={`tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          Система
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'system' && renderSystem()}
      </div>
    </div>
  );
};

export default AdminDashboard;