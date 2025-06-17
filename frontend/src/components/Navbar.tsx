import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Code, Users, TrendingUp, Bell, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isStudentProfile = location.pathname.includes('/student/');

  return (
    <nav className={`
      navbar sticky top-0 z-40 transition-all duration-300
      ${scrolled 
        ? 'shadow-lg backdrop-blur-md bg-white/90 dark:bg-gray-800/90' 
        : 'shadow-sm bg-white/80 dark:bg-gray-800/80'
      }
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center space-x-4 fade-in-left">
            <div className="relative group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 hover-scale">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">
                Student Progress
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Management System
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-6 fade-in">
            {/* Stats Badge */}
            <div className="flex items-center space-x-4 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-full">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <Users size={16} />
                <span className="font-medium">Tracking Progress</span>
              </div>
              
              {isStudentProfile && (
                <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                  <TrendingUp size={16} />
                  <span className="font-medium">Analytics View</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 hover-scale">
                <Bell size={18} />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 hover-scale">
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Theme toggle and mobile indicator */}
          <div className="flex items-center space-x-3 fade-in-right">
            {/* Mobile stats indicator */}
            <div className="sm:hidden flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Progress bar for page loading */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 transition-transform duration-300 origin-left" id="page-progress"></div>
      
      {/* Subtle gradient border */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
    </nav>
  );
};

export default Navbar;