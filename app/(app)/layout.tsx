'use client';

import { useState } from 'react';
import { Sidebar, TopBar, MobileDrawer } from '@/components/layout';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { InstallPrompt } from '@/components/pwa';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      {/* PWA Install Prompt */}
      <InstallPrompt />
      </div>
    </NotificationProvider>
  );
}
