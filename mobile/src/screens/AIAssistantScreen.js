import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Image, Keyboard, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AudioWave from '../components/AudioWave';
import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useVoiceContext } from '../context/VoiceContext';
import { cropService } from '../services/cropService';
import { useAuth } from '../hooks/useAuth';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const CHAT_STORAGE_PREFIX = '@earthworm_ai_chat_history_';

const VoiceNotePlayer = ({ audioUri, durationSeconds = 3 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);
  const handlePlayPause = async () => {
    if (!audioUri) {
      return;
    }
    try {
      if (soundRef.current) {
        const status =
          await soundRef.current.getStatusAsync();
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          return;
        }
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }
      const { sound } =
        await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate(
        (status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            sound.unloadAsync();
            soundRef.current = null;
          }
        }
      );
    } catch (err) {
      console.error(
        'Audio playback error:',
        err
      );
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
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePlayPause}
        style={styles.playBtnCircle}
      >
        <MaterialCommunityIcons
          name={isPlaying ? 'pause' : 'play'}
          size={20}
          color={COLORS.primary}
        />
      </TouchableOpacity>
      <View style={styles.voiceProgressRow}>
        <Text style={styles.voiceTimerText}>
          00:
          {durationSeconds < 10
            ? `0${durationSeconds}`
            : durationSeconds}
        </Text>
        <AudioWave
          isListening={isPlaying}
          height={14}
          color={COLORS.white}
        />
      </View>
    </View>
  );
};

