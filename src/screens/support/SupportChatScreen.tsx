/**
 * SupportChatScreen.tsx - Pantalla 22 Visualización de Chat (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 22 del boceto Excalidraw con:
 * - Header: avatar circular + "Moderación 1" con botones [ ! ] y [ -> ]
 * - Burbujas de chat estilizadas (izquierda entrante, derecha saliente)
 * - Barra inferior: "Escribir mensaje" + botón circular de envío
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  TextInput, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const SupportChatScreen: React.FC<RootStackScreenProps<'ChatSoporte'>> = ({ route, navigation }) => {
  const { supportMessages, sendSupportMessage, user } = useApp();
  const contactName: string = route.params?.contact?.name || 'Moderación 1';

  const [inputText, setInputText] = useState<string>('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendSupportMessage(inputText.trim());
    setInputText('');
  };

  const renderBubble = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_id === user?.id || item.sender_id === 'usr-001';

    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.myBubbleWrapper : styles.otherBubbleWrapper]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.message}
          </Text>
        </View>
        <Text style={styles.timestamp}>{item.created_at || '10:00'}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header title={contactName} showBack={true} />

      <FlatList
        data={supportMessages}
        keyExtractor={item => item.id}
        renderItem={renderBubble}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Barra de entrada: "Escribir mensaje" + botón circular (Excalidraw Pantalla 22) */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Escribir mensaje"
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity 
          style={[styles.circleSendBtn, !inputText.trim() && styles.disabledSendBtn]} 
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RerfColors.background,
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  bubbleWrapper: {
    maxWidth: '82%',
    marginBottom: 4,
  },
  myBubbleWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherBubbleWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  myBubble: {
    backgroundColor: RerfColors.primaryYellow,
    borderColor: RerfColors.primaryYellowHover,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: RerfColors.surfaceCard,
    borderColor: RerfColors.surfaceCardBorder,
    borderBottomLeftRadius: 4,
    ...RerfShadows.card,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  myMessageText: {
    color: RerfColors.primaryYellowText,
  },
  otherMessageText: {
    color: RerfColors.textMain,
  },
  timestamp: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    marginHorizontal: 4,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: RerfColors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: RerfColors.surfaceCardBorder,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 23,
    paddingHorizontal: 16,
    fontSize: 14,
    color: RerfColors.textMain,
    backgroundColor: RerfColors.surfaceSubtle,
  },
  circleSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.card,
  },
  disabledSendBtn: {
    opacity: 0.5,
    backgroundColor: '#E2E8F0',
  },
});
