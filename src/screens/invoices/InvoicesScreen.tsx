import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { ModalDialog } from '../../components/ModalDialog';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { RootStackScreenProps } from '../../types/navigation';
import { mostrarAlerta } from '../../utils/alerts';

export const InvoicesScreen: React.FC<RootStackScreenProps<'Facturas'>> = ({ navigation }) => {
  const { invoices } = useApp();
  const [search, setSearch] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.codeRow}>
          <Ionicons name="document-text" size={20} color="#2563EB" />
          <Text style={styles.codeText}>{item.invoice_number}</Text>
        </View>

        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'pagado' ? '#D1FAE5' : '#FEF3C7' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'pagado' ? '#065F46' : '#B45309' }
          ]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.desc}>{item.description}</Text>
      
      <View style={styles.metaRow}>
        <Text style={styles.date}>Emisión: {item.issued_date}</Text>
        <Text style={styles.paymentMethod}>Pago: {item.payment_method}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
        
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => setSelectedInvoice(item)}
        >
          <Ionicons name="eye-outline" size={16} color="#2563EB" />
          <Text style={styles.viewBtnText}>Ver Comprobante</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Listado de Facturas" showBack={true} />

      <View style={styles.searchBar}>
        <Input
          placeholder="Buscar factura por folio o descripción..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Ionicons name="search-outline" size={18} color="#64748B" />}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderInvoice}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No hay facturas registradas</Text>
          </View>
        }
      />

      {/* Modal visor de factura */}
      {selectedInvoice && (
        <ModalDialog
          visible={Boolean(selectedInvoice)}
          title={`Factura ${selectedInvoice.invoice_number}`}
          message={`Servicio: ${selectedInvoice.description}\nMonto Total: $${selectedInvoice.amount.toFixed(2)}\nFecha: ${selectedInvoice.issued_date}\nEstado: ${selectedInvoice.status.toUpperCase()}`}
          iconName="document-text-outline"
          iconColor="#2563EB"
          confirmText="Descargar PDF"
          cancelText="Cerrar"
          onConfirm={() => {
            setSelectedInvoice(null);
            mostrarAlerta('Descarga simulada', 'Se ha guardado el comprobante en tu dispositivo.');
          }}
          onCancel={() => setSelectedInvoice(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  date: {
    fontSize: 11,
    color: '#94A3B8',
  },
  paymentMethod: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
