import { ActivityIndicator, View } from 'react-native';
import { useState } from 'react';

import EmailLogin from '../components/login/EmailLogin';
import GoogleLogin from '../components/login/GoogleLogin';
import style from '../styles/screens/LoginScreen';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  return (
    <View style={style.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <EmailLogin loading={loading} setLoading={setLoading}></EmailLogin>
      <GoogleLogin loading={loading} setLoading={setLoading}></GoogleLogin>
    </View>
  );
}
