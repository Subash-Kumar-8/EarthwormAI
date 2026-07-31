import { useEffect, useRef, useState } from 'react';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const timeoutRef = useRef(null);

  const startListening = (onComplete) => {
    setIsListening(true);
    setTranscript('Recording voice message... Speak your crop query in English or Hindi...');

    const sampleQueries = [
      'What is the best pesticide for tomato leaf curl disease?',
      'How much Urea should I apply for 5 acres of Wheat?',
      'Will it rain in Ludhiana over the next 24 hours?',
    ];
    const selectedQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];

    // Simulate voice recording & AI speech-to-text recognition
    timeoutRef.current = setTimeout(() => {
      setTranscript(selectedQuery);
      setIsListening(false);
      if (onComplete) {
        onComplete(selectedQuery);
      }
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
  };
};
