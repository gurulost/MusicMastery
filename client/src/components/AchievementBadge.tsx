import { Award, Star, Trophy } from 'lucide-react';

interface AchievementBadgeProps {
  type: 'first_scale' | 'scale_expert' | 'interval_beginner' | 'interval_expert' | 'perfect_student';
  isEarned: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ type, isEarned, size = 'md' }: AchievementBadgeProps) {
  const achievements = {
    first_scale: {
      name: 'First Scale',
      description: 'Mastered your first scale',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: isEarned ? 'bg-yellow-100' : 'bg-gray-100',
    },
    scale_expert: {
      name: 'Scale Expert',
      description: 'Mastered all 24 scales',
      icon: Trophy,
      color: 'text-gold-600',
      bgColor: isEarned ? 'bg-yellow-200' : 'bg-gray-100',
    },
    interval_beginner: {
      name: 'Interval Starter',
      description: 'Mastered your first interval',
      icon: Award,
      color: 'text-blue-600',
      bgColor: isEarned ? 'bg-blue-100' : 'bg-gray-100',
    },
    interval_expert: {
      name: 'Interval Master',
      description: 'Mastered all 13 intervals',
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: isEarned ? 'bg-purple-100' : 'bg-gray-100',
    },
    perfect_student: {
      name: 'Perfect Student',
      description: 'Mastered everything!',
      icon: Trophy,
      color: 'text-emerald-600',
      bgColor: isEarned ? 'bg-emerald-100' : 'bg-gray-100',
    },
  };

  const achievement = achievements[type];
  const Icon = achievement.icon;

  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base',
  };

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div
      className={`
        ${achievement.bgColor} 
        border rounded-lg ${sizeClasses[size]} 
        transition-all duration-200
        ${isEarned ? 'border-current' : 'border-gray-300'}
        ${isEarned ? 'opacity-100' : 'opacity-50'}
      `}
    >
      <div className="flex items-center space-x-2">
        <Icon
          className={`${iconSize[size]} ${isEarned ? achievement.color : 'text-gray-400'}`}
        />
        <div>
          <div className={`font-medium ${isEarned ? achievement.color : 'text-gray-400'}`}>
            {achievement.name}
          </div>
          <div className={`text-xs ${isEarned ? 'text-gray-700' : 'text-gray-400'}`}>
            {achievement.description}
          </div>
        </div>
      </div>
    </div>
  );
}