import { StyleSheet } from 'react-native';

const UserInfoScreenStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    marginVertical:18,
    textAlign:"center",
    fontSize: 28,
  },
  itemContainer: {
    flex: 1,
    width: '95%',
    marginBottom:60,
    marginHorizontal:10,
    padding: 8,
    backgroundColor: '#e6efd3ff',
    borderRadius: 8,
    borderWidth: 1,
  },
  noinfo:{
    flex:1,
    fontSize:40,
    textAlign:"center",
    textAlignVertical:"center",
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
