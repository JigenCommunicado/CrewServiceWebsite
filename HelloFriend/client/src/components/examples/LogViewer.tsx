import { LogViewer } from '../LogViewer';

// todo: remove mock functionality
const mockLogs = [
  { timestamp: '10:23:45', level: 'INFO' as const, message: 'Сервер запущен на порту 5000' },
  { timestamp: '10:24:12', level: 'INFO' as const, message: 'Подключение к базе данных установлено' },
  { timestamp: '10:25:33', level: 'WARN' as const, message: 'Высокая загрузка CPU: 85%' },
  { timestamp: '10:26:01', level: 'INFO' as const, message: 'Новый пользователь зарегистрирован: user@example.com' },
  { timestamp: '10:27:18', level: 'ERROR' as const, message: 'Ошибка при обработке запроса: timeout' },
  { timestamp: '10:28:45', level: 'INFO' as const, message: 'Кэш очищен успешно' },
  { timestamp: '10:29:22', level: 'WARN' as const, message: 'Медленный запрос к БД: 2.3s' },
  { timestamp: '10:30:10', level: 'INFO' as const, message: 'Резервное копирование выполнено' },
];

export default function LogViewerExample() {
  const handleRefresh = () => {
    console.log('Logs refreshed');
  };

  const handleExport = () => {
    console.log('Logs exported');
  };

  return (
    <div className="p-4">
      <LogViewer logs={mockLogs} onRefresh={handleRefresh} onExport={handleExport} />
    </div>
  );
}
