import { StyleSheet, Platform } from 'react-native';


export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 10,
    },
    imageCircle : {
        width: 80,
        height: 80,
        borderRadius: 50,
        alignSelf: 'center',
    },
    imageSquare : {
        width: 160,
        height: 80,
        borderRadius: 10,
        alignSelf: 'center',
    },
    text_header: {
        fontWeight: 'bold',
        fontSize: 30,
        margin: 5
    },
    sub_text_header: {
        fontSize: 18,
        alignSelf: 'center',
    },
    footer: {
        flex: 3,
        borderTopStartRadius: 15,
        borderTopEndRadius: 15,
        borderTopWidth: 1,
        borderRightWidth: 1,
        marginHorizontal: 15,
        paddingHorizontal: 20,
        paddingTop: 30
    },
    text_action: {
        marginTop: 15,
    },
    action: {
        flexDirection: 'row',
        marginTop: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
        paddingLeft: 20,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        width: 100,
        alignSelf: 'center',
        borderRadius: 10,
        borderBottomWidth: 1,
        borderRightWidth: 1,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    linkSection: {
        flexDirection: 'row',
        marginTop: 50,
        marginHorizontal: 'auto',
    },
    colorsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    color: {
        width: 50,
        height: 50,
        marginHorizontal: 15,
        borderRadius: 25,
    },
    loading: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    createButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 1,
        elevation: 5,
    },
});