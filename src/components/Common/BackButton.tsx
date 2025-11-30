import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  /** Custom label for the button */
  label?: string;
  /** Fallback path if there's no history */
  fallbackPath?: string;
  /** Custom onClick handler (overrides default behavior) */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Button variant */
  variant?: 'default' | 'light' | 'dark';
}

/**
 * Reusable back button component with smart navigation
 * - Goes back in history if possible
 * - Falls back to specified path or home if no history
 */
const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  fallbackPath = '/',
  onClick,
  className = '',
  variant = 'default',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    // Check if we can go back in history
    // window.history.length > 2 because initial page load counts as 1
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // No history, go to fallback
      navigate(fallbackPath);
    }
  };

  const variantStyles = {
    default: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    light: 'text-white/80 hover:text-white hover:bg-white/10',
    dark: 'text-gray-400 hover:text-white hover:bg-gray-700',
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${variantStyles[variant]} ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default BackButton;
