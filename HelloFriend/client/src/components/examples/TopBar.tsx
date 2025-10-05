import { TopBar } from '../TopBar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useState } from 'react';

export default function TopBarExample() {
  const [isDark, setIsDark] = useState(true);
  
  return (
    <SidebarProvider>
      <TopBar 
        onThemeToggle={() => setIsDark(!isDark)} 
        isDark={isDark}
      />
    </SidebarProvider>
  );
}
