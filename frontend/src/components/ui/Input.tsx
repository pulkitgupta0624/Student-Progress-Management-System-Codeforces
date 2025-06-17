import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  floating?: boolean;
  variant?: 'default' | 'filled' | 'outlined' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  hint,
  required,
  leftIcon,
  rightIcon,
  floating = false,
  variant = 'default',
  size = 'md',
  loading = false,
  clearable = false,
  onClear,
  className = '',
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    onChange?.(e);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      setHasValue(false);
      onClear?.();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getVariantClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-out';
    
    switch (variant) {
      case 'filled':
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-xl 
          focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400`;
      case 'outlined':
        return `${baseClasses} bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-xl 
          focus:border-blue-500 dark:focus:border-blue-400`;
      case 'underlined':
        return `${baseClasses} bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-600 rounded-none 
          focus:border-blue-500 dark:focus:border-blue-400`;
      default:
        return `${baseClasses} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl 
          focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-4 py-4 text-lg';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const getStatusClasses = () => {
    if (error) {
      return 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20';
    }
    if (success) {
      return 'border-green-500 dark:border-green-400 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500/20';
    }
    return '';
  };

  const showFloatingLabel = floating && (isFocused || hasValue);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {/* Traditional Label */}
      {label && !floating && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative group">
        {/* Floating Label */}
        {floating && label && (
          <label className={`
            absolute left-4 transition-all duration-300 ease-out pointer-events-none select-none
            ${showFloatingLabel 
              ? 'top-2 text-xs text-blue-600 dark:text-blue-400 font-medium' 
              : `top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 ${getSizeClasses().includes('text-lg') ? 'text-lg' : 'text-base'}`
            }
          `}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Left Icon */}
        {leftIcon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-300 
            ${isFocused ? 'text-blue-500 dark:text-blue-400' : ''}`}>
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={inputRef}
          type={inputType}
          className={`
            w-full outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
            ${getVariantClasses()}
            ${getSizeClasses()}
            ${getStatusClasses()}
            ${leftIcon ? 'pl-10' : ''}
            ${(rightIcon || type === 'password' || clearable || loading) ? 'pr-10' : ''}
            ${floating ? 'pt-6 pb-2' : ''}
            ${className}
          `}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={floating ? '' : props.placeholder}
          {...props}
        />

        {/* Right Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {/* Loading Spinner */}
          {loading && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          )}

          {/* Success Icon */}
          {success && !loading && (
            <Check className="w-4 h-4 text-green-500" />
          )}

          {/* Error Icon */}
          {error && !loading && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}

          {/* Clear Button */}
          {clearable && hasValue && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Password Toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {/* Custom Right Icon */}
          {rightIcon && !loading && (
            <div className="text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Focus Ring */}
        <div className={`
          absolute inset-0 rounded-xl pointer-events-none transition-all duration-300
          ${isFocused ? 'ring-2 ring-blue-500/20 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''}
        `} />

        {/* Animated Border (for underlined variant) */}
        {variant === 'underlined' && (
          <div className={`
            absolute bottom-0 left-0 h-0.5 bg-blue-500 dark:bg-blue-400 transition-all duration-300
            ${isFocused ? 'w-full' : 'w-0'}
          `} />
        )}
      </div>

      {/* Helper Text */}
      <div className="mt-2 min-h-[1.25rem]">
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center animate-slideInLeft">
            <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
            {error}
          </p>
        )}
        
        {success && !error && (
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center animate-slideInLeft">
            <Check className="w-4 h-4 mr-1 flex-shrink-0" />
            {success}
          </p>
        )}
        
        {hint && !error && !success && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
};

export default Input;