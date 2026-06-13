import { motion } from 'framer-motion';

export default function ResearchBot({ status }) {
  // status can be 'idle', 'crawling', 'done', 'error'
  
  const isCrawling = status === 'crawling';
  
  return (
    <div className="relative w-48 h-48 mx-auto">
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-2xl"
        animate={{
          y: isCrawling ? [0, -10, 0] : [0, -3, 0],
        }}
        transition={{
          duration: isCrawling ? 0.5 : 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Antenna */}
        <line x1="100" y1="50" x2="100" y2="20" stroke="#CBD5E1" strokeWidth="4" />
        <motion.circle
          cx="100" cy="15" r="5"
          fill={isCrawling ? "#EF4444" : "#EAB308"}
          animate={isCrawling ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />

        {/* Head */}
        <rect x="50" y="50" width="100" height="80" rx="20" fill="#FCA5A5" />
        <rect x="60" y="60" width="80" height="40" rx="10" fill="#1E293B" />
        
        {/* Eyes */}
        <motion.circle
          cx="80" cy="80" r="8" fill="#FDE047"
          animate={isCrawling ? { x: [-5, 5, -5], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
        <motion.circle
          cx="120" cy="80" r="8" fill="#FDE047"
          animate={isCrawling ? { x: [-5, 5, -5], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
        
        {/* Wheels */}
        <motion.circle cx="70" cy="140" r="15" fill="#334155" 
          animate={isCrawling ? { rotate: 360 } : {}} 
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "70px 140px" }}
        />
        <motion.circle cx="130" cy="140" r="15" fill="#334155" 
          animate={isCrawling ? { rotate: 360 } : {}} 
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "130px 140px" }}
        />
        <circle cx="70" cy="140" r="5" fill="#CBD5E1" />
        <circle cx="130" cy="140" r="5" fill="#CBD5E1" />

      </motion.svg>
    </div>
  );
}
