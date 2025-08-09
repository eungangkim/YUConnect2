import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex:10,
    padding: 16,
  },
  title: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  description:{
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
    height: 100,
  },
  checkboxContainer: {
    marginVertical: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
});