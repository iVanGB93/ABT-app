import React, {useState, useEffect} from 'react';
import { View, Button, Text, StyleSheet, ScrollView, Modal, Pressable, TouchableOpacity, Platform, ActivityIndicator, Image } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useSelector } from 'react-redux';

import { RootState, useAppDispatch } from "@/app/(redux)/store";
//import { SENDGRID_API_KEY } from '@env';
import axiosInstance from '@/axios';
import { setInvoice, setCharges } from '@/app/(redux)/jobSlice';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { darkSecondColor, lightSecondColor, darkMainColor } from '@/settings';
import { useRouter } from 'expo-router';


export default function Invoice() {
    const { color, darkTheme, businessName, businessLogo } = useSelector((state: RootState) => state.settings);
    const { client } = useSelector((state: RootState) => state.client);
    const {job, invoice, charges} = useSelector((state: RootState) => state.job);
    const [modalVisibleInvoice, setModalVisibleInvoice] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();
    
    const getInvoice = async () => {
        await axiosInstance
        .get(`jobs/invoice/${job.id}/`)
        .then(function(response) {
            if (response.status === 200) {
                dispatch(setInvoice(response.data.invoice));
                dispatch(setCharges(response.data.charges));
                setLoading(false);
            } else {
                dispatch(setInvoice(response.data.invoice));
                dispatch(setCharges(response.data.charges));
                setError(response.data.message);
                setLoading(false);
            }
        })
        .catch(function(error) {
            console.error('Error fetching an invoice', error);
            setError(error.message);
            setLoading(false);
        });
    }

    useEffect(() => {
        getInvoice();
    }, []);

    const convertImageToBase64 = async (uri:any) => {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        return `data:image/jpeg;base64,${base64}`;
    };

    const generateHTML  = (base64Image:any) => `
        <html>
            <head>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { display: flex; justify-content: space-between; }
                .invoice-title { font-size: 24px; font-weight: bold; }
                .invoice-number { font-size: 20px; font-weight: bold; }
                .details { display: flex; justify-content: space-between; margin-top: 20px; }
                .details p { margin: 5px 0; }
                .table { width: 100%; margin-top: 20px; border-collapse: collapse; }
                .table th, .table td { border: 1px solid #ddd; padding: 8px; }
                .table th { background-color: #f2f2f2; text-align: left; }
                .footer { margin-top: 20px; text-align: end; }
            </style>
            </head>
            <body>
            <div class="header">
                <img src=${base64Image} alt="logo-image" style="width: 150px; height: 150px"/>
                <div>
                    <p class="invoice-title">${businessName}</p>
                    <p class="invoice-number">Invoice #${invoice.number}</p>
                    <p>${formatDate(new Date(invoice.date))}</p>
                </div>
            </div>
            <div class="details">
                <p><strong>Bill to:</strong></p>
                <div>
                    <p>${client.user}</p>
                    <p>${client.email}</p>
                    <p>${client.phone}</p>
                    <p>${client.address}</p>
                </div>
            </div>
            <table class="table">
                <tr>
                <th>Description</th>
                <th>Amount</th>
                </tr>
                ${charges.map((item: { description: any; amount: any; }) => `
                <tr>
                    <td>${item.description}</td>
                    <td>$ ${item.amount}</td>
                </tr>
                `).join('')}
            </table>
            <div class="footer">
                <p><strong>Total:</strong> $ ${invoice.total}</p>
                <p><strong>PAID:</strong> $ ${invoice.paid}</p>
                <p><strong>Balance Due:</strong> $ ${invoice.due}</p>
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
            const base64Image = await convertImageToBase64(businessLogo);
            const htmlContent = generateHTML(base64Image);
            const { uri } = await Print.printToFileAsync({ html: htmlContent});
            if (uri) {
                const newFileUri = FileSystem.documentDirectory + `${businessName} Invoice ${invoice.number}.pdf`;
                console.log(newFileUri);
                await FileSystem.moveAsync({
                    from: uri,
                    to: newFileUri,
                });
                if (newFileUri) {
                    await Sharing.shareAsync(newFileUri);
                }
                // Delete the file after sharing
                // await FileSystem.deleteAsync(newFileUri);
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
        loading ?
        <ActivityIndicator style={styles.loading} size="large" />
        :
        invoice ? 
        <ScrollView>
            <ThemedView style={styles.invoice}>
                <ThemedView style={styles.header}>
                    <ThemedText style={styles.bussinessname}>{businessName}</ThemedText>
                    <ThemedText style={styles.invoiceTitle}>Invoice #{invoice.number}</ThemedText>
                    <ThemedText  style={styles.data}>{formatDate(new Date(invoice.date))}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.details}>
                    <ThemedText style={styles.bold}>Bill to:</ThemedText>
                    <ThemedText style={styles.data}>{client.user}</ThemedText>
                    <ThemedText style={styles.data}>{client.email}</ThemedText>
                    <ThemedText style={styles.data}>{client.phone}</ThemedText>
                    <ThemedText style={styles.data}>{client.address}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.table}>
                    <ThemedView style={styles.tableRow}>
                    <ThemedText style={styles.tableHeader}>Description</ThemedText>
                    <ThemedText style={styles.tableHeader}>Amount</ThemedText>
                    </ThemedView>
                    { charges ?
                    charges.map((item: { description: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; amount: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
                    <ThemedView style={styles.tableRow} key={index}>
                        <ThemedText>{item.description}</ThemedText>
                        <ThemedText>${item.amount}</ThemedText>
                    </ThemedView>
                    )) : 
                    <ThemedView style={styles.tableRow}>
                        <ThemedText>No charges created.</ThemedText>
                        <ThemedText>$0</ThemedText>
                    </ThemedView>
                    }
                </ThemedView>
                <ThemedView style={styles.footer}>
                    <ThemedText style={styles.data}>Total: ${invoice.total}</ThemedText>
                    <ThemedText style={styles.data}>PAID: ${invoice.paid}</ThemedText>
                    <ThemedText style={styles.data}>Balance Due: ${invoice.due}</ThemedText>
                </ThemedView>
                {/* <Button title="Email Invoice" onPress={() => sendEmailWithAttachment()} /> */}
                <ThemedView style={styles.tableRow}>
                    { invoice.closed ?
                    <Button  title='Closed'/>
                    :
                    <TouchableOpacity style={[styles.button, {backgroundColor: color, width: 150, margin: 'auto'}]} onPress={() => router.push('invoiceUpdate')}><ThemedText style={{color: 'white', textAlign: 'center'}}>Change</ThemedText></TouchableOpacity>
                    }
                    <TouchableOpacity style={[styles.button, {backgroundColor: color, width: 150, margin: 'auto'}]} onPress={() => createAndSendInvoice()}><ThemedText style={{color: 'white', textAlign: 'center'}}>Send Invoice</ThemedText></TouchableOpacity>
                </ThemedView>
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
            </ThemedView>
        </ScrollView>
        :
        <ThemedView style={styles.container}>
            <ThemedText style={[styles.invoiceTitle, {textAlign: 'center', margin: 'auto'}]}>{error}</ThemedText> 
            <TouchableOpacity style={[styles.button, {backgroundColor: color, width: 150, margin: 'auto'}]} onPress={() => router.push('invoiceCreate')}><ThemedText style={{color: 'white', textAlign: 'center'}}>Create</ThemedText></TouchableOpacity>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
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
        textAlign:  'right',
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
        backgroundColor: '#694fad',
        padding: 10,
        borderRadius: 16,
        margin: 5,
        ...Platform.select({
            ios: {
            shadowOffset: { width: 2, height: 2 },
            shadowColor: "#333",
            shadowOpacity: 0.3,
            shadowRadius: 4,
            },
            android: {
            elevation: 5,
            },
        }),
    },
    loading: {
        flex: 1,
        marginTop: 20,
        verticalAlign: 'middle',
        alignSelf: 'center',
    },
});