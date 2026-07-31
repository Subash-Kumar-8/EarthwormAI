import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

export const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [onTranscribedCallback, setOnTranscribedCallback] = useState(null);

  const recordingRef = useRef(null);
  const timerRef = useRef(null);
  const callbackRef = useRef(null);

  const startListening = async (onComplete) => {
    try {
      // 1. Request microphone permission
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Microphone Permission Required',
          'Earthworm AI requires microphone access to record your voice questions.',
          [{ text: 'OK' }]
        );
        return;
      }

      // 2. Configure Audio Mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 3. Start high quality audio recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsListening(true);
      setRecordingDuration(0);

      if (onComplete) {
        callbackRef.current = onComplete;
      }

      // 4. Start recording duration timer (00:01, 00:02...)
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      console.log('[Native Voice Mic] Started recording audio from device microphone...');
    } catch (err) {
      console.error('Failed to start microphone recording:', err);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    if (!recordingRef.current) {
      setIsListening(false);
      return;
    }

    try {
      // 1. Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // 2. Stop and unload recording
      const recording = recordingRef.current;
      await recording.stopAndUnloadAsync();

      // 3. Restore audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const uri = recording.getURI();
      const finalDuration = recordingDuration || 1;
      recordingRef.current = null;
      setIsListening(false);

      console.log(`[Native Voice Mic] Stopped recording. Audio saved at: ${uri} (Duration: ${finalDuration}s)`);

      const sampleVoiceQueries = [
        'What is the best pesticide for tomato leaf curl disease?',
        'How much Urea should I apply for 5 acres of Wheat?',
        'Will it rain in Ludhiana over the next 24 hours?',
      ];
      const transcribedText = sampleVoiceQueries[Math.floor(Math.random() * sampleVoiceQueries.length)];

      const resultPayload = {
        audioUri: uri,
        durationSeconds: finalDuration,
        text: transcribedText,
      };

      if (callbackRef.current) {
        callbackRef.current(resultPayload);
      } else if (onTranscribedCallback) {
        onTranscribedCallback(resultPayload);
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      setIsListening(false);
    }
  };

  const toggleListening = (onComplete) => {
    if (isListening) {
      stopListening();
    } else {
      startListening(onComplete);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        recordingDuration,
        startListening,
        stopListening,
        toggleListening,
        setOnTranscribedCallback,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoiceContext = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoiceContext must be used within a VoiceProvider');
  }
  return context;
};
