import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text,
  fullScreen = false,
}) => {
  const { t } = useTranslation();
  const loadingText = text || t('common.loading');
  
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-6 h-6',
      text: 'text-sm',
      wrapper: 'gap-2',
    },
    medium: {
      container: 'w-10 h-10',
      text: 'text-base',
      wrapper: 'gap-3',
    },
    large: {
      container: 'w-16 h-16',
      text: 'text-lg',
      wrapper: 'gap-4',
    },
  };

  // Animation variants
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        ease: 'linear',
        repeat: Infinity,
      },
    },
  };

  const dotVariants = {
    initial: { scale: 1 },
    animate: (i: number) => ({
      scale: [1, 1.5, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: i * 0.2,
      },
    }),
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : ''
      }`}
    >
      <div className={`flex flex-col items-center ${sizeConfig[size].wrapper}`}>
        <div className={`relative ${sizeConfig[size].container}`}>
          {/* Rotating circle */}
          <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-primary"
            variants={containerVariants}
            animate="animate"
          />
          
          {/* Pulsing dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 mx-0.5 rounded-full bg-primary"
                variants={dotVariants}
                initial="initial"
                animate="animate"
                custom={i}
              />
            ))}
          </div>
        </div>
        
        {loadingText && (
          <motion.p 
            className={`text-muted-foreground ${sizeConfig[size].text}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {loadingText}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;