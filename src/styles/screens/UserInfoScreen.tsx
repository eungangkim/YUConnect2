import { StyleSheet } from 'react-native';

const UserInfoScreenStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    paddingTop:20,
    fontSize: 30,
    marginBottom: 20,
  },
  itemContainer: {
    flex: 1,
    width: '95%',
    marginBottom:60,
    padding: 8,
    backgroundColor: '#e6efd3ff',
    borderRadius: 8,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  label: {
    fontWeight: 'bold',
    width: 150, // 고정 너비로 줄 맞춤
    alignContent:"center",
    fontSize:18,
    textAlign:"center"
  },
  value: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize:18,
  },
  logout: {
    width:120,
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
  google: {
    width:"100%",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
});

export default UserInfoScreenStyle;
