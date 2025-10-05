import { ChartCard } from '../ChartCard';

// todo: remove mock functionality
const mockData = [
  { name: 'Пн', value: 120 },
  { name: 'Вт', value: 190 },
  { name: 'Ср', value: 150 },
  { name: 'Чт', value: 220 },
  { name: 'Пт', value: 280 },
  { name: 'Сб', value: 310 },
  { name: 'Вс', value: 260 },
];

export default function ChartCardExample() {
  return (
    <div className="p-4">
      <ChartCard
        title="Активность пользователей"
        description="Количество активных пользователей за последнюю неделю"
        data={mockData}
      />
    </div>
  );
}
