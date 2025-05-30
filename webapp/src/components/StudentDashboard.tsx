import React from 'react';
import './StudentDashboard.css';

interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  progress?: number;
  group?: string;
}

interface Lesson {
  id: string;
  subject: string;
  time: string;
  duration: number;
  teacher?: string;
  room?: string;
  isNext?: boolean;
  grade?: number;
  homework?: string;
}

interface StudentDashboardProps {
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  // Данные для дневника
  const currentDate = new Date();
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
  const dates = [11, 12, 13, 14, 15];
  const selectedDate = 12; // Вторник

  const nextLesson: Lesson = {
    id: '1',
    subject: 'Математика',
    time: '10:00 - 10:45',
    duration: 4,
    room: 'Каб. 205',
    isNext: true
  };

  const todayLessons: Lesson[] = [
    {
      id: '2',
      subject: 'Физика',
      time: '10:00 - 10:45',
      duration: 45,
      teacher: 'Иванова Е.П.',
      room: 'Каб. 301',
      grade: 5,
      homework: 'Решить задачи 15-20'
    },
    {
      id: '3',
      subject: 'Химия',
      time: '11:00 - 11:45',
      duration: 45,
      teacher: 'Петров А.С.',
      room: 'Каб. 102',
      homework: 'Выучить параграф 12'
    },
    {
      id: '4',
      subject: 'История',
      time: '12:00 - 12:45',
      duration: 45,
      teacher: 'Сидорова М.И.',
      room: 'Каб. 210',
      grade: 4
    }
  ];

  const averageGrade = 4.2;
  const attendancePercent = 92;

  return (
    <div className="student-dashboard">
      {/* Заголовок */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">
            <img src={user.avatar || '/default-avatar.png'} alt={user.name} />
          </div>
          <div className="user-details">
            <h2>Привет, {user.name.split(' ')[0]}!</h2>
            <p>Группа: {user.group || 'ИС-21'} • Посещаемость: {attendancePercent}%</p>
          </div>
        </div>
        <button className="notification-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Статистика */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{averageGrade}</div>
          <div className="stat-label">Средний балл</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{attendancePercent}%</div>
          <div className="stat-label">Посещаемость</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">3</div>
          <div className="stat-label">Домашние задания</div>
        </div>
      </div>

      {/* Календарь недели */}
      <div className="week-calendar">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className={`calendar-day ${dates[index] === selectedDate ? 'selected' : ''}`}
          >
            <span className="day-name">{day}</span>
            <span className="day-number">{dates[index]}</span>
            <div className="day-indicator"></div>
          </div>
        ))}
      </div>

      {/* Следующий урок */}
      <div className="next-lesson-card">
        <div className="lesson-header">
          <div>
            <p className="lesson-label">Следующий урок</p>
            <h3 className="lesson-subject">{nextLesson.subject}</h3>
            <p className="lesson-time">
              <span>ВРЕМЯ:</span>
              <br />
              {nextLesson.time}
            </p>
            <p className="lesson-room">{nextLesson.room}</p>
          </div>
          <div className="lesson-timer">
            <div className="timer-circle">
              <span className="timer-number">{nextLesson.duration}</span>
              <span className="timer-unit">мин</span>
            </div>
          </div>
        </div>
        <button className="go-button">
          Перейти
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Расписание на сегодня */}
      <div className="today-schedule">
        <h3>Расписание на сегодня:</h3>
        <div className="lessons-list">
          {todayLessons.map((lesson) => (
            <div key={lesson.id} className="lesson-item">
              <div className="lesson-time-badge">
                {lesson.time}
              </div>
              <div className="lesson-details">
                <div className="lesson-main-info">
                  <h4>{lesson.subject}</h4>
                  {lesson.grade && (
                    <div className={`grade grade-${lesson.grade}`}>
                      {lesson.grade}
                    </div>
                  )}
                </div>
                {lesson.teacher && (
                  <p className="teacher-name">
                    <span className="teacher-icon">👨‍🏫</span>
                    {lesson.teacher}
                  </p>
                )}
                {lesson.room && (
                  <p className="lesson-room-info">{lesson.room}</p>
                )}
                {lesson.homework && (
                  <p className="homework">
                    <span className="homework-icon">📝</span>
                    {lesson.homework}
                  </p>
                )}
              </div>
              <div className="lesson-duration">
                <span>{lesson.duration}</span>
                <span>мин</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Нижняя навигация */}
      <div className="bottom-navigation">
        <button className="nav-item active">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          <span>Главная</span>
        </button>
        <button className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
          </svg>
          <span>Расписание</span>
        </button>
        <button className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeWidth="2"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeWidth="2"/>
          </svg>
          <span>Оценки</span>
        </button>
        <button className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
            <circle cx="12" cy="7" r="4" strokeWidth="2"/>
          </svg>
          <span>Профиль</span>
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;