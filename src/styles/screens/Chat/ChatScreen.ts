import { StyleSheet } from 'react-native';

const ChatScreenStyle = StyleSheet.create({
  message: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 2,
    marginLeft: 20,
  },
  name: {
    backgroundColor: '#ddd',
    borderRadius: 100,
    alignSelf: 'flex-start',
    padding: 10,
    marginVertical: 5,
  },
  mark: {
    fontSize: 8,
  },
  textInput: { flex: 1, borderWidth: 1, borderRadius: 5, padding: 8 },
  menu: {
    position: 'absolute',
    top: 10, // 화면 위에서 10px
    right: 10, // 화면 오른쪽에서 10px
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 3, // 안드로이드 그림자
  },
  menuSlider: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: 'white',
    elevation: 5,
    padding: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 5, // Android 그림자
    shadowColor: '#000', // iOS 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  settingContainer: { flexDirection: 'row', justifyContent: 'center' },
  nameEdit: {
    fontSize: 25,
  },
});

export default ChatScreenStyle;
