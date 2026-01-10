import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RiskScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RiskScoreGauge({ score, size = 'md', showLabel = true }: RiskScoreGaugeProps) {
  const getRiskLevel = (score: number): { label: string; color: string; bgColor: string } => {
    if (score <= 25) {
      return { label: 'Basso', color: 'text-green-500', bgColor: 'stroke-green-500' };
    } else if (score <= 50) {
      return { label: 'Medio', color: 'text-yellow-500', bgColor: 'stroke-yellow-500' };
    } else if (score <= 75) {
      return { label: 'Alto', color: 'text-orange-500', bgColor: 'stroke-orange-500' };
    } else {
      return { label: 'Critico', color: 'text-red-500', bgColor: 'stroke-red-500' };
    }
  };

  const risk = getRiskLevel(score);
  
  const sizes = {
    sm: { width: 60, height: 60, strokeWidth: 6, fontSize: 'text-sm', labelSize: 'text-xs' },
    md: { width: 80, height: 80, strokeWidth: 8, fontSize: 'text-lg', labelSize: 'text-sm' },
    lg: { width: 120, height: 120, strokeWidth: 10, fontSize: 'text-2xl', labelSize: 'text-base' },
  };

  const { width, height, strokeWidth, fontSize, labelSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width, height: height / 2 + 10 }}>
        <svg
          width={width}
          height={height / 2 + strokeWidth}
          className="transform -rotate-0"
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${height / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${height / 2}`}
            fill="none"
            className="stroke-muted"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <motion.path
            d={`M ${strokeWidth / 2} ${height / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${height / 2}`}
            fill="none"
            className={risk.bgColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex items-end justify-center pb-0">
          <motion.span
            className={cn('font-bold', fontSize, risk.color)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>

      {showLabel && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className={cn('font-medium', labelSize, risk.color)}>
            Rischio {risk.label}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Simple badge version for inline use
export function RiskBadge({ score, className }: { score: number; className?: string }) {
  const getRiskStyle = (score: number) => {
    if (score <= 25) return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (score <= 50) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    if (score <= 75) return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  const getLabel = (score: number) => {
    if (score <= 25) return 'Basso';
    if (score <= 50) return 'Medio';
    if (score <= 75) return 'Alto';
    return 'Critico';
  };

  return (
    <motion.span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border',
        getRiskStyle(score),
        className
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {getLabel(score)}
    </motion.span>
  );
}
