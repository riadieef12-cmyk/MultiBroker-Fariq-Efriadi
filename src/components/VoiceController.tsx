import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface VoiceControllerProps {
  onCommand: (cmd: string) => void;
  addLog: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export function VoiceController({ onCommand, addLog }: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for webkitSpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'id-ID'; // Indonesian Language

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        addLog(`Mendengar perintah: "${transcript}"`, 'info');
        onCommand(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          addLog(`Gagal mengenali suara: Izin Mikrofon ditolak atau diblokir. Pastikan memberikan izin mikrofon dan gunakan tombol terlebih dahulu.`, 'error');
        } else {
          addLog(`Gagal mengenali suara: ${event.error}`, 'error');
        }
        setIsListening(false);
        setIsPreparing(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      addLog('Browser tidak mendukung Web Speech API', 'error');
    }
  }, [onCommand, addLog]);

  const toggleListening = useCallback(() => {
    if (isListening || isPreparing) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsPreparing(false);
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setIsPreparing(true);
        addLog('Bersiap mendengarkan...', 'info');
        // Memberikan jeda sebelum mulai mendengar
        timeoutRef.current = setTimeout(() => {
          setIsPreparing(false);
          addLog('Mendengarkan suara...', 'info');
          recognitionRef.current.start();
        }, 1000);
      } else {
        addLog('Browser Anda tidak mendukung fitur Voice Command.', 'error');
      }
    }
  }, [isListening, isPreparing, addLog]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat && !isListening && !isPreparing) {
          toggleListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, toggleListening]);

  return (
    <div className="bg-[#2c3629] p-6 rounded-xl shadow-lg border border-[#404e3b] flex justify-between items-center">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Voice Command</h3>
        <p className="text-sm text-gray-400">
          Tekan <kbd className="bg-gray-800 text-gray-300 text-xs px-1.5 py-0.5 rounded border border-gray-600 font-sans mx-1">Spasi</kbd> untuk berbicara. Ucapkan <span className="text-green-400">"Nyalakan lampu 1"</span> atau <span className="text-red-400">"Matikan semua lampu"</span>
        </p>
      </div>
      
      <button
        onClick={toggleListening}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          isListening 
            ? 'bg-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
            : isPreparing 
            ? 'bg-yellow-500/20 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
            : 'bg-[#404e3b] hover:bg-[#4d5e47] text-white'
        }`}
      >
        {isListening ? (
          <>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full border-2 border-red-500/30"
            />
            <Loader2 className="w-8 h-8 animate-spin absolute text-red-500" />
          </>
        ) : isPreparing ? (
          <>
             <Loader2 className="w-8 h-8 animate-spin absolute text-yellow-500" />
          </>
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </button>
    </div>
  );
}
