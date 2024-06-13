import { StyleSheet, Platform } from 'react-native';

export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 10,
    },
    image : {
        width: 60,
        height: 60,
        borderRadius: 50,
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
        borderRadius: 30,
        borderWidth: 2,
        marginHorizontal: 15,
        paddingHorizontal: 20,
        paddingTop: 30
    },
    text_footer: {
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        borderTopLeftRadius: 15,
        borderTopEndRadius: 15,
    },
    actionError: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FF0000',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        marginTop: 50,
        width: '100%',
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
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
});