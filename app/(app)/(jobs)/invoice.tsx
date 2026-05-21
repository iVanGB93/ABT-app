import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useSelector } from 'react-redux';

import { RootState, useAppDispatch } from '@/app/(redux)/store';
import { setInvoice, setCharges } from '@/app/(redux)/jobSlice';
import { ThemedView } from '@/components/ThemedView';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { ThemedText } from '@/components/ThemedText';
import { useJobInvoice } from '@/hooks';
import { useRouter } from 'expo-router';
import { commonStyles } from '@/constants/commonStyles';
import { commonStylesDetails } from '@/constants/commonStylesDetails';
import { Ionicons } from '@expo/vector-icons';
import { generatePremiumInvoiceHTML } from '@/constants/invoiceTemplates';
import { darkThirdColor, lightMainColor } from '@/settings';

export default function Invoice() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { client } = useSelector((state: RootState) => state.client);
  const { job } = useSelector((state: RootState) => state.job);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  const {
    invoice,
    charges,
    loading,
    error,
    refresh: refreshInvoice,
  } = useJobInvoice(job?.id || null);

  useEffect(() => {
    if (invoice) dispatch(setInvoice(invoice));
    if (charges) dispatch(setCharges(charges));
  }, [invoice, charges, dispatch]);

  const getBase64FromUrl = async (url: string): Promise<string> => {
    if (!url) return '';
    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        FileSystem.cacheDirectory + 'temp_logo.jpg',
      );
      const downloadResult = await downloadResumable.downloadAsync();
      if (!downloadResult || !downloadResult.uri) return '';
      const base64 = await FileSystem.readAsStringAsync(downloadResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch {
      return '';
    }
  };

  const createAndSendInvoice = async () => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
      return;
    }
    setGenerating(true);
    try {
      const base64Image = await getBase64FromUrl(business.logo);
      const htmlContent = generatePremiumInvoiceHTML(invoice, charges, business, client, base64Image);
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const safeName = `${business.name}_Invoice_${invoice.number}.pdf`.replace(/[^a-zA-Z0-9._-]/g, '_');
      const newFileUri = FileSystem.documentDirectory + safeName;
      await FileSystem.moveAsync({ from: uri, to: newFileUri });
      await Sharing.shareAsync(newFileUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Invoice #${invoice.number}`,
        UTI: 'com.adobe.pdf',
      });
      await FileSystem.deleteAsync(newFileUri, { idempotent: true });
    } catch (err: any) {
      console.error('Error generating invoice PDF:', err);
      Alert.alert('Error', err?.message || 'Failed to generate invoice. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      <ThemedView style={commonStyles.tabHeader}>
        <TouchableOpacity onPress={() => router.navigate('/(app)/(jobs)/jobDetails')}>
          <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Invoice Details</ThemedText>
        <TouchableOpacity onPress={() => refreshInvoice()}>
          <Ionicons name="refresh" size={22} color={color} />
        </TouchableOpacity>
      </ThemedView>

      {loading ? (
        <ActivityIndicator style={commonStyles.loading} color={color} size="large" />
      ) : invoice ? (
        <ThemedView style={[commonStylesDetails.container, { paddingHorizontal: 0 }]}>
          <ScrollView>
            <ThemedSecondaryView style={styles.invoice}>

              {/* Header */}
              <View style={styles.header}>
                <ThemedText style={styles.bussinessname}>{business.name}</ThemedText>
                <View style={[styles.divider, { backgroundColor: color }]} />
                <View style={styles.invoiceRow}>
                  <ThemedText style={styles.invoiceTitle}>Invoice #{invoice.number}</ThemedText>
                  <ThemedText style={styles.data}>{formatDate(new Date(invoice.date))}</ThemedText>
                </View>
              </View>

              {/* Bill to */}
              <View style={styles.details}>
                <ThemedText style={styles.bold}>Bill to:</ThemedText>
                <ThemedText style={styles.data}>{client.name}{client.last_name ? ` ${client.last_name}` : ''}</ThemedText>
                {client.email ? (
                  <View style={styles.clientRow}>
                    <Ionicons name="mail-outline" size={13} color={color} style={styles.clientIcon} />
                    <ThemedText style={styles.data}>{client.email}</ThemedText>
                  </View>
                ) : null}
                {client.phone ? (
                  <View style={styles.clientRow}>
                    <Ionicons name="call-outline" size={13} color={color} style={styles.clientIcon} />
                    <ThemedText style={styles.data}>{client.phone}</ThemedText>
                  </View>
                ) : null}
                {client.address ? (
                  <View style={styles.clientRow}>
                    <Ionicons name="location-outline" size={13} color={color} style={styles.clientIcon} />
                    <ThemedText style={styles.data}>{client.address}</ThemedText>
                  </View>
                ) : null}
              </View>

              {/* Charges table */}
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <ThemedText style={[styles.tableHeader, { flex: 1 }]}>Description</ThemedText>
                  <ThemedText style={[styles.tableHeader, { textAlign: 'right' }]}>Amount</ThemedText>
                </View>
                {charges && charges.length > 0 ? (
                  charges.map((item: { description: string; amount: any }, index: number) => (
                    <View style={styles.tableRow} key={index}>
                      <ThemedText style={{ flex: 1 }}>{item.description}</ThemedText>
                      <ThemedText style={{ textAlign: 'right', fontWeight: '600' }}>
                        ${parseFloat(item.amount || 0).toFixed(2)}
                      </ThemedText>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRow}>
                    <ThemedText>No charges created.</ThemedText>
                    <ThemedText>$0.00</ThemedText>
                  </View>
                )}
              </View>

              {/* Totals */}
              <View style={styles.footer}>
                <View style={styles.totalRow}>
                  <ThemedText style={styles.totalLabel}>Total:</ThemedText>
                  <ThemedText style={styles.totalValue}>${parseFloat(invoice.total || 0).toFixed(2)}</ThemedText>
                </View>
                <View style={styles.totalRow}>
                  <ThemedText style={styles.totalLabel}>Paid:</ThemedText>
                  <ThemedText style={[styles.totalValue, { color: '#22c55e' }]}>
                    ${parseFloat(invoice.paid || 0).toFixed(2)}
                  </ThemedText>
                </View>
                <View style={[styles.totalRow, styles.dueRow, { borderTopColor: color }]}>
                  <ThemedText style={[styles.totalLabel, { fontWeight: 'bold', fontSize: 16 }]}>
                    Balance Due:
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.totalValue,
                      {
                        fontWeight: 'bold',
                        fontSize: 16,
                        color: parseFloat(invoice.due || 0) <= 0 ? '#22c55e' : '#ef4444',
                      },
                    ]}
                  >
                    ${parseFloat(invoice.due || 0).toFixed(2)}
                  </ThemedText>
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.buttonRow}>
                {!invoice.closed && (
                  <TouchableOpacity
                    style={[
                      commonStyles.button,
                      { borderColor: color, backgroundColor: darkTheme ? darkThirdColor : lightMainColor },
                    ]}
                    onPress={() => router.navigate('/(app)/(jobs)/invoiceUpdate')}
                  >
                    <ThemedText>Change</ThemedText>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    commonStyles.button,
                    styles.sendButton,
                    { borderColor: color, backgroundColor: darkTheme ? darkThirdColor : lightMainColor, opacity: generating ? 0.6 : 1 },
                  ]}
                  onPress={createAndSendInvoice}
                  disabled={generating}
                >
                  {generating ? (
                    <ActivityIndicator size="small" color={color} />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="share-outline" size={16} color={color} />
                      <ThemedText>Send Invoice</ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

            </ThemedSecondaryView>
          </ScrollView>
        </ThemedView>
      ) : (
        <ThemedView style={commonStyles.containerCentered}>
          <ThemedText style={[styles.invoiceTitle, { textAlign: 'center', marginBottom: 20 }]}>
            {error || 'No invoice found for this job.'}
          </ThemedText>
          <TouchableOpacity
            style={[
              commonStyles.button,
              { borderColor: color, backgroundColor: darkTheme ? darkThirdColor : lightMainColor },
            ]}
            onPress={() => router.navigate('/(app)/(jobs)/invoiceCreate')}
          >
            <ThemedText>Create Invoice</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  invoice: {
    margin: 10,
    borderRadius: 15,
    padding: 14,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    paddingBottom: 12,
  },
  bussinessname: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  divider: {
    height: 3,
    borderRadius: 2,
    width: 40,
    marginBottom: 8,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  data: {
    fontSize: 14,
    marginTop: 2,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  clientIcon: {
    marginRight: 5,
    opacity: 0.7,
  },
  table: {
    marginVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  tableHeaderRow: {
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeader: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  dueRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  sendButton: {
    width: 130,
  },
});