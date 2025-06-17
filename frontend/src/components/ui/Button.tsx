import React, { useState } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  glow = false,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    // Press animation
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    if (onClick) {
      onClick(e);
    }
  };

  const baseClasses = `
    relative inline-flex items-center justify-center font-medium transition-all duration-300 
    focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed
    select-none overflow-hidden group
    ${fullWidth ? 'w-full' : ''}
    ${rounded ? 'rounded-full' : 'rounded-xl'}
    ${isPressed ? 'scale-95' : 'scale-100'}
  `;
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 
      hover:from-blue-700 hover:via-blue-800 hover:to-blue-900
      text-white focus:ring-blue-500 shadow-lg hover:shadow-xl
      ${glow ? 'shadow-blue-500/25 hover:shadow-blue-500/40' : ''}
      ${disabled || loading ? 'opacity-60' : 'hover:shadow-blue-500/25'}
    `,
    secondary: `
      bg-white hover:bg-gray-50 text-gray-900 focus:ring-gray-500 
      dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600
      border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md
      ${disabled || loading ? 'opacity-60' : ''}
    `,
    danger: `
      bg-gradient-to-r from-red-600 via-red-700 to-red-800
      hover:from-red-700 hover:via-red-800 hover:to-red-900
      text-white focus:ring-red-500 shadow-lg hover:shadow-xl
      ${glow ? 'shadow-red-500/25 hover:shadow-red-500/40' : ''}
      ${disabled || loading ? 'opacity-60' : 'hover:shadow-red-500/25'}
    `,
    success: `
      bg-gradient-to-r from-green-600 via-green-700 to-green-800
      hover:from-green-700 hover:via-green-800 hover:to-green-900
      text-white focus:ring-green-500 shadow-lg hover:shadow-xl
      ${glow ? 'shadow-green-500/25 hover:shadow-green-500/40' : ''}
      ${disabled || loading ? 'opacity-60' : 'hover:shadow-green-500/25'}
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 
      text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100
      focus:ring-gray-500
      ${disabled || loading ? 'opacity-60' : ''}
    `,
    outline: `
      bg-transparent border-2 border-blue-600 text-blue-600 
      hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400
      dark:hover:bg-blue-400 dark:hover:text-gray-900 focus:ring-blue-500
      ${disabled || loading ? 'opacity-60' : ''}
    `
  };
  
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const iconSize = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Background glow effect */}
      {glow && !disabled && !loading && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`absolute inset-0 ${rounded ? 'rounded-full' : 'rounded-xl'} bg-gradient-to-r ${
            variant === 'primary' ? 'from-blue-400 to-blue-600' :
            variant === 'danger' ? 'from-red-400 to-red-600' :
            variant === 'success' ? 'from-green-400 to-green-600' :
            'from-gray-400 to-gray-600'
          } blur-lg opacity-50`}></div>
        </div>
      )}

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '100px',
            height: '100px',
            animationDuration: '600ms',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
            animationIterationCount: '1'
          }}
        />
      ))}

      {/* Content */}
      <div className="relative flex items-center justify-center space-x-2">
        {loading && (
          <svg 
            className={`animate-spin ${iconSize[size]}`} 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className={iconSize[size]}>{icon}</span>
        )}
        
        <span className={loading ? 'opacity-70' : ''}>{children}</span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span className={iconSize[size]}>{icon}</span>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300 pointer-events-none rounded-inherit"></div>

      {/* Focus ring */}
      <div className="absolute inset-0 rounded-inherit ring-2 ring-transparent group-focus-visible:ring-current group-focus-visible:ring-offset-2 transition-all duration-200"></div>
    </button>
  );
};

export default Button;