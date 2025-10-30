import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

const ThemeTransitionMinimal = ({ isDarkMode }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Simple Rotating Icon */}
          <motion.div
            initial={{ scale: 0.9, rotate: 0 }}
            animate={{ scale: 1, rotate: 180 }}
            transition={{ 
              duration: 0.4, 
              ease: "easeInOut"
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#2563EB] to-[#14B8A6] flex items-center justify-center shadow-lg"
          >
            {isDarkMode ? (
              <Moon size={24} className="text-white" />
            ) : (
              <Sun size={24} className="text-white" />
            )}
          </motion.div>

          {/* Simple Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="text-xs text-gray-600"
          >
            {isDarkMode ? 'Dark mode' : 'Light mode'}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ThemeTransitionMinimal;
