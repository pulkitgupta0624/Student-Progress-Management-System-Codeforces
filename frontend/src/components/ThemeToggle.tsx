import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleToggle = async () => {
    setIsTransitioning(true);
    
    // Add a small delay for the animation
    setTimeout(() => {
      toggleTheme();
      setIsTransitioning(false);
    }, 150);
  };

  useEffect(() => {
    // Close options when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.theme-toggle-container')) {
        setShowOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getIcon = () => {
    if (isTransitioning) {
      return <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />;
    }
    
    switch (theme) {
      case 'dark':
        return <Moon className="w-5 h-5" />;
      case 'light':
        return <Sun className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getBackgroundColor = () => {
    switch (theme) {
      case 'dark':
        return 'from-indigo-600 to-purple-600';
      case 'light':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="theme-toggle-container relative">
      {/* Main Toggle Button */}
      <button
        onClick={handleToggle}
        className={`
          relative group p-3 rounded-xl transition-all duration-300 ease-out
          bg-gradient-to-br ${getBackgroundColor()}
          hover:scale-110 hover:shadow-lg active:scale-95
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          text-white shadow-md
        `}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        disabled={isTransitioning}
      >
        {/* Background glow effect */}
        <div className={`
          absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-br ${getBackgroundColor()} blur-lg scale-110
        `} />
        
        {/* Icon container */}
        <div className="relative z-10 transition-transform duration-300 group-hover:rotate-12">
          {getIcon()}
        </div>

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-150" />
      </button>

      {/* Theme Options Dropdown */}
      {showOptions && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fadeInDown">
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                // Set light theme logic
                setShowOptions(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <Sun className="w-4 h-4 text-yellow-500" />
              <span>Light</span>
              {theme === 'light' && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />}
            </button>
            
            <button
              onClick={() => {
                // Set dark theme logic
                setShowOptions(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Dark</span>
              {theme === 'dark' && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />}
            </button>
            
            <button
              onClick={() => {
                // Set system theme logic
                setShowOptions(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <Monitor className="w-4 h-4 text-gray-500" />
              <span>System</span>
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
              Current: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </div>
          </div>
        </div>
      )}

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-1 h-1 bg-white/40 rounded-full opacity-0 group-hover:opacity-100
              transition-all duration-1000 delay-${i * 200}
            `}
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + i * 15}%`,
              animation: `float 2s ease-in-out infinite ${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Keyboard shortcut hint */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Click to toggle
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ThemeToggle;