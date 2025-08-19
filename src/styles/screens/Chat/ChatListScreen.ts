import { StyleSheet } from 'react-native';

const ChatListScreenStyle = StyleSheet.create({
  noChat: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  chat: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  lastMessage: { color: '#666', marginTop: 4 },
  chatInfo: { flexDirection: 'row', justifyContent: 'space-between' },
});

export default ChatListScreenStyle;
