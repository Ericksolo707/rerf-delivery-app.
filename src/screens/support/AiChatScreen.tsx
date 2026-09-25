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
    '¿Cuál es el estado de mi envío?',
    '¿Cuánto cuesta un flete en Guatemala?',
    '¿Cuál es la cobertura nacional?',
    '¿Cómo solicito espacio en bodega?',
    'Protocolo para envíos frágiles',
    'Opciones de pago y facturación SAT',
  ];

  const renderBubble = ({ item }: { item: ChatMessage }) => {
    const isBot = item.is_bot;

    return (
      <View style={[styles.bubbleWrapper, isBot ? styles.botBubbleWrapper : styles.userBubbleWrapper]}>
        {isBot && (
          <View style={styles.botBadge}>
            <Ionicons name="sparkles" size={14} color="#7C3AED" />
            <Text style={styles.botName}>Asistente Inteligente RerF</Text>
          </View>
        )}

        <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
          <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>
            {item.message}
          </Text>
        </View>

        <Text style={styles.time}>{item.created_at}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header title="Chat IA Logística" showBack={true} rightIcon="sparkles" />

      <FlatList
        data={aiMessages}
        keyExtractor={item => item.id}
        renderItem={renderBubble}
        contentContainerStyle={styles.list}
      />

      {/* Sugerencias Rápidas con Scroll Horizontal */}
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

      {/* Input bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Pregúntale a la IA sobre envíos o paquetes..."
          placeholderTextColor="#94A3B8"
          value={input}
          onChangeText={setInput}
        />

        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  list: {
    padding: 16,
    gap: 14,
  },
  bubbleWrapper: {
    maxWidth: '85%',
  },
  botBubbleWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  userBubbleWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  botBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    marginLeft: 4,
  },
  botName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  botBubble: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botText: {
    color: '#3B0764',
  },
  userText: {
    color: '#FFFFFF',
  },
  time: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    marginHorizontal: 4,
  },
  quickPromptsBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  promptChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  promptChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
