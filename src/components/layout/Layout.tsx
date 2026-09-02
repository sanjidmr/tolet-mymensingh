import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
  currentView?: string;
  onNavigate?: (view: string, params?: any) => void;
  favoritesCount?: number;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentView = 'home',
  onNavigate = () => {},
  favoritesCount = 0,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-600 selection:text-white">
      <Header 
        currentView={currentView} 
        onNavigate={onNavigate} 
        favoritesCount={favoritesCount} 
      />
      
      <main className="flex-1 w-full pb-16 md:pb-0">
        {children}
      </main>

      <Footer onNavigate={onNavigate} />
      
      <MobileNav 
        currentView={currentView} 
        onNavigate={onNavigate} 
        favoritesCount={favoritesCount} 
      />
    </div>
  );
};
