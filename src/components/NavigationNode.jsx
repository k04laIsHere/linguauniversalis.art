// Navigation Node Component
// Clickable nodes at each section for direct navigation

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * NavigationNode - Clickable circle at section position
 * @param {object} section - Section object from SCROLL_PATH
 * @param {boolean} isActive - Whether this is the current section
 * @param {boolean} isVisible - Whether the node should be visible
 * @param {function} onNavigate - Callback when node is clicked
 */
export function NavigationNode({ section, isActive, isVisible, onNavigate }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute pointer-events-auto cursor-pointer z-50"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(${section.position.x}px, ${section.position.y}px)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={() => onNavigate(section)}
        >
          {/* Node circle */}
          <motion.div
            className={`
              w-4 h-4 rounded-full border-2 -translate-x-1/2 -translate-y-1/2
              ${
                isActive
                  ? 'bg-lu-gold border-lu-gold shadow-lg shadow-lu-gold/50'
                  : 'bg-transparent border-white/30 hover:border-lu-gold hover:bg-lu-gold/20'
              }
              transition-colors duration-300
            `}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Inner glow effect for active node */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-lu-gold"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.div>

          {/* Section label (appears on hover) */}
          <motion.div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white/50 pointer-events-none"
            initial={{ opacity: 0, y: -5 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {section.name}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * NavigationNodes Container - Renders all nodes
 * @param {array} sections - Array of section objects
 * @param {object} currentSection - Currently active section
 * @param {boolean} isVisible - Whether nodes should be visible (controlled by zoom state)
 * @param {function} onNavigate - Navigation callback
 */
export function NavigationNodes({ sections, currentSection, isVisible, onNavigate }) {
  return (
    <>
      {sections.map((section) => (
        <NavigationNode
          key={section.id}
          section={section}
          isActive={currentSection?.id === section.id}
          isVisible={isVisible}
          onNavigate={onNavigate}
        />
      ))}
    </>
  );
}
