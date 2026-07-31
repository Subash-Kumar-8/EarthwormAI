import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AudioWave from '../components/AudioWave';
import ScreenWrapper from '../components/ScreenWrapper';
import { CHAT_MESSAGES_INITIAL } from '../constants/mockData';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useVoiceContext } from '../context/VoiceContext';
import { cropService } from '../services/cropService';

// Voice Note Player Component for user's recorded audio playback
const VoiceNotePlayer = ({ audioUri, durationSeconds = 3 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);

  const handlePlayPause = async () => {
    if (!audioUri) return;

    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          return;
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
          return;
        }
      }

      // Load & Play recorded voice audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (err) {
      console.error('Audio playback error:', err);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.voicePlayerBox}>
      <TouchableOpacity activeOpacity={0.8} onPress={handlePlayPause} style={styles.playBtnCircle}>
        <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={20} color={COLORS.primary} />
      </TouchableOpacity>

      <View style={styles.voiceProgressRow}>
        <Text style={styles.voiceTimerText}>00:0{durationSeconds}</Text>
        <AudioWave isListening={isPlaying} height={14} color={COLORS.white} />
      </View>
    </View>
  );
};

export const AIAssistantScreen = ({ navigation }) => {
  const [messages, setMessages] = useState(CHAT_MESSAGES_INITIAL);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const { isListening, recordingDuration, stopListening, setOnTranscribedCallback } = useVoiceContext();

  const handleSendQuery = async (queryPayload, isVoice = false) => {
    const textToSend = typeof queryPayload === 'string' ? queryPayload : queryPayload?.text;
    if (!textToSend || !textToSend.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      isVoice: isVoice,
      audioUri: typeof queryPayload === 'object' ? queryPayload.audioUri : null,
      durationSeconds: typeof queryPayload === 'object' ? queryPayload.durationSeconds : 3,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const aiReply = await cropService.queryAIAssistant(textToSend);
      setMessages((prev) => [...prev, aiReply]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Connect global voice recording auto-submission callback
  useEffect(() => {
    setOnTranscribedCallback(() => (voicePayload) => {
      handleSendQuery(voicePayload, true);
    });
  }, []);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const renderMessageItem = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser && (
          <View style={styles.aiGlobeBadge}>
            <MaterialCommunityIcons name="earth" size={18} color={COLORS.primary} />
          </View>
        )}

        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {item.isVoice && (
            <View style={{ marginBottom: 4 }}>
              <VoiceNotePlayer audioUri={item.audioUri} durationSeconds={item.durationSeconds} />
            </View>
          )}
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      {/* Header matching Figma */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Chat Assistant</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Animated Sound Wave Recording Banner ("Waving to catch your words") */}
        {isListening && (
          <View style={styles.recordingBanner}>
            <View style={styles.waveWrapper}>
              <AudioWave isListening={isListening} height={20} color={COLORS.accent} />
            </View>
            <Text style={styles.recordingText} numberOfLines={1}>
              🎙️ Recording mic... {formatTimer(recordingDuration)} (Tap center footer mic to stop)
            </Text>
            <TouchableOpacity onPress={stopListening} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Stop & Send</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Clean Input Footer matching Figma */}
        <View style={styles.inputFooter}>
          <TouchableOpacity style={styles.cameraIconBtn}>
            <MaterialCommunityIcons name="camera-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type in chat..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.chatInput}
          />

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            disabled={!inputText.trim() || loading}
            onPress={() => handleSendQuery(inputText, false)}
          >
            <MaterialCommunityIcons name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  container: {
    flex: 1,
  },
  chatList: {
    paddingVertical: SPACING.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  aiGlobeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  userBubble: {
    backgroundColor: COLORS.chatUserGreen,
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: COLORS.chatAiGreen,
    borderBottomLeftRadius: 2,
  },
  voicePlayerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 6,
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  playBtnCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  voiceProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceTimerText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginRight: 6,
  },
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.white,
    lineHeight: 20,
  },
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  waveWrapper: {
    marginRight: 10,
  },
  recordingText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  cancelBtn: {
    marginLeft: 8,
    padding: 4,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 4,
    marginBottom: SPACING.sm,
  },
  cameraIconBtn: {
    padding: 6,
  },
  chatInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    paddingHorizontal: SPACING.xs,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.textMuted,
  },
});

export default AIAssistantScreen;
