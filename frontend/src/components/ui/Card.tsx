import React, { useState } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  glass?: boolean;
  bordered?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = true,
  hover = false,
  glow = false,
  gradient = false,
  glass = false,
  bordered = true,
  shadow = 'md',
  rounded = 'xl',
  onClick,
  header,
  footer,
  loading = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPaddingClass = () => {
    if (padding === false) return '';
    if (padding === true || padding === 'md') return 'p-6';
    
    const paddingMap = {
      sm: 'p-4',
      lg: 'p-8',
      xl: 'p-10'
    };
    
    return paddingMap[padding] || 'p-6';
  };

  const getShadowClass = () => {
    const shadowMap = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
    };
    
    return shadowMap[shadow];
  };

  const getRoundedClass = () => {
    const roundedMap = {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full'
    };
    
    return roundedMap[rounded];
  };

  const baseClasses = `
    transition-all duration-300 ease-out relative overflow-hidden
    ${getRoundedClass()}
    ${getShadowClass()}
    ${onClick ? 'cursor-pointer' : ''}
    ${hover ? 'hover:scale-105 hover:shadow-2xl' : ''}
    ${isHovered && glow ? 'shadow-2xl' : ''}
  `;

  const backgroundClasses = glass 
    ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/30'
    : gradient
    ? 'bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800'
    : 'bg-white dark:bg-gray-800';

  const borderClasses = bordered && !glass
    ? 'border border-gray-200 dark:border-gray-700'
    : '';

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (loading) {
    return (
      <div className={`${baseClasses} ${backgroundClasses} ${borderClasses} ${getPaddingClass()} ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${backgroundClasses} ${borderClasses} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Glow effect */}
      {glow && isHovered && (
        <div className={`
          absolute inset-0 opacity-75 transition-opacity duration-300
          bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 
          ${getRoundedClass()} blur-xl
        `} />
      )}

      {/* Gradient overlay */}
      {gradient && (
        <div className={`
          absolute inset-0 opacity-60
          bg-gradient-to-br from-transparent via-white/5 to-white/10
          dark:from-transparent dark:via-gray-700/10 dark:to-gray-600/20
          ${getRoundedClass()}
        `} />
      )}

      {/* Hover overlay */}
      {hover && (
        <div className={`
          absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5
          ${getRoundedClass()}
        `} />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        {header && (
          <div className={`${padding ? 'mb-4 pb-4 border-b border-gray-200 dark:border-gray-700' : 'mb-0'}`}>
            {header}
          </div>
        )}

        {/* Main content */}
        <div className={padding ? getPaddingClass() : ''}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`${padding ? 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-700' : 'mt-0'}`}>
            {footer}
          </div>
        )}
      </div>

      {/* Shimmer effect for interactive cards */}
      {onClick && (
        <div className={`
          absolute inset-0 -translate-x-full group-hover:translate-x-full 
          transition-transform duration-1000 ease-in-out
          bg-gradient-to-r from-transparent via-white/20 to-transparent
          ${getRoundedClass()}
        `} />
      )}

      {/* Border glow animation */}
      {isHovered && glow && (
        <div className={`
          absolute inset-0 opacity-50
          bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
          ${getRoundedClass()}
        `} style={{
          background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
          animation: 'borderGlow 2s ease-in-out infinite'
        }} />
      )}
    </div>
  );
};

export default Card;