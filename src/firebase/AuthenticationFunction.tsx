import {
  EmailAuthProvider,
  FirebaseAuthTypes,
  linkWithCredential,
} from '@react-native-firebase/auth';
import { auth } from '.';
import { MemberInfoParam } from '../types/memberInfo';
import { addUserToFirestore } from './firestoreFunctions';

export async function signUpWithGoogleEmail(
  member: MemberInfoParam,
  password: string,
) {
  try {
    // 1) 계정 생성
    const user = await auth().currentUser;

    addUserToFirestore(user, member);
  } catch (error) {
    console.error(error);
  }
}

export async function signUpWithEmail(
  member: MemberInfoParam,
  password: string,
) {
  try {
    // 1) 계정 생성
    const user = auth().currentUser;
    if (user) {
      const credential=upgradeAnonymousToEmail(user, member.email, password);
      addUserToFirestore(user, member);

      // 2) 이메일 인증 메일 발송
      await (await credential).user.sendEmailVerification();

      // 3) 인증 전에는 로그아웃 처리
      await auth().signOut();
      await guestLogin();
      return;
    }
  } catch (error) {
        console.log("이메일 가입 시도시 문제 발생!");
    console.error(error);
  }
}

export async function signIn(email: string, password: string) {
  try {
    let user =auth().currentUser;
    if(user?.isAnonymous){
      user.delete();
    }
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    );
    user = userCredential.user;

    if (!user.emailVerified) {
      console.log('이메일 인증 필요!');
      await auth().signOut();
      const error = new Error('EMAIL_NOT_VERIFIED');
      (error as any).code = 'EMAIL_NOT_VERIFIED';
      throw error;
    }

    console.log('로그인 성공!');
  } catch (error) {
    console.log("이메일 로그인 시도중 에러발생");
    throw error;
  }
}

export async function guestLogin() {
  try {
    const userCredential = await auth().signInAnonymously();
    console.log('익명 로그인 성공:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('익명 로그인 실패:', error);
    throw error;
  }
}

export async function upgradeAnonymousToEmail(
  authUser: FirebaseAuthTypes.User,
  email: string,
  password: string,
) {
  const credential = EmailAuthProvider.credential(email, password);
  const result = await linkWithCredential(authUser, credential);
  console.log('업그레이드 성공:', result.user.uid);
  return result;
}
