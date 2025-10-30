import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Sparkles } from 'lucide-react';

const ThemeTransitionAlt = ({ isDarkMode }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#2563EB]/10 to-[#14B8A6]/10 backdrop-blur-md"
      >
        <div className="flex flex-col items-center space-y-8">
          {/* Main Icon with Multiple Layers */}
          <div className="relative">
            {/* Outer Glow */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#2563EB] to-[#14B8A6] blur-xl"
            />
            
            {/* Middle Ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-4 border-[#2563EB]"
            />
            
            {/* Main Icon */}
            <motion.div
              initial={{ scale: 0.8, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeInOut",
                rotate: { duration: 1, ease: "easeInOut" }
              }}
              className="relative w-20 h-20 rounded-full bg-gradient-to-r from-[#2563EB] to-[#14B8A6] flex items-center justify-center shadow-2xl"
            >
              {isDarkMode ? (
                <Moon size={40} className="text-white" />
              ) : (
                <Sun size={40} className="text-white" />
              )}
            </motion.div>

            {/* Sparkle Effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0], 
                  opacity: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="absolute"
                style={{
                  top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 50}%`,
                  left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 50}%`,
                }}
              >
                <Sparkles size={16} className="text-[#2563EB]" />
              </motion.div>
            ))}
          </div>

          {/* Enhanced Loading Bar */}
          <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-[#2563EB] to-[#14B8A6] rounded-full"
            />
          </div>

          {/* Shimmer Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-center"
          >
            <motion.h3
              animate={{ 
                backgroundPosition: ["0%", "100%", "0%"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="text-lg font-semibold bg-gradient-to-r from-[#2563EB] via-[#14B8A6] to-[#2563EB] bg-[length:200%_100%] bg-clip-text text-transparent"
            >
              {isDarkMode ? 'Embracing the Dark Side' : 'Welcoming the Light'}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="text-sm text-gray-600 mt-2"
            >
              {isDarkMode ? 'Preparing your dark mode experience...' : 'Setting up your light mode workspace...'}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ThemeTransitionAlt;
