import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from "expo-speech";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Image, Keyboard, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AudioWave from '../components/AudioWave';
import ScreenWrapper from '../components/ScreenWrapper';
import { CHAT_MESSAGES_INITIAL } from '../constants/mockData';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useVoiceContext } from '../context/VoiceContext';
import { cropService } from '../services/cropService';

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

export const AIAssistantScreen = ({ navigation, route }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState(CHAT_MESSAGES_INITIAL);
  const [inputText, setInputText] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef(null);
  const { isListening, recordingDuration, stopListening, setOnTranscribedCallback } = useVoiceContext();

  // Handle incoming confirmed leaf photo from DiseaseDetectionScreen
  useEffect(() => {
    if (route?.params?.attachedImage) {
      const confirmedPhoto = route.params.attachedImage;
      handleSendQuery(
        { attachedImage: confirmedPhoto, text: 'Analyze attached crop photo for disease diagnosis and treatment' },
        false
      );
    }
  }, [route?.params?.attachedImage]);
   
  useEffect(() => {
      return () => {
          Speech.stop();
      };
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates ? e.endCoordinates.height : 300;
      setKeyboardHeight(height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });


    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const getCurrentLocation = async () => {

      const { status } =
          await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {

          Alert.alert("Location permission denied");

          return null;
      }

      const location =
          await Location.getCurrentPositionAsync({});

      return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
      };

  };
  const handleTakePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Denied',
          'Earthworm AI requires camera access to take leaf photos for crop diagnosis.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false, 
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImageUri(imageUri);
        console.log('[Camera Capture] Captured leaf photo directly:', imageUri);
      }
    } catch (err) {
      console.error('Failed to take camera picture:', err);
      Alert.alert('Camera Error', 'Could not access device camera. Please try again.');
    }
  };

  const speakText = (text) => {
    Speech.stop();

    Speech.speak(text, {
      language: "en-US",
      pitch: 1,
      rate: 0.95,
    });
  };

  const startRecording = async () => {
    try {
      Speech.stop();
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Required", "Microphone permission is required.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);

      console.log("Recording Started...");
    } catch (e) {
      console.log(e);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();

      console.log("Recording saved:", uri);

      setRecording(null);
      setIsRecording(false);

      const formData = new FormData();

      formData.append("audio", {
        uri,
        type: "audio/m4a",
        name: "voice.m4a",
      });

      console.log("Uploading audio...");

      const response = await fetch("http://192.168.137.198:3001/api/stt", {
        method: "POST",
        body: formData,
      });

      console.log("Response received");

      const data = await response.json();
      console.log(data);
      if (data.success) {
        setInputText(data.text);
        await handleSendQuery(data.text, true);
      }

    } catch (e) {
      console.log(e);
    }
  };

  const handleSendQuery = async (queryPayload, isVoice = false) => {
    Speech.stop();
    const textToSend = typeof queryPayload === 'string' ? queryPayload : queryPayload?.text;
    const currentAttachedImage = selectedImageUri || (typeof queryPayload === 'object' ? queryPayload.attachedImage : null);

    if ((!textToSend || !textToSend.trim()) && !currentAttachedImage) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend || 'Analyzing attached crop photo...',
      attachedImage: currentAttachedImage,
      isVoice: isVoice,
      audioUri: typeof queryPayload === 'object' ? queryPayload.audioUri : null,
      durationSeconds: typeof queryPayload === 'object' ? queryPayload.durationSeconds : 3,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSelectedImageUri(null); // Reset attachment preview
    setLoading(true);

    try {
      const location = await getCurrentLocation();
      const currentAttachedImage =
          selectedImageUri ||
          (typeof queryPayload === "object"
              ? queryPayload.attachedImage
              : null);
            const aiReply = await cropService.queryAIAssistant({
                message: textToSend,
                latitude: location?.latitude,
                longitude: location?.longitude,
                imageUri: currentAttachedImage,
            });


            const cleanText = (text) => {
                if (!text) return "";

                return text
                    .replace(/\*\*/g, "")
                    .replace(/\*/g, "")
                    .replace(/#/g, "")
                    .replace(/`/g, "")
                    .trim();
            };


            const cleanedReply = {
                ...aiReply,
                text: cleanText(aiReply.text),
            };


            setMessages((prev) => [...prev, cleanedReply]);

            if (cleanedReply?.text) {
                speakText(cleanedReply.text);
            }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      setOnTranscribedCallback(() => (voicePayload) => {
          handleSendQuery(voicePayload, true);
      });

      return () => {
          setOnTranscribedCallback(null);
      };
  }, [setOnTranscribedCallback]);

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
          {/* Display User Attached Camera Photo in Chat Bubble */}
          {item.attachedImage && (
            <Image source={{ uri: item.attachedImage }} style={styles.chatAttachedImage} resizeMode="cover" />
          )}

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

  const isSendDisabled = (!inputText.trim() && !selectedImageUri) || loading;

  return (
    <ScreenWrapper withPadding={false}>
      <View
        style={[
          styles.mainWrapper,
          {
            paddingBottom: keyboardHeight > 0
              ? (Platform.OS === 'ios' ? keyboardHeight - 20 : keyboardHeight - 10)
              : 8,
          },
        ]}
      >
        {/* Header matching Figma */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Chat Assistant</Text>
        </View>

        {/* Messages List bounded in flex: 1 */}
        <View style={styles.listFlexWrapper}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        </View>

        {/* Animated Sound Wave Recording Banner ("Waving to catch your words") */}
        {isListening && (
          <View style={styles.recordingBanner}>
            <View style={styles.waveWrapper}>
              <AudioWave isListening={isListening} height={18} color={COLORS.accent} />
            </View>
            <Text style={styles.recordingText} numberOfLines={1}>
              🎙️ Recording mic... {formatTimer(recordingDuration)}
            </Text>
            <TouchableOpacity onPress={stopListening} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Stop & Send</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Footer Container */}
        <View style={styles.inputFooterContainer}>
          <View style={styles.inputFooter}>
            {/* Camera Button */}
            <TouchableOpacity style={styles.cameraIconBtn} onPress={handleTakePicture}>
              <MaterialCommunityIcons
                name={selectedImageUri ? 'camera' : 'camera-outline'}
                size={24}
                color={selectedImageUri ? COLORS.primary : COLORS.textSecondary}
              />
            </TouchableOpacity>

            {/* INLINE Photo Attachment Badge */}
            {selectedImageUri && (
              <View style={styles.inlinePhotoTag}>
                <Image source={{ uri: selectedImageUri }} style={styles.inlineThumbnail} />
                <TouchableOpacity onPress={() => setSelectedImageUri(null)} style={styles.inlineCloseBtn}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            )}

            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={selectedImageUri ? 'Add caption...' : 'Type in chat...'}
              placeholderTextColor={COLORS.textMuted}
              style={styles.chatInput}
              multiline={false}
            />
            <TouchableOpacity
                style={styles.micBtn}
                onPress={() => {
                    if (isRecording) {
                        stopRecording();
                    } else {
                        startRecording();
                    }
                }}
            >
                <MaterialCommunityIcons
                    name={isRecording ? "stop-circle" : "microphone"}
                    size={24}
                    color={isRecording ? "#FF3B30" : COLORS.primary}
                />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendBtn, isSendDisabled && styles.sendBtnDisabled]}
              disabled={isSendDisabled}
              onPress={() => handleSendQuery(inputText, false)}
            >
              <MaterialCommunityIcons name="send" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
  },
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
  listFlexWrapper: {
    flex: 1,
  },
  chatList: {
    paddingVertical: SPACING.sm,
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
  chatAttachedImage: {
    width: 180,
    height: 120,
    borderRadius: RADIUS.sm,
    marginBottom: 6,
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
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  waveWrapper: {
    marginRight: 8,
  },
  recordingText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  cancelBtn: {
    marginLeft: 6,
    padding: 2,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  inputFooterContainer: {
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xs + 4,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
    minHeight: 46,
  },
  cameraIconBtn: {
    padding: 4,
  },
  inlinePhotoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C8E6C9',
    borderRadius: RADIUS.full,
    paddingRight: 4,
    marginHorizontal: 4,
  },
  inlineThumbnail: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 2,
  },
  inlineCloseBtn: {
    padding: 2,
  },
  chatInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#1B1B1B', // High contrast dark text
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  micBtn: {
    marginHorizontal: 8,
    padding: 4,
},
});

export default AIAssistantScreen;
