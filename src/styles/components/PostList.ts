import { StyleSheet } from 'react-native';

const PostListStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 3,
    borderWidth: 0,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  post: {
    flex: 10,
    padding: 10,
    borderWidth: 1,
    marginVertical: 3,
  },
  option: {
    flex: 2,
    borderWidth: 1,
    marginVertical: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 150,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 5, // Android 그림자
    shadowColor: '#000', // iOS 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalButton: {
    paddingVertical: 10,
  },
  modalButtonText: {
    fontSize: 16,
  },
});

export default PostListStyle;
