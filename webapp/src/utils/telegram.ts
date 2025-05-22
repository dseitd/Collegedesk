import WebApp from '@twa-dev/sdk';

interface TelegramUser {
  id: string;
  name: string;
  role: string;
}

export const initTelegramWebApp = async (): Promise<void> => {
  WebApp.ready();
  
  document.documentElement.style.setProperty(
    '--tg-theme-text-color',
    WebApp.themeParams.text_color || '#000000'
  );
  document.documentElement.style.setProperty(
    '--tg-theme-button-color',
    WebApp.themeParams.button_color || '#2481cc'
  );
};

export const getUserData = async (): Promise<TelegramUser> => {
  // Здесь должна быть логика получения данных пользователя
  return {
    id: WebApp.initDataUnsafe?.user?.id?.toString() || '',
    name: WebApp.initDataUnsafe?.user?.username || '',
    role: 'student' // По умолчанию
  };
};