import { DataTable } from '../DataTable';
import { Badge } from '@/components/ui/badge';

// todo: remove mock functionality
const mockUsers = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Пользователь ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? 'Админ' : i % 2 === 0 ? 'Модератор' : 'Пользователь',
  status: i % 4 === 0 ? 'Заблокирован' : 'Активен',
}));

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Имя' },
  { key: 'email', label: 'Email' },
  { 
    key: 'role', 
    label: 'Роль',
    render: (value: string) => (
      <Badge variant={value === 'Админ' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    )
  },
  { 
    key: 'status', 
    label: 'Статус',
    render: (value: string) => (
      <Badge variant={value === 'Активен' ? 'default' : 'destructive'}>
        {value}
      </Badge>
    )
  },
];

export default function DataTableExample() {
  const handleAction = (action: string, row: any) => {
    console.log(`${action} triggered for user:`, row);
  };

  return (
    <div className="p-4">
      <DataTable columns={columns} data={mockUsers} onAction={handleAction} />
    </div>
  );
}
