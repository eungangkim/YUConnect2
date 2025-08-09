import { StyleSheet } from 'react-native';

const ImageWindowStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  image: {
    borderRadius: 10,
    borderWidth: 2,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
    width: '60%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical:4,
  },
  deleteText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default ImageWindowStyles;
