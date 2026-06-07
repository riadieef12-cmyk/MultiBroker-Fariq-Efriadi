import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Power, Lightbulb } from 'lucide-react';

interface RelayCardProps {
  key?: React.Key;
  id: 1 | 2 | 3 | 4;
  isOn: boolean;
  onToggle: (id: 1 | 2 | 3 | 4 | 'variasi1' | 'variasi2') => void;
  styleVariant: 'solid' | 'outline';
}

export function RelayCard({ id, isOn, onToggle, styleVariant }: RelayCardProps) {
  const isSolid = styleVariant === 'solid';

  const baseClasses = "relative overflow-hidden rounded-2xl transition-all duration-300 w-full h-full flex flex-col justify-between items-start text-left cursor-pointer group";
  
  const stateClasses = isSolid
    ? isOn
      ? "bg-amber-500 text-white shadow-[0_0_25px_rgba(245,158,11,0.3)] shadow-amber-500/20"
      : "bg-[#2c3629] text-gray-400 border border-[#404e3b] hover:bg-[#323d2f]"
    : isOn
      ? "bg-[#2c3629] text-amber-500 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
      : "bg-transparent text-gray-500 border-2 border-[#404e3b] hover:border-gray-500";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle(id)}
      className={`${baseClasses} ${stateClasses} p-6 min-h-[160px]`}
    >
      <div className="flex justify-between w-full items-start">
        <div className={`p-3 rounded-full ${isOn ? (isSolid ? 'bg-white/20' : 'bg-amber-500/20') : 'bg-[#404e3b]'}`}>
          <Lightbulb className={`w-8 h-8 ${isOn && !isSolid ? 'text-amber-500' : ''}`} />
        </div>
        <div className={`p-2 rounded-full transition-colors ${isOn ? 'bg-green-500/20 text-green-300' : 'bg-gray-800 text-gray-600'}`}>
          <Power className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-xl font-bold font-sans">Lampu {id}</h3>
        <p className={`text-sm mt-1 font-medium ${isOn ? (isSolid ? 'text-amber-100' : 'text-amber-500') : 'text-gray-500'}`}>
          {isOn ? 'Menyala' : 'Mati'}
        </p>
      </div>

      <AnimatePresence>
        {isOn && isSolid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
