/**
 * InvoicesScreen.tsx - Pantalla 28 Facturas Recibidas (Boceto Excalidraw)
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad: Pantalla 28 del boceto Excalidraw con:
 * - Header: "Facturas" con botones [ ! ] y [ -> ]
 * - Campo: "Buscar factura"
 * - Lista de tarjetas con:
 *   - Cabecera: Fecha | Monto
 *   - Cuerpo: Descripción
 *   - Botón de acción derecho: [ E ] (Emitir / Ver comprobante FEL)
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
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
      <View style={styles.cardContent}>
        {/* Fila superior: Fecha | Monto */}
        <View style={styles.cardTopRow}>
          <Text style={styles.dateText}>{item.issued_date || '14/10/2026'}</Text>
          <Text style={styles.amountText}>Q {item.amount.toFixed(2)}</Text>
        </View>

        {/* Cuerpo: Descripción */}
        <Text style={styles.descLabel}>Descripción</Text>
        <Text style={styles.descContent} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      {/* Botón derecho [ E ] (Excalidraw Pantalla 28) */}
      <TouchableOpacity 
        style={styles.squareActionButton}
        onPress={() => setSelectedInvoice(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.actionLetter}>E</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Facturas" showBack={true} />

      <View style={styles.content}>
        {/* Campo Buscar factura */}
        <View style={styles.searchBox}>
          <Input
            placeholder="Buscar factura"
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
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={44} color="#94A3B8" />
              <Text style={styles.emptyText}>No hay facturas registradas</Text>
            </View>
          }
        />
      </View>

      {/* Modal Visor de Comprobante / Factura */}
      {selectedInvoice && (
        <ModalDialog
          visible={Boolean(selectedInvoice)}
          title={`Factura FEL ${selectedInvoice.invoice_number}`}
          message={`Servicio: ${selectedInvoice.description}\nMonto Total: Q ${selectedInvoice.amount.toFixed(2)}\nFecha de emisión: ${selectedInvoice.issued_date}\nEstado: ${selectedInvoice.status.toUpperCase()}`}
          confirmText="Descargar PDF"
          cancelText="Cerrar"
          onConfirm={() => {
            setSelectedInvoice(null);
            mostrarAlerta('Descarga realizada', 'Se ha guardado el comprobante de la factura en su dispositivo.');
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
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBox: {
    marginBottom: 16,
  },
  listContent: {
    gap: 14,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    marginRight: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  descLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  descContent: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  squareActionButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLetter: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
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
