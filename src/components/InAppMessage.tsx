// InAppMessage.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function InAppMessage(title:string, body:string ) {
  return (
    <View style={{
      position: 'absolute',
      top: 50,
      left: 20,
      right: 20,
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 8,
      elevation: 5
    }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>{title}</Text>
      <Text>{body}</Text>
      <TouchableOpacity onPress={()=>{}} style={{ marginTop: 10 }}>
        <Text style={{ color: 'blue' }}>닫기</Text>
      </TouchableOpacity>
    </View>
  );
}