export const AIAssistantScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const userID = user?.id || user?._id || user?.uid || user?.email || null;
  const CHAT_STORAGE_KEY = userID ? `${CHAT_STORAGE_PREFIX}${userID}` : null;
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isChatLoaded, setIsChatLoaded] = useState(false);
  const flatListRef = useRef(null);
  const { isListening, recordingDuration, stopListening, setOnTranscribedCallback } = useVoiceContext();

  useEffect(() => {
    if (!CHAT_STORAGE_KEY) return;
    const loadChatHistory = async () => {
      try {
        console.log('📂 Loading chat history...');
        const savedMessages = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
        if (savedMessages) {
          const parsedMessages =
            JSON.parse(savedMessages);
          if (Array.isArray(parsedMessages)) {
            setMessages(parsedMessages);
            console.log(`✅ Loaded ${parsedMessages.length} messages`);
          }
        } else {
          console.log('ℹ️ No previous chat history found');
        }
      } catch (error) {
        console.error('❌ Failed to load chat history:', error);
      } finally {
        setIsChatLoaded(true);
      }
    };
    loadChatHistory();
  }, []);
  
  useEffect(() => {
    if (!isChatLoaded || !CHAT_STORAGE_KEY) return;
    const saveChatHistory = async () => {
      try {
        await AsyncStorage.setItem(
          CHAT_STORAGE_KEY,
          JSON.stringify(messages)
        );
        console.log(`💾 Chat saved: ${messages.length} messages`);
      } catch (error) {
        console.error('❌ Failed to save chat history:', error);
      }
    };
    saveChatHistory();
  }, [messages, isChatLoaded]);

  const clearChatHistory = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to delete the entire conversation?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(
                CHAT_STORAGE_KEY
              );
              setMessages([]);
              console.log('🗑️ Chat history cleared');
            } catch (error) {
              console.error('❌ Failed to clear chat history:', error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (route?.params?.attachedImage) {
      const confirmedPhoto = route.params.attachedImage;
      handleSendQuery(
        {
          attachedImage: confirmedPhoto,
          text:
            'Analyze attached crop photo for disease diagnosis and treatment',
        },
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
    const hideSubscription = Keyboard.addListener(hideEvent, () => {setKeyboardHeight(0);});
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  const getCurrentLocation = async () => {
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location permission is required to provide location-based farming recommendations.'
        );
        return null;
      }
      const location =
        await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error(
        'Location error:',
        error
      );
      return null;
    }
  };

  const handleTakePicture = async () => {
    try {
      const {status} = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Denied',
          'Earthworm AI requires camera access to take leaf photos for crop diagnosis.',
          [
            {
              text: 'OK',
            },
          ]
        );
        return;
      }
      const result =
        await ImagePicker.launchCameraAsync({allowsEditing: false, quality: 0.8,});
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImageUri(imageUri);
        console.log('[Camera Capture]', imageUri);
      }
    } catch (err) {
      console.error('Failed to take camera picture:', err);
      Alert.alert(
        'Camera Error',
        'Could not access device camera. Please try again.'
      );
    }
  };

  const speakText = (text) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1,
      rate: 0.95,
    });
  };

  const startRecording = async () => {
    try {
      Speech.stop();
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required.'
        );
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const {recording} = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      console.log('🎙️ Recording Started...');
    } catch (e) {
      console.error('Recording start error:', e);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) {
        return;
      }
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('🎙️ Recording saved:', uri);
      setRecording(null);
      setIsRecording(false);
      if (!uri) {
        return;
      }
      const formData =
        new FormData();
      formData.append('audio', {uri, type: 'audio/m4a', name: 'voice.m4a'}
      );
      console.log('📤 Uploading audio...');
      const response = await fetch(`${API_URL}/api/stt`, {method: 'POST', body: formData,});
      console.log('📥 STT response received');
      const data = await response.json();
      console.log('STT:', data);
      if (data.success && data.text) {
        setInputText(data.text);
        await handleSendQuery({text: data.text, audioUri: uri, durationSeconds: 3}, true);
      }
    } catch (e) {
      console.error('❌ Recording error:', e);
      setRecording(null);
      setIsRecording(false);
    }
  };
  const handleSendQuery = async (queryPayload, isVoice = false) => {
    Speech.stop();
    const textToSend =
      typeof queryPayload === 'string' ? queryPayload : queryPayload?.text;
    const attachedImage = selectedImageUri || (typeof queryPayload === 'object' ? queryPayload.attachedImage : null);
    if ((!textToSend || !textToSend.trim()) && !attachedImage) return;
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend || 'Analyzing attached crop photo...',
      attachedImage,
      isVoice,
      audioUri: typeof queryPayload === 'object' ? queryPayload.audioUri : null,
      durationSeconds: typeof queryPayload === 'object' ? queryPayload.durationSeconds : 3,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
    };
    setMessages(
      (prev) => [
        ...prev,
        userMsg,
      ]
    );
    setInputText('');
    setSelectedImageUri(null);
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      const aiReply = await cropService.queryAIAssistant({
          message: textToSend,
          latitude: location?.latitude,
          longitude: location?.longitude,
          imageUri: attachedImage,
        });
      const cleanText = (text) => {
        if (!text) {return '';}
        return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '').replace(/`/g, '').trim();
      };
      const cleanedReply = {
         ...aiReply,
        id: aiReply?.id || `ai-${Date.now()}`,
        sender: 'ai',
        text: cleanText(aiReply?.text),
        timestamp: aiReply?.timestamp || new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      };

      setMessages((prev) => [...prev, cleanedReply]);
      if (cleanedReply?.text) {
        speakText(cleanedReply.text);
      }
    } catch (e) {
      console.error('❌ AI Assistant Error:', e);
      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I could not process your request right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      };
      setMessages((prev) => [...prev, errorMessage,]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setOnTranscribedCallback(() => (voicePayload) => {handleSendQuery(voicePayload, true);});
    return () => {setOnTranscribedCallback(null);};
  }, [setOnTranscribedCallback]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return (`${mins < 10 ? '0' : ''}${mins}:` + `${remainder < 10 ? '0' : ''}${remainder}`);
  };

  const renderMessageItem = ({item}) => {
    const isUser = item.sender === 'user';
    return (
      <View 
        style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}
      >
        {!isUser && (
          <View
            style={styles.aiGlobeBadge}
          >
            <MaterialCommunityIcons
              name="earth"
              size={18}
              color={COLORS.primary}
            />
          </View>
        )}
        <View
          style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}
        >
          {item.attachedImage && (
            <Image
              source={{uri: item.attachedImage}}
              style={styles.chatAttachedImage}
              resizeMode="cover"
            />
          )}
          {item.isVoice && item.audioUri && (
            <View 
              style={{marginBottom: 4}}
            >
              <VoiceNotePlayer
               audioUri={item.audioUri}
                durationSeconds={item.durationSeconds}
              />
            </View>
          )}
          {!!item.text && (
            <Text style={styles.messageText}>{item.text}</Text>
          )}
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
            paddingBottom: keyboardHeight > 0 ? (Platform.OS === 'ios' ? keyboardHeight - 20 : keyboardHeight - 10) : 8,
          },
        ]}
      >
        <View
          style={styles.headerRow}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() =>
              navigation.goBack()
            }
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <Text
            style={styles.headerTitle}
          >
            AI Chat Assistant
          </Text>
          <TouchableOpacity
            style={styles.clearChatBtn}
            onPress={clearChatHistory}
          >
            <MaterialCommunityIcons name="delete-outline" size={22} color={COLORS.danger}/>
          </TouchableOpacity>
        </View>
        <View
          style={styles.listFlexWrapper}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={
              renderMessageItem
            }
            keyExtractor={
              (item) => item.id
            }
            contentContainerStyle={
              styles.chatList
            }
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd(
                {
                  animated: true,
                }
              );
            }}
            ListEmptyComponent={
              <View
                style={
                  styles.emptyChatContainer
                }
              >
                <View
                  style={
                    styles.emptyIconCircle
                  }
                >
                  <MaterialCommunityIcons
                    name="earth"
                    size={32}
                    color={COLORS.primary}
                  />
                </View>
                <Text
                  style={
                    styles.emptyChatTitle
                  }
                >
                  Hello, {user?.name || 'farmer'} 👋
                </Text>
                <Text
                  style={
                    styles.emptyChatText
                  }
                >
                  How can Earthworm AI assist your farm today?
                </Text>
              </View>
            }
          />
        </View>
        {isListening && (
          <View
            style={
              styles.recordingBanner
            }
          >
            <View
              style={
                styles.waveWrapper
              }
            >
              <AudioWave
                isListening={isListening}
                height={18}
                color={COLORS.accent}
              />
            </View>
            <Text
              style={styles.recordingText}
              numberOfLines={1}
            >
              🎙️ Recording mic...
              {' '}
              {formatTimer(recordingDuration)}
            </Text>
            <TouchableOpacity
              onPress={stopListening}
              style={styles.cancelBtn}
            >
              <Text
                style={styles.cancelText}
              >
                Stop & Send
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View
          style={styles.inputFooterContainer}
        >
          <View
            style={styles.inputFooter}
          >
            <TouchableOpacity
              style={styles.cameraIconBtn}
              onPress={handleTakePicture}
            >
              <MaterialCommunityIcons
                name={
                  selectedImageUri
                    ? 'camera'
                    : 'camera-outline'
                }
                size={24}
                color={
                  selectedImageUri
                    ? COLORS.primary
                    : COLORS.textSecondary
                }
              />
            </TouchableOpacity>
            {selectedImageUri && (
              <View
                style={styles.inlinePhotoTag}
              >
              <Image
                source={{uri: selectedImageUri}}
                style={styles.inlineThumbnail}
              />
              <TouchableOpacity
                onPress={() => setSelectedImageUri(null)}
                  style={styles.inlineCloseBtn}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={16}
                    color={
                      COLORS.danger
                    }
                  />
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
                name={
                  isRecording
                    ? 'stop-circle'
                    : 'microphone'
                }
                size={24}
                color={
                  isRecording
                    ? '#FF3B30'
                    : COLORS.primary
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sendBtn,
                isSendDisabled &&
                  styles.sendBtnDisabled,
              ]}
              disabled={
                isSendDisabled
              }
              onPress={() =>
                handleSendQuery(
                  inputText,
                  false
                )
              }
            >
              <MaterialCommunityIcons
                name="send"
                size={18}
                color={
                  COLORS.white
                }
              />
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

    paddingHorizontal:
      SPACING.md,

    backgroundColor:
      COLORS.background,

  },


  /* HEADER */

  headerRow: {

    flexDirection: 'row',

    alignItems: 'center',

    paddingVertical:
      SPACING.sm,

  },


  backBtn: {

    padding: 4,

    marginRight: 8,

  },


  headerTitle: {

    flex: 1,

    fontSize:
      TYPOGRAPHY.fontSize.lg,

    fontWeight:
      TYPOGRAPHY.fontWeight.bold,

    color:
      COLORS.text,

  },


  clearChatBtn: {

    padding: 6,

  },


  /* CHAT */

  listFlexWrapper: {

    flex: 1,

  },


  chatList: {

    paddingVertical:
      SPACING.sm,

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

    backgroundColor:
      COLORS.primaryLight,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 6,

    marginBottom: 4,

  },


  bubble: {

    maxWidth: '78%',

    paddingHorizontal:
      SPACING.md,

    paddingVertical:
      SPACING.sm + 2,

    borderRadius:
      RADIUS.md,

  },


  userBubble: {

    backgroundColor:
      COLORS.chatUserGreen,

    borderBottomRightRadius: 2,

  },


  aiBubble: {

    backgroundColor:
      COLORS.chatAiGreen,

    borderBottomLeftRadius: 2,

  },


  chatAttachedImage: {

    width: 180,

    height: 120,

    borderRadius:
      RADIUS.sm,

    marginBottom: 6,

  },


  messageText: {

    fontSize:
      TYPOGRAPHY.fontSize.sm,

    color:
      COLORS.white,

    lineHeight: 20,

  },


  /* EMPTY CHAT */

  emptyChatContainer: {

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 30,

    marginTop: 100,

  },


  emptyIconCircle: {

    width: 64,

    height: 64,

    borderRadius: 32,

    backgroundColor:
      COLORS.primaryLight,

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 12,

  },


  emptyChatTitle: {

    fontSize:
      TYPOGRAPHY.fontSize.lg,

    fontWeight:
      TYPOGRAPHY.fontWeight.bold,

    color:
      COLORS.text,

    marginBottom: 6,

  },


  emptyChatText: {

    fontSize:
      TYPOGRAPHY.fontSize.sm,

    color:
      COLORS.textSecondary,

    textAlign: 'center',

    lineHeight: 20,

  },


  /* VOICE PLAYER */

  voicePlayerBox: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor:
      'rgba(255, 255, 255, 0.15)',

    padding: 6,

    borderRadius:
      RADIUS.sm,

    marginBottom: 4,

  },


  playBtnCircle: {

    width: 28,

    height: 28,

    borderRadius: 14,

    backgroundColor:
      COLORS.white,

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

    fontWeight:
      TYPOGRAPHY.fontWeight.bold,

    marginRight: 6,

  },


  /* RECORDING */

  recordingBanner: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor:
      COLORS.primaryDark,

    paddingHorizontal:
      SPACING.sm,

    paddingVertical: 6,

    borderRadius:
      RADIUS.sm,

    marginBottom: 4,

  },


  waveWrapper: {

    marginRight: 8,

  },


  recordingText: {

    flex: 1,

    fontSize:
      TYPOGRAPHY.fontSize.xs,

    color:
      COLORS.white,

    fontWeight:
      TYPOGRAPHY.fontWeight.semibold,

  },


  cancelBtn: {

    marginLeft: 6,

    padding: 2,

  },


  cancelText: {

    fontSize:
      TYPOGRAPHY.fontSize.xs,

    color:
      COLORS.accent,

    fontWeight:
      TYPOGRAPHY.fontWeight.bold,

  },


  /* INPUT */

  inputFooterContainer: {

    paddingVertical:
      SPACING.xs,

    backgroundColor:
      COLORS.background,

  },


  inputFooter: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor:
      COLORS.surfaceVariant,

    borderRadius:
      RADIUS.full,

    paddingHorizontal:
      SPACING.xs + 4,

    paddingVertical:
      Platform.OS === 'ios'
        ? 6
        : 4,

    minHeight: 46,

  },


  cameraIconBtn: {

    padding: 4,

  },


  inlinePhotoTag: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor:
      '#C8E6C9',

    borderRadius:
      RADIUS.full,

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

    fontSize:
      TYPOGRAPHY.fontSize.sm,

    color:
      '#1B1B1B',

    paddingHorizontal:
      SPACING.xs + 2,

    paddingVertical: 4,

  },


  micBtn: {

    marginHorizontal: 8,

    padding: 4,

  },


  sendBtn: {

    width: 36,

    height: 36,

    borderRadius: 18,

    backgroundColor:
      COLORS.primary,

    alignItems: 'center',

    justifyContent: 'center',

  },


  sendBtnDisabled: {

    backgroundColor:
      COLORS.textMuted,

  },

});


export default AIAssistantScreen;