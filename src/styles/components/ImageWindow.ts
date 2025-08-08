import { StyleSheet } from "react-native";

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
});

export default ImageWindowStyles;