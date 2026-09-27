/**
 * USE VOICE INPUT HOOK
 * Provides Web Speech API integration for voice-to-text functionality
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  continuous?: boolean;
  language?: string;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
}

// Extend Window interface for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    onTranscript,
    onFinalTranscript,
    continuous = false,
    language = 'en-US',
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const isStoppingRef = useRef(false);

  // Check for browser support
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      isStoppingRef.current = false;
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if continuous mode and not manually stopped
      if (continuous && !isStoppingRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Ignore errors on restart
        }
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      if (finalText) {
        setTranscript(prev => {
          const newTranscript = prev ? `${prev} ${finalText}` : finalText;
          onTranscript?.(newTranscript);
          onFinalTranscript?.(finalText);
          return newTranscript;
        });
        setInterimTranscript('');
      } else {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied', {
          description: 'Please enable microphone permissions in your browser settings.',
        });
      } else if (event.error === 'no-speech') {
        // Silent fail for no speech detected
      } else if (event.error !== 'aborted') {
        toast.error('Voice input error', {
          description: 'Please try again.',
        });
      }
      
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        isStoppingRef.current = true;
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [continuous, language, onTranscript, onFinalTranscript, isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice input not supported', {
        description: 'Your browser does not support voice input. Try Chrome or Edge.',
      });
      return;
    }

    if (!recognitionRef.current || isListening) return;

    isStoppingRef.current = false;
    setInterimTranscript('');
    
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      if (e.name === 'InvalidStateError') {
        // Already started, ignore
      } else {
        console.error('Failed to start voice input:', e);
        toast.error('Failed to start voice input');
      }
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    isStoppingRef.current = true;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      // Ignore stop errors
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}
