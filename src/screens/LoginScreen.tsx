import { View } from 'react-native';
import GoogleLogin from '../components/login/GoogleLogin';

import EmailLogin from '../components/login/EmailLogin';
import style from '../styles/screens/LoginScreen';

export default function LoginScreen() {
  return (
    <View style={style.container}>
      <EmailLogin></EmailLogin>
      <GoogleLogin></GoogleLogin>
    </View>
  );
}


