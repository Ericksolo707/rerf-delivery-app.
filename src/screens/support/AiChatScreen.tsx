/**
 * AiChatScreen.tsx - Pantalla 23 Visualización de Chat IA (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 23 del boceto Excalidraw con:
 * - Header: "Chat IA" con botones [ ! ] y [ -> ]
 * - Burbujas de interacción inteligente sobre guías, estados y logística RerF
 * - Sugerencias rápidas ("Quiero ver mi último envío", etc.)
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
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { RootStackScreenProps, MainTabCompositeScreenProps } from '../../types/navigation';
import { RerfColors } from '../../constants/theme';

type AiChatScreenProps = Partial<RootStackScreenProps<'ChatIA'>> & Partial<MainTabCompositeScreenProps<'ChatTab'>>;

export const AiChatScreen: React.FC<AiChatScreenProps> = () => {
  const { aiMessages, sendAiMessage } = useApp();
  const [input, setInput] = useState<string>('');

  const handleSend = () => {
    if (!input.trim()) return;
    sendAiMessage(input.trim());
    setInput('');
  };

  const quickPrompts = [
    'Quiero ver mi último envío',
    '¿Cuál es el costo estimado por libra?',
    '¿Cómo funciona el almacenaje en bodega?',
  ];

  const renderBubble = ({ item }: { item: ChatMessage }) => {
    const isBot = item.is_bot;

    return (
      <View style={[styles.bubbleWrapper, isBot ? styles.botBubbleWrapper : styles.userBubbleWrapper]}>
        <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
          <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>
            {item.message}
          </Text>
        </View>
        <Text style={styles.time}>{item.created_at || '10:00'}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header title="Chat IA" showBack={true} />

      <FlatList
        data={aiMessages}
        keyExtractor={item => item.id}
        renderItem={renderBubble}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Sugerencias Rápidas estilo Excalidraw */}
      <View style={styles.quickPromptsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
          {quickPrompts.map((prompt, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.promptChip}
              onPress={() => sendAiMessage(prompt)}
              activeOpacity={0.7}
            >
              <Text style={styles.promptChipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Barra de entrada: "Escribir mensaje" + botón circular */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribir mensaje"
          placeholderTextColor="#94A3B8"
          value={input}
          onChangeText={setInput}
        />

        <TouchableOpacity
          style={[styles.circleSendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim()}
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
    backgroundColor: '#FFFFFF',
  },
  list: {
    padding: 16,
    gap: 14,
  },
  bubbleWrapper: {
    maxWidth: '85%',
    marginBottom: 4,
  },
  botBubbleWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  userBubbleWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#F8FAFC',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#0F172A',
  },
  botText: {
    color: '#0F172A',
  },
  userText: {
    color: '#0F172A',
  },
  time: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    marginHorizontal: 4,
  },
  quickPromptsBar: {
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  promptChip: {
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#0F172A',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    borderRadius: 23,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  circleSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: RerfColors.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#E2E8F0',
  },
});
