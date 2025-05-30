import WebApp from '@twa-dev/sdk';

interface TelegramUser {
  id: string;
  name: string;
  role: string;
}

export const initTelegramWebApp = async (): Promise<void> => {
  WebApp.ready();
  
  // Применяем тему Telegram
  document.documentElement.style.setProperty(
    '--tg-theme-text-color',
    WebApp.themeParams.text_color || '#000000'
  );
  document.documentElement.style.setProperty(
    '--tg-theme-button-color',
    WebApp.themeParams.button_color || '#2481cc'
  );
  document.documentElement.style.setProperty(
    '--tg-theme-bg-color',
    WebApp.themeParams.bg_color || '#ffffff'
  );
  
  // Расширяем веб-приложение на весь экран
  WebApp.expand();
};

export const getUserData = async (): Promise<TelegramUser> => {
  const userId = WebApp.initDataUnsafe?.user?.id?.toString();
  
  if (!userId) {
    // Для разработки возвращаем тестового пользователя
    return {
      id: 'test_user',
      name: 'Test User',
      role: 'student'
    };
  }
  
  try {
    // Получаем данные пользователя с сервера
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}`);
    
    if (response.ok) {
      const userData = await response.json();
      return {
        id: userData.id,
        name: userData.full_name || userData.username,
        role: userData.role
      };
    }
  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
  }
  
  // Возвращаем базовые данные из Telegram
  return {
    id: userId,
    name: WebApp.initDataUnsafe?.user?.username || 'Пользователь',
    role: 'student'
  };
};

export const showAlert = (message: string): void => {
  WebApp.showAlert(message);
};

export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    WebApp.showConfirm(message, resolve);
  });
};