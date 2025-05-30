import React from 'react';
import './TeacherDashboard.css';

interface User {
  role: string;
  id: string;
  name: string;
  avatar?: string;
}

interface TeacherDashboardProps {
  user: User;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const currentDate = new Date();
  const currentTime = currentDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const currentDateStr = currentDate.toLocaleDateString('ru-RU', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const todayLessons = [
    { time: '09:00-09:45', subject: 'Математика', group: '10А', room: '205', students: 28 },
    { time: '10:00-10:45', subject: 'Алгебра', group: '11Б', room: '205', students: 25 },
    { time: '11:00-11:45', subject: 'Геометрия', group: '10В', room: '205', students: 27 },
    { time: '12:00-12:45', subject: 'Математика', group: '9А', room: '205', students: 30 }
  ];

  const pendingTasks = [
    { type: 'Проверить контрольные', group: '10А', count: 28, deadline: 'Сегодня' },
    { type: 'Выставить оценки', group: '11Б', count: 25, deadline: 'Завтра' },
    { type: 'Подготовить тест', group: '10В', count: 1, deadline: 'Пятница' }
  ];

  const recentGrades = [
    { student: 'Иванов А.', subject: 'Математика', grade: 5, date: '15.01' },
    { student: 'Петрова М.', subject: 'Алгебра', grade: 4, date: '15.01' },
    { student: 'Сидоров П.', subject: 'Геометрия', grade: 3, date: '14.01' },
    { student: 'Козлова Е.', subject: 'Математика', grade: 5, date: '14.01' }
  ];

  return (
    <div className="teacher-dashboard">
      {/* Header */}
      <div className="teacher-header">
        <div className="teacher-info">
          <div className="teacher-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="teacher-details">
            <h2>Добро пожаловать, {user.name}</h2>
            <p className="teacher-role">Преподаватель математики</p>
            <p className="current-date">{currentDateStr}</p>
          </div>
        </div>
        <div className="current-time">{currentTime}</div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-number">4</div>
          <div className="stat-label">Уроков сегодня</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">110</div>
          <div className="stat-label">Учеников</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">3</div>
          <div className="stat-label">Задач к выполнению</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">12</div>
          <div className="stat-label">Новых оценок</div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="schedule-section">
        <h3>Расписание на сегодня</h3>
        <div className="lessons-list">
          {todayLessons.map((lesson, index) => (
            <div key={index} className="lesson-card">
              <div className="lesson-time">{lesson.time}</div>
              <div className="lesson-details">
                <div className="lesson-subject">{lesson.subject}</div>
                <div className="lesson-meta">
                  <span className="lesson-group">{lesson.group}</span>
                  <span className="lesson-room">Кабинет {lesson.room}</span>
                  <span className="lesson-students">{lesson.students} уч.</span>
                </div>
              </div>
              <div className="lesson-actions">
                <button className="btn-start">Начать урок</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="tasks-section">
        <h3>Задачи к выполнению</h3>
        <div className="tasks-list">
          {pendingTasks.map((task, index) => (
            <div key={index} className="task-card">
              <div className="task-info">
                <div className="task-title">{task.type}</div>
                <div className="task-meta">
                  <span className="task-group">{task.group}</span>
                  <span className="task-count">{task.count} шт.</span>
                </div>
              </div>
              <div className="task-deadline">
                <span className={`deadline ${task.deadline === 'Сегодня' ? 'urgent' : ''}`}>
                  {task.deadline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Grades */}
      <div className="grades-section">
        <h3>Последние оценки</h3>
        <div className="grades-list">
          {recentGrades.map((grade, index) => (
            <div key={index} className="grade-item">
              <div className="student-name">{grade.student}</div>
              <div className="grade-subject">{grade.subject}</div>
              <div className={`grade-value grade-${grade.grade}`}>{grade.grade}</div>
              <div className="grade-date">{grade.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="teacher-nav">
        <div className="nav-item active">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Главная</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">📅</span>
          <span className="nav-label">Расписание</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">📝</span>
          <span className="nav-label">Оценки</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">👥</span>
          <span className="nav-label">Группы</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Настройки</span>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;