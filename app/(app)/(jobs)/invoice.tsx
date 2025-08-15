import React, { useState, useEffect } from 'react';
import {
  View,
  Button,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useSelector } from 'react-redux';

import { RootState, useAppDispatch } from '@/app/(redux)/store';
//import { SENDGRID_API_KEY } from '@env';
import { setInvoice, setCharges } from '@/app/(redux)/jobSlice';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useJobInvoice } from '@/hooks';
import {
  darkSecondColor,
  lightSecondColor,
  darkMainColor,
  darkThirdColor,
  lightMainColor,
} from '@/settings';
import { useRouter } from 'expo-router';
import { ThemedSecondaryView } from '@/components/ThemedSecondaryView';
import { StatusBar } from 'expo-status-bar';
import { commonStyles } from '@/constants/commonStyles';
import { Ionicons } from '@expo/vector-icons';

export default function Invoice() {
  const { color, darkTheme, business } = useSelector((state: RootState) => state.settings);
  const { client, clients } = useSelector((state: RootState) => state.client);
  const { job } = useSelector((state: RootState) => state.job);
  const [modalVisibleInvoice, setModalVisibleInvoice] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { invoice, charges, loading, error, refresh: refreshInvoice } = useJobInvoice(job?.id || null);

  // Data is loaded automatically by the useJobInvoice hook

  useEffect(() => {
    // Update Redux store when invoice data changes
    if (invoice) {
      dispatch(setInvoice(invoice));
    }
    if (charges) {
      dispatch(setCharges(charges));
    }
  }, [invoice, charges, dispatch]);

  const convertImageToBase64 = async (uri: any) => {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    return `data:image/jpeg;base64,${base64}`;
  };

  const getBase64FromUrl = async (url: string) => {
    try {
      // Descarga la imagen remota a un archivo local temporal
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        FileSystem.cacheDirectory + 'temp_logo.jpg',
      );
      const downloadResult = await downloadResumable.downloadAsync();
      if (!downloadResult || !downloadResult.uri) {
        throw new Error('Failed to download image or get URI');
      }
      // Convierte el archivo local a base64
      const base64 = await FileSystem.readAsStringAsync(downloadResult.uri, { encoding: 'base64' });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error downloading or converting image:', error);
      return ''; // O usa un logo por defecto local
    }
  };

  const generateHTML = (base64Image: any) => `
  <html>
    <head>
      <meta charset="UTF-8" />
      <link href="https://fonts.googleapis.com/css?family=Montserrat:700,400|Roboto:400,500&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Roboto', 'Montserrat', Arial, sans-serif;
          background: #f7f8fa;
          margin: 0;
          padding: 0;
          color: #222;
        }
        .container {
          max-width: 800px;
          margin: 40px auto;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(60,60,120,0.12);
          overflow: hidden;
          padding: 0 0 32px 0;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(90deg, #4f8cff 0%, #6ed6ff 100%);
          padding: 32px 32px 24px 32px;
          border-bottom-left-radius: 32px;
          border-bottom-right-radius: 32px;
        }
        .logo {
          width: 90px;
          height: 90px;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          object-fit: contain;
        }
        .business-info {
          text-align: right;
          color: #fff;
        }
        .business-info .name {
          font-family: 'Montserrat', Arial, sans-serif;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .business-info .details {
          font-size: 1rem;
          font-weight: 400;
          margin-bottom: 2px;
        }
        .invoice-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-top: 12px;
          letter-spacing: 1px;
        }
        .invoice-number {
          font-size: 1rem;
          font-weight: 500;
          margin-top: 4px;
        }
        .date {
          font-size: 0.95rem;
          margin-top: 2px;
          opacity: 0.85;
        }
        .details-section {
          display: flex;
          justify-content: space-between;
          background: #f2f6fc;
          padding: 24px 32px;
          border-radius: 0 0 18px 18px;
          margin-bottom: 24px;
        }
        .bill-to {
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 8px;
          color: #4f8cff;
        }
        .client-info {
          font-size: 1rem;
          color: #222;
        }
        .table-section {
          padding: 0 32px;
        }
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 12px;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        th, td {
          padding: 14px 12px;
          text-align: left;
        }
        th {
          background: #eaf3ff;
          color: #4f8cff;
          font-weight: 700;
          font-size: 1rem;
          border-bottom: 2px solid #dbeafe;
        }
        tr {
          transition: background 0.2s;
        }
        tr:nth-child(even) {
          background: #f7f8fa;
        }
        td.right {
          text-align: right;
          font-weight: 500;
        }
        .footer-section {
          padding: 24px 32px;
          background: #f2f6fc;
          border-radius: 18px;
          margin: 32px 32px 0 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 1.1rem;
          margin-bottom: 8px;
        }
        .summary-label {
          color: #4f8cff;
          font-weight: 700;
        }
        .summary-value {
          font-weight: 700;
        }
        .pay-btn {
          display: inline-block;
          margin-top: 18px;
          padding: 12px 32px;
          background: linear-gradient(90deg, #4f8cff 0%, #6ed6ff 100%);
          color: #fff;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 8px;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: background 0.2s;
        }
        .pay-btn:hover {
          background: linear-gradient(90deg, #6ed6ff 0%, #4f8cff 100%);
        }
        .qr-section {
          margin-top: 18px;
          text-align: center;
        }
        .qr-label {
          font-size: 0.95rem;
          color: #4f8cff;
          margin-bottom: 6px;
          display: block;
        }
        .qr-img {
          margin-top: 8px;
          width: 120px;
          height: 120px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${base64Image}" alt="logo-image" class="logo" />
          <div class="business-info">
            <div class="name">${business.name}</div>
            <div class="details">${business.address}</div>
            <div class="details">${business.phone}</div>
            <div class="details">${business.email}</div>
            <div class="invoice-title">Invoice</div>
            <div class="invoice-number">#${invoice.number}</div>
            <div class="date">${formatDate(new Date(invoice.date))}</div>
          </div>
        </div>
        <div class="details-section">
          <div>
            <div class="bill-to">Bill to:</div>
            <div class="client-info">${client.name}</div>
            <div class="client-info">${client.email}</div>
            <div class="client-info">${client.phone}</div>
            <div class="client-info">${client.address}</div>
          </div>
        </div>
        <div class="table-section">
          <table>
            <tr>
              <th>Description</th>
              <th class="right">Amount</th>
            </tr>
            ${charges
              .map(
                (item: { description: any; amount: any }) => `
              <tr>
                <td>${item.description}</td>
                <td class="right">$${item.amount}</td>
              </tr>
            `,
              )
              .join('')}
          </table>
        </div>
        <div class="footer-section">
          <div class="summary-row">
            <span class="summary-label">Total:</span>
            <span class="summary-value">$${invoice.total}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">PAID:</span>
            <span class="summary-value">$${invoice.paid}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Balance Due:</span>
            <span class="summary-value">$${invoice.due}</span>
          </div>
          <a class="pay-btn" href="${invoice.payUrl || `https://abt.qbared.com/jobs/invoice/${invoice.number}/`}">Pay Now</a>
          <div class="qr-section">
            <span class="qr-label">Or scan to pay:</span>
            <img class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
              invoice.payUrl || `https://abt.qbared.com/jobs/invoice/${invoice.number}/`,
            )}" alt="QR Pay" />
          </div>
        </div>
      </div>
    </body>
  </html>
