import { StyleSheet } from "react-native";

const GoogleLoginStyle = StyleSheet.create({
  container:{
    alignItems:"center",
  },
  button: {
    backgroundColor: 'white',
    borderColor: '#747775',
    borderWidth: 1,
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 400,
    minWidth: 200,
    marginVertical:10,
  },
  disabled: {
    backgroundColor: 'rgba(255,255,255,0.38)',
    borderColor: 'rgba(31,31,31,0.12)',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  text: {
    fontFamily: 'Roboto', // 폰트가 없으면 기본폰트로 대체됨
    fontSize: 14,
    fontWeight: '500',
    color: '#1f1f1f',
    flexGrow: 1,
    overflow: 'hidden',
    textAlign:"center",
  },
});
export default GoogleLoginStyle