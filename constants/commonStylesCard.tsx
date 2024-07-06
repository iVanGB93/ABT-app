import { StyleSheet, Platform } from 'react-native';


export const commonStylesCards = StyleSheet.create({
    card: {
        borderRadius: 10,
        marginHorizontal: 10,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        padding: 5,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    nameContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        borderBottomWidth: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
    },
    dataContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        overflow: 'scroll',
    },    
    LabelText: {
        fontSize: 16,
        fontWeight: "bold",
        lineHeight: 20,
    },  
    dataText: {
        fontSize: 14,
        lineHeight: 20,
    },
    imageUser: {
        width: 100, 
        height: 100,
        alignSelf: 'center',
        borderRadius: 75,
    },
    imageJob: {
        width: 120, 
        height: 80,
        alignSelf: 'center',
        borderRadius: 10,
      },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
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
        verticalAlign: 'middle'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    expandedImage: {
        width: '100%',
        height: '90%',
        resizeMode: 'contain',
    },
});