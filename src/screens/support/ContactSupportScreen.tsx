import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { MOCK_SUPPORT_CONTACTS } from '../../services/mockData';
import { MainTabCompositeScreenProps } from '../../types/navigation';

export const ContactSupportScreen: React.FC<MainTabCompositeScreenProps<'ContactoTab'>> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Apartado de Contacto" rightIcon="help-circle-outline" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner IA Chatbot Card */}
        <TouchableOpacity 
          style={styles.aiCard}
          onPress={() => navigation.navigate('ChatIA')}
          activeOpacity={0.85}
        >
          <View style={styles.aiIconHolder}>
            <Ionicons name="sparkles" size={28} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.aiTag}>
              <Text style={styles.aiTagText}>ASISTENTE 24/7</Text>
            </View>
            <Text style={styles.aiTitle}>Chat con Inteligencia Artificial</Text>
            <Text style={styles.aiDesc}>Pregunta por tus envíos, tarifas o resuelve dudas al instante.</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Moderadores y Equipo de Soporte Humano (Excalidraw Pantalla 21) */}
        <Text style={styles.sectionHeading}>Moderadores y Soporte en Línea</Text>

        <View style={styles.contactList}>
          {MOCK_SUPPORT_CONTACTS.map((contact: typeof MOCK_SUPPORT_CONTACTS[number]) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactCard}
              onPress={() => navigation.navigate('ChatSoporte', { contact })}
              activeOpacity={0.7}
            >
              <View style={styles.avatarHolder}>
                <Image source={{ uri: contact.avatar }} style={styles.avatar} />
                <View style={[styles.onlineDot, { backgroundColor: contact.status === 'En línea' ? '#10B981' : '#F59E0B' }]} />
              </View>

              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRole}>{contact.role}</Text>
                <Text style={[styles.contactStatus, { color: contact.status === 'En línea' ? '#059669' : '#D97706' }]}>
                  ● {contact.status}
                </Text>
              </View>

              <View style={styles.chatAction}>
                <Ionicons name="chatbubble-outline" size={20} color="#2563EB" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.channelsCard}>
          <Text style={styles.channelsTitle}>Otros Canales de Atención</Text>
          <View style={styles.channelRow}>
            <Ionicons name="call-outline" size={18} color="#2563EB" />
            <Text style={styles.channelText}>Línea directa: +52 (55) 800-RERF-00</Text>
          </View>
          <View style={styles.channelRow}>
            <Ionicons name="mail-outline" size={18} color="#2563EB" />
            <Text style={styles.channelText}>Correo: soporte@rerflogistics.com</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  aiCard: {
    backgroundColor: '#6D28D9',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
    shadowColor: '#6D28D9',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  aiIconHolder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  aiTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiDesc: {
    fontSize: 12,
    color: '#E9D5FF',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  contactList: {
    gap: 12,
    marginBottom: 20,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  avatarHolder: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  contactRole: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  contactStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  chatAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  channelsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  channelText: {
    fontSize: 12,
    color: '#475569',
  },
});
