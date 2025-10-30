import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

const ThemeTransition = ({ isDarkMode }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center space-y-6">
          {/* Rotating Icon */}
          <motion.div
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ 
              duration: 0.6, 
              ease: "easeInOut",
              rotate: { duration: 0.8, ease: "easeInOut" }
            }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#2563EB] to-[#14B8A6] flex items-center justify-center shadow-2xl">
              {isDarkMode ? (
                <Moon size={32} className="text-white" />
              ) : (
                <Sun size={32} className="text-white" />
              )}
            </div>
            
            {/* Pulsing Ring */}
            <motion.div
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity, 
                ease: "easeOut" 
              }}
              className="absolute inset-0 rounded-full border-2 border-[#2563EB]"
            />
          </motion.div>

          {/* Loading Dots */}
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ 
                  scale: [0.8, 1.2, 0.8], 
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 bg-[#2563EB] rounded-full"
              />
            ))}
          </div>

          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-sm font-medium text-gray-700"
          >
            {isDarkMode ? 'Switching to dark mode...' : 'Switching to light mode...'}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ThemeTransition;
