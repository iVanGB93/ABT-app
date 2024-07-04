import { StyleSheet, Platform } from 'react-native';


export const commonStylesDetails = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 10,
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        alignSelf: "center",
        marginTop: 5,
    },
    bottom: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 15,
    },
    list: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loading: {
        flex: 1,
        verticalAlign: 'middle'
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
    errorText: {
        color: "red",
        marginBottom: 5,
    },
});