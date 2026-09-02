import React from 'react';
import { 
  Home, 
  Search, 
  PlusCircle, 
  Heart, 
  User 
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';

interface MobileNavProps {
  currentView?: string;
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
  favoritesCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView = 'home',
  onNavigate,
  favoritesCount = 0,
}) => {
  const { language } = useLanguage();

  const isHomeActive = currentView === 'home' || currentView === '/';
  const isSearchActive = ['tolet', 'mess', 'hostel', 'sublet', 'tolet/detail', 'mess/detail', 'hostel/detail', 'sublet/detail'].includes(currentView);
  const isPostActive = currentView === 'post-property' || currentView === 'dashboard/listings/new';
  const isSavedActive = currentView === 'favorites';
  const isProfileActive = currentView.startsWith('dashboard') || currentView === 'login' || currentView === 'register';

  const items = [
    { 
      id: 'home', 
      label: language === 'bn' ? 'হোম' : 'Home', 
      icon: Home,
      isActive: isHomeActive,
    },
    { 
      id: 'tolet', 
      label: language === 'bn' ? 'খুঁজুন' : 'Search', 
      icon: Search,
      isActive: isSearchActive,
    },
    { 
      id: 'post-property', 
      label: language === 'bn' ? 'পোস্ট' : 'Post', 
      icon: PlusCircle,
      isActive: isPostActive,
      isHighlight: true 
    },
    { 
      id: 'favorites', 
      label: language === 'bn' ? 'পছন্দ' : 'Saved', 
      icon: Heart,
      isActive: isSavedActive,
      badge: favoritesCount > 0 ? favoritesCount : undefined 
    },
    { 
      id: 'dashboard', 
      label: language === 'bn' ? 'প্রোফাইল' : 'Account', 
      icon: User,
      isActive: isProfileActive,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-1.5 pt-1.5 safe-area-bottom-bar"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          if (item.isHighlight) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate?.(item.id)}
                className="flex flex-col items-center justify-center -mt-4 cursor-pointer group focus:outline-hidden touch-target-44"
                aria-label={item.label}
              >
                <div className="h-11 w-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-active:scale-95 transition-transform duration-150">
                  <Icon className="h-5 w-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-bold text-emerald-800 mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate?.(item.id)}
              className={`w-full flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative touch-target-44 active:scale-95 ${
                isActive ? 'text-emerald-700' : 'text-stone-500 hover:text-stone-800'
              }`}
              aria-label={item.label}
            >
              <div className="relative flex items-center justify-center h-6 w-6">
                <Icon 
                  className={`h-5 w-5 transition-all ${
                    isActive ? 'text-emerald-600 stroke-[2.4]' : 'text-stone-500 stroke-[1.8]'
                  }`} 
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-[15px] flex items-center justify-center bg-rose-500 text-white rounded-full text-[9px] font-bold leading-none shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight line-clamp-1 ${isActive ? 'font-bold text-emerald-800' : 'font-medium text-stone-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