`;

  /* const sendEmailWithAttachment = async () => {
        const apiKey = SENDGRID_API_KEY;
        const htmlContent = generateHTML();
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        const attachmentBase64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const emailData = {
          personalizations: [
            {
              to: [{ email: client.email }],
              subject: 'Invoice',
            },
          ],
          from: { email: 'admin@qbared.com' },
          content: [{ type: 'text/plain', value: "Hello, here is your invoice." }],
          attachments: [
            {
              content: attachmentBase64,
              filename: 'invoice.pdf',
              type: 'application/pdf',
              disposition: 'attachment',
            },
          ],
        };
      
        try {
            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify(emailData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error al enviar email: ${errorData.errors[0].message}`);
            } else {
                alert("EMAIL ENVIADO");
            }
        } catch (error) {
            console.error('Error al enviar el correo electrónico:', error);
            // Puedes manejar el error de manera apropiada aquí, como mostrar un mensaje al usuario o realizar otra acción.
        }
    }; */

  const createAndSendInvoice = async () => {
    try {
      const base64Image = await getBase64FromUrl(business.logo);
      const htmlContent = generateHTML(base64Image);
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (uri) {
        const newFileUri =
          FileSystem.documentDirectory + `${business.name} Invoice ${invoice.number}.pdf`;
        console.log(newFileUri);
        await FileSystem.moveAsync({
          from: uri,
          to: newFileUri,
        });
        if (newFileUri) {
          await Sharing.shareAsync(newFileUri);
        }
        //Delete the file after sharing
        await FileSystem.deleteAsync(newFileUri);
      }
    } catch (error) {
      console.error('Error al generar o enviar el PDF:', error);
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
  <>
      <StatusBar style={darkTheme ? 'light' : 'dark'} />
      <ThemedView style={commonStyles.tabHeader}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={darkTheme ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Invoice Details</ThemedText>
        <ThemedText type="subtitle"></ThemedText>
      </ThemedView>
  {loading ? (
    <ActivityIndicator style={commonStyles.loading} color={color} size="large" />
  ) : invoice ? (
      <ScrollView>
        <ThemedSecondaryView style={styles.invoice}>
          <View style={styles.header}>
            <ThemedText style={styles.bussinessname}>{business.name}</ThemedText>
            <ThemedText style={styles.invoiceTitle}>Invoice #{invoice.number}</ThemedText>
            <ThemedText style={styles.data}>{formatDate(new Date(invoice.date))}</ThemedText>
          </View>
          <View style={styles.details}>
            <ThemedText style={styles.bold}>Bill to:</ThemedText>
            <ThemedText style={styles.data}>{client.name}</ThemedText>
            <ThemedText style={styles.data}>{client.email}</ThemedText>
            <ThemedText style={styles.data}>{client.phone}</ThemedText>
            <ThemedText style={styles.data}>{client.address}</ThemedText>
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <ThemedText style={styles.tableHeader}>Description</ThemedText>
              <ThemedText style={styles.tableHeader}>Amount</ThemedText>
            </View>
            {charges ? (
              charges.map(
                (
                  item: {
                    description:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | null
                      | undefined;
                    amount:
                      | string
                      | number
                      | boolean
                      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | null
                      | undefined;
                  },
                  index: React.Key | null | undefined,
                ) => (
                  <View style={styles.tableRow} key={index}>
                    <ThemedText>{item.description}</ThemedText>
                    <ThemedText>${item.amount}</ThemedText>
                  </View>
                ),
              )
            ) : (
              <View style={styles.tableRow}>
                <ThemedText>No charges created.</ThemedText>
                <ThemedText>$0</ThemedText>
              </View>
            )}
          </View>
          <View style={styles.footer}>
            <ThemedText style={styles.data}>Total: ${invoice.total}</ThemedText>
            <ThemedText style={styles.data}>PAID: ${invoice.paid}</ThemedText>
            <ThemedText style={styles.data}>Balance Due: ${invoice.due}</ThemedText>
          </View>
          {/* <Button title="Email Invoice" onPress={() => sendEmailWithAttachment()} /> */}
          <View style={styles.tableRow}>
            {invoice.closed ? (
              <Button title="Closed" />
            ) : (
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    borderColor: color,
                    margin: 'auto',
                    backgroundColor: darkTheme ? darkThirdColor : lightMainColor,
                  },
                ]}
                onPress={() => router.navigate('/(app)/(jobs)/invoiceUpdate')}
              >
                <ThemedText>
                  Change
                </ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                {
                  borderColor: color,
                  width: 120,
                  margin: 'auto',
                  backgroundColor: darkTheme ? darkThirdColor : lightMainColor,
                },
              ]}
              onPress={() => createAndSendInvoice()}
            >
              <ThemedText>
                Send Invoice
              </ThemedText>
            </TouchableOpacity>
          </View>
          {/* <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisibleInvoice}
                        onRequestClose={() => {
                            setModalVisibleInvoice(!modalVisibleInvoice);
                        }}>
                        <View style={styles.centeredView}>
                        { loading ?
                        <ActivityIndicator style={styles.loading} size="large" />
                        :
                        <View style={[styles.card, {padding: 10}]}>
                            <ThemedText style={[styles.name, {padding: 10}]}>Do you want to create an invoice?</ThemedText>
                            <View style={[styles.dataContainer, {padding: 10, justifyContent: 'space-evenly'}]}>
                            <Pressable
                                style={[styles.button, {marginHorizontal: 5, flex: 1, backgroundColor: color}]}
                                onPress={() => setModalVisibleInvoice(!modalVisibleInvoice)}>
                                <ThemedText style={{color:'white', textAlign: 'center'}}>No</ThemedText>
                            </Pressable>
                            <Pressable
                                style={[[styles.button, {backgroundColor: 'red', marginHorizontal: 5, flex: 1}]]}
                                onPress={() => generateInvoice()}>
                                <ThemedText style={{color:'white', textAlign: 'center'}}>Yes</ThemedText>
                            </Pressable>
                            </View>
                        </View>
                        }
                        </View>
                    </Modal> */}
        </ThemedSecondaryView>
      </ScrollView>
  ) : (
    <>
      <ThemedText style={[styles.invoiceTitle, { textAlign: 'center', margin: 'auto' }]}>
        {error}
      </ThemedText>
      <TouchableOpacity
        style={[
          styles.button,
          {
            borderColor: color,
            margin: 'auto',
            backgroundColor: darkTheme ? darkThirdColor : lightMainColor,
          },
        ]}
        onPress={() => router.navigate('/(app)/(jobs)/invoiceCreate')}
      >
        <ThemedText style={{ textAlign: 'center' }}>Create</ThemedText>
      </TouchableOpacity>
      </>
  )}
  </> 
  );
}

const styles = StyleSheet.create({
  invoice: {
    margin: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  header: {
    padding: 10,
  },
  bussinessname: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  invoiceTitle: {
    textAlign: 'right',
    fontSize: 20,
    fontWeight: 'bold',
  },
  details: {
    padding: 10,
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  data: {
    fontSize: 15,
    textAlign: 'right',
  },
  table: {
    margin: 'auto',
    width: '90%',
    marginVertical: 20,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  footer: {
    padding: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 100,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  loading: {
    flex: 1,
    marginTop: 20,
    verticalAlign: 'middle',
    alignSelf: 'center',
  },
});
