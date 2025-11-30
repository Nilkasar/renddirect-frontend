import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bars';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className = '',
  text,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  };

  const barSizeClasses = {
    sm: 'w-1 h-4',
    md: 'w-1.5 h-6',
    lg: 'w-2 h-8',
    xl: 'w-2.5 h-10',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${dotSizeClasses[size]} bg-primary-500 rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 bg-primary-500/30 rounded-full animate-ping" />
            <div className="absolute inset-2 bg-primary-500/50 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-1/2 h-1/2 bg-primary-500 rounded-full animate-pulse`} />
            </div>
          </div>
        );

      case 'bars':
        return (
          <div className="flex items-end gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`${barSizeClasses[size]} bg-primary-500 rounded-full animate-pulse`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: `${60 + Math.sin(i * 0.8) * 40}%`,
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <div className={`${sizeClasses[size]} relative`}>
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-primary-200" />
            {/* Spinning gradient */}
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                background: 'conic-gradient(from 0deg, transparent, transparent 70%, #2563eb 100%)',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
              }}
            />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col justify-center items-center gap-3 ${className}`}>
      {renderSpinner()}
      {text && (
        <p className="text-sm text-gray-500 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
