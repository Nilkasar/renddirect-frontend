import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showRing?: boolean;
  ringColor?: string;
  animated?: boolean;
  onClick?: () => void;
}

// Beautiful gradient combinations
const gradients = [
  'from-rose-400 via-fuchsia-500 to-indigo-500',
  'from-amber-400 via-orange-500 to-rose-500',
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-blue-400 via-indigo-500 to-purple-500',
  'from-pink-400 via-rose-500 to-red-500',
  'from-violet-400 via-purple-500 to-indigo-500',
  'from-cyan-400 via-sky-500 to-blue-500',
  'from-lime-400 via-emerald-500 to-teal-500',
  'from-fuchsia-400 via-pink-500 to-rose-500',
  'from-sky-400 via-cyan-500 to-teal-500',
];

// Fun emoji avatars
const avatarEmojis = [
  '😊', '😎', '🤗', '😄', '🥰', '😇', '🤩', '😋', '🦊', '🐱',
  '🐼', '🦁', '🐯', '🐻', '🐨', '🐰', '🦄', '🐲', '🌟', '🎯',
];

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
  '2xl': 'w-20 h-20 text-3xl',
};

const Avatar: React.FC<AvatarProps> = ({
  name = '',
  src,
  size = 'md',
  className = '',
  showRing = false,
  ringColor = 'ring-white',
  animated = true,
  onClick,
}) => {
  // Generate consistent avatar based on name
  const avatarData = useMemo(() => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradientIndex = hash % gradients.length;
    const emojiIndex = hash % avatarEmojis.length;

    return {
      gradient: gradients[gradientIndex],
      emoji: avatarEmojis[emojiIndex],
      initials: name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    };
  }, [name]);

  const baseClasses = `
    ${sizeClasses[size]}
    rounded-full
    flex items-center justify-center
    font-bold
    select-none
    ${showRing ? `ring-2 ${ringColor} ring-offset-2` : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const content = src ? (
    <motion.img
      src={src}
      alt={name}
      className={`${baseClasses} object-cover`}
      whileHover={animated ? { scale: 1.05 } : undefined}
      whileTap={animated ? { scale: 0.95 } : undefined}
      onClick={onClick}
    />
  ) : (
    <motion.div
      className={`${baseClasses} bg-gradient-to-br ${avatarData.gradient} text-white shadow-lg`}
      whileHover={animated ? { scale: 1.05, rotate: [0, -5, 5, 0] } : undefined}
      whileTap={animated ? { scale: 0.95 } : undefined}
      onClick={onClick}
      style={{
        boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Decorative inner glow */}
      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />

      {/* Show emoji for fun, initials as fallback */}
      <span className="relative z-10 drop-shadow-sm">
        {size === 'xs' || size === 'sm' ? avatarData.initials : avatarData.emoji}
      </span>
    </motion.div>
  );

  return content;
};

// Avatar with status indicator
interface AvatarWithStatusProps extends AvatarProps {
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export const AvatarWithStatus: React.FC<AvatarWithStatusProps> = ({
  status,
  ...props
}) => {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  return (
    <div className="relative inline-block">
      <Avatar {...props} />
      {status && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`
            absolute bottom-0 right-0
            ${statusSizes[props.size || 'md']}
            ${statusColors[status]}
            rounded-full
            ring-2 ring-white
          `}
        />
      )}
    </div>
  );
};

// Avatar group for showing multiple users
interface AvatarGroupProps {
  users: Array<{ name: string; src?: string }>;
  max?: number;
  size?: AvatarProps['size'];
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 4,
  size = 'md',
}) => {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const overlapClasses = {
    xs: '-ml-2',
    sm: '-ml-2.5',
    md: '-ml-3',
    lg: '-ml-4',
    xl: '-ml-5',
    '2xl': '-ml-6',
  };

  return (
    <div className="flex items-center">
      {displayUsers.map((user, index) => (
        <motion.div
          key={index}
          className={`${index > 0 ? overlapClasses[size] : ''} relative`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          style={{ zIndex: displayUsers.length - index }}
        >
          <Avatar
            name={user.name}
            src={user.src}
            size={size}
            showRing
            ringColor="ring-white"
          />
        </motion.div>
      ))}
      {remainingCount > 0 && (
        <motion.div
          className={`${overlapClasses[size]} relative z-0`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div
            className={`
              ${sizeClasses[size]}
              rounded-full
              bg-gray-200
              flex items-center justify-center
              font-semibold text-gray-600
              ring-2 ring-white
            `}
          >
            +{remainingCount}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Animated avatar for special occasions
export const AnimatedAvatar: React.FC<AvatarProps> = (props) => {
  return (
    <motion.div
      className="relative"
      animate={{
        y: [0, -3, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-md opacity-50"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <Avatar {...props} />
    </motion.div>
  );
};

export default Avatar;
