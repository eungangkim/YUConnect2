import { useNavigation } from '@react-navigation/native';
import { Button, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

import { auth } from '../firebase/firebaseConfig';
import { RootStackParamList } from '../types/navigation';

const HomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [initializing, setInitializing] = useState(true);   //if true : firebase가 로그인상태를 확인 중 if false : 확인이 완료됨
    const [user, setUser] = useState<User | null>(null);    //  user!=null 로그인 상태  user==null 로그아웃 상태

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {   //onAuthStatgeChanged() 는 로그인 상태 변화를 감지하는 함수, 리스너를 추가하면 상태변화 감지마다 리스너를 실행    리스너를 해제해도 onAuthStatgeChanged()는 상태변화를 감지함 하지만 어떠한 행동도 하지 않음
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;   //return unsubscribe 와 unsubscribe()의 차이  -> useEffect()의 return 은 'clean up' 함수 || unsubscribe() 는 즉시 해제 
  }, []);

  if (initializing) return null;
  
  return (
    <View>
      <Button
        title="Example Screen"
        onPress={() => {
          navigation.navigate('Example');
        }}/>
        <Button
        title="매칭화면"
        onPress={() => {
          navigation.navigate('매칭', { id: 1, name: '김은강' });
        }}
      />
      <Button
        title="로그인"
        onPress={() => {
          navigation.navigate('Login');
        }}/>
       <Button
        title="사용자 정보"
        onPress={() => {
          navigation.navigate('UserInfo');
        }}/>
        
    </View>
  );
};

export default HomeScreen;
