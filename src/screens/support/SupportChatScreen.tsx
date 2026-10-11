/**
 * SupportChatScreen.tsx - Pantalla 22 Visualización de Chat (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 22 del boceto Excalidraw con:
 * - Soporte Privado 1 a 1:
 *   - Cliente: Canal oficial y directo con Administración RerF.
 *   - Administrador: Chat individual con cada cliente para resolver sus dudas específicas.
 * - Header: Botón de retorno [ < ] + Nombre del contacto/canal.
 * - Burbujas estilizadas según rol (Admin vs Cliente).
 * - Barra inferior: "Escribir mensaje" + botón circular de envío con ajuste perfecto de teclado y auto-scroll.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  TextInput, 
  TouchableOpacity,
  Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { RerfColors, RerfShadows } from '../../constants/theme';

export const SupportChatScreen: React.FC<RootStackScreenProps<'ChatSoporte'>> = ({ route, navigation }) => {
  const { supportMessages, sendSupportMessage, user } = useApp();
  const contactId: string = route.params?.contact?.id || 'usr-001';
  const contactName: string = route.params?.contact?.name || 'Soporte y Atención';
  const contactRole: string = route.params?.contact?.role || 'Línea de soporte y atención';

  const isAdmin = user?.role === 'admin';
  const [inputText, setInputText] = useState<string>('');
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);

  // Filtrar mensajes específicos de esta conversación 1-a-1
  const conversationMessages = useMemo(() => {
    if (isAdmin) {
      // El administrador ve los mensajes intercambiados con este cliente específico
      return supportMessages.filter(m => 
        m.client_id === contactId || 
        m.sender_id === contactId || 
        m.receiver_id === contactId ||
        (m.client_name && contactName && m.client_name.toLowerCase() === contactName.toLowerCase())
      );
    } else {
      // El cliente ve sus propios mensajes con el soporte
      const myId = user?.id || 'usr-001';
      return supportMessages.filter(m => 
        m.client_id === myId || 
        m.sender_id === myId || 
        m.receiver_id === myId
      );
    }
  }, [supportMessages, contactId, contactName, isAdmin, user?.id]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const hideListener = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [conversationMessages.length]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    await sendSupportMessage(textToSend, contactId, contactName);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderBubble = ({ item }: { item: ChatMessage }) => {
    // Si el usuario actual es admin: sus respuestas (o mensajes marcados is_support) son suyos (derecha)
    // Si el usuario actual es cliente: sus propios mensajes son suyos (derecha)
    const isMe = isAdmin 
      ? (item.sender_id === user?.id || item.is_support)
      : (!item.is_support && item.sender_id === user?.id);

    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.myBubbleWrapper : styles.otherBubbleWrapper]}>
        {!isMe && (
          <Text style={styles.senderNameLabel}>
            {item.is_support ? '🛡️ Soporte RerF' : `👤 ${item.sender_name || contactName || 'Cliente'}`}
          </Text>
        )}
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
      style={[
        styles.container,
        Platform.OS === 'android' && keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : null
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header title={isAdmin ? contactName : "Soporte RerF"} showBack={true} />

      {/* Banner identificador de canal y privacidad */}
      <View style={[styles.channelBadgeRow, isAdmin && styles.channelBadgeRowAdmin]}>
        <Ionicons 
          name={isAdmin ? "shield-checkmark" : "lock-closed"} 
          size={14} 
          color={isAdmin ? "#0284C7" : RerfColors.logisticsBlue} 
        />
        <Text style={[styles.channelBadgeText, isAdmin && styles.channelBadgeTextAdmin]} numberOfLines={1}>
          {isAdmin 
            ? `Modo Administrador • Chat con ${contactName} (${contactRole})` 
            : "Chat oficial y privado con Administración RERF"}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={conversationMessages}
        keyExtractor={item => item.id}
        renderItem={renderBubble}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Conversación Iniciada</Text>
            <Text style={styles.emptySubtitle}>
              {isAdmin 
                ? `Envía un mensaje para responder a ${contactName}.` 
                : 'Escribe tu consulta y un asesor te atenderá a la brevedad.'}
            </Text>
          </View>
        }
      />

      {/* Barra de entrada: "Escribir mensaje" + botón circular (Excalidraw Pantalla 22) */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder={isAdmin ? `Responder a ${contactName}...` : "Escribir a Soporte RerF..."}
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          returnKeyType="send"
          onSubmitEditing={handleSend}
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
  channelBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: RerfColors.surfaceSubtle,
    borderBottomWidth: 1,
    borderBottomColor: RerfColors.surfaceCardBorder,
  },
  channelBadgeRowAdmin: {
    backgroundColor: '#F0F9FF',
    borderBottomColor: '#BAE6FD',
  },
  channelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: RerfColors.textMuted,
    flex: 1,
  },
  channelBadgeTextAdmin: {
    color: '#0369A1',
    fontWeight: '800',
  },
  messagesList: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: RerfColors.textMain,
  },
  emptySubtitle: {
    fontSize: 12,
    color: RerfColors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 18,
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
  senderNameLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: RerfColors.textMuted,
    marginBottom: 3,
    marginLeft: 4,
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
    color: RerfColors.textMuted,
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: RerfColors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: RerfColors.surfaceCardBorder,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: RerfColors.background,
    borderWidth: 1,
    borderColor: RerfColors.surfaceCardBorder,
    borderRadius: 23,
    paddingHorizontal: 18,
    fontSize: 14,
    color: RerfColors.textMain,
  },
  circleSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: RerfColors.primaryYellow,
    borderWidth: 1,
    borderColor: RerfColors.primaryYellowHover,
    justifyContent: 'center',
    alignItems: 'center',
    ...RerfShadows.cardHover,
  },
  disabledSendBtn: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
    opacity: 0.6,
  },
});
