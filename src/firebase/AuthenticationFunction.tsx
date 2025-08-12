import { auth } from '.';
import { MemberInfoParam } from '../types/memberInfo';
import { addUserToFirestore } from './firestoreFunctions';

export async function signUpWithEmail(
  member: MemberInfoParam,
  password: string,
) {
  try {
    // 1) 계정 생성
    const userCredential = await auth().createUserWithEmailAndPassword(
      member.email,
      password,
    );
    addUserToFirestore(userCredential, member);
    // 2) 이메일 인증 메일 발송
    await userCredential.user.sendEmailVerification();

    // 3) 인증 전에는 로그아웃 처리
    await auth().signOut();
  } catch (error) {
    console.error(error);
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      console.log('이메일 인증 필요!');
      await auth().signOut();
      const error = new Error('EMAIL_NOT_VERIFIED');
      (error as any).code = 'EMAIL_NOT_VERIFIED';
      throw error;
    }

    console.log('로그인 성공!');
  } catch (error) {
    throw error;
  }
}
