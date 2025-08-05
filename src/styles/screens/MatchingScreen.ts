import { StyleSheet } from 'react-native';

export const MatchingScreenStyle = StyleSheet.create({
  pageView: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderWidth:2,
    borderRadius:50,
    padding: 0,
  },
  goBackTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 60,
    borderWidth: 0,
    margin: 10,
    marginTop: 40,
  },
  goBackImage: {
    resizeMode: 'cover',
    width: 100,
    height: 40,
  },
  userView: {
    flex: 1,
    maxWidth:"98%",
    margin:5,
    //borderRadius: 50,
    //borderWidth: 2,
  },
  userText: {
    margin: 5,
    padding: 3,
    paddingLeft: 10,
    paddingTop: 10,
    borderWidth: 0,
    fontSize: 17,
  },
  userListView: {
    flexDirection: 'row',
    margin: 6,
    borderWidth: 0,
    maxHeight:45
  },
  userNameTouchable: {},
  userNameText: {
    padding: 5,
    borderWidth: 2,
    borderRadius:10,
    marginHorizontal: 10,
    marginVertical: 3,
    fontWeight: 'bold',
  },
  descriptionView: {
    flex:1,
    borderRadius: 10,
    borderWidth: 2,
    margin: 3,
    padding: 10,
  },
  descriptionText: {
    fontSize: 28,
  },
  enterTouchable:{
    alignItems:"flex-end"
  },
  enterText:{
    marginRight:30,
    padding:5,
    borderWidth:2,
    borderRadius:10,
  },
});
