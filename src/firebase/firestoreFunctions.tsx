import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MemberInfoParam } from '../types/memberInfo';
import { auth, firestore } from './index';
import { Alert } from 'react-native';
import { getFCMToken } from './messageingSetup';
import { RootStackParamList } from '../types/navigation';
import { PostInfoParam } from '../types/postInfo';

export async function getPosts() {
  try {
    const postsSnapshot = await firestore().collection('posts').get();

    const posts = postsSnapshot.docs;

    console.log('불러온 posts:', posts);
    if (posts.length >= 0) {
      console.log('posts를 잘 받았습니다.');
    } else {
      console.log('해당 문서 없음');
    }
    return posts;
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

export async function getPostsWithUserId(id: string) {
  const userPostsQuery = firestore()
    .collection('posts')
    .where('authorUid', '==', id);

  return userPostsQuery;
}

export async function addUserToFirestore(
  user: MemberInfoParam,
  password: string,
  navigation: NativeStackNavigationProp<RootStackParamList>,
) {
  try {
    if (!user.email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력하세요.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('비밀번호 오류', '비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    const newUser = await auth().createUserWithEmailAndPassword(
      user.email.trim(),
      password,
    );
    Alert.alert('성공', '회원가입 완료! 자동 로그인 되었습니다.');
    // 1. 문서 참조 생성 (자동 ID 포함)
    const userRef = firestore().collection('users').doc(newUser.user.uid);

    const newToken = getFCMToken();

    // 2. user 객체에 ID 포함
    const userWithId = {
      ...user,
      id: userRef.id,
      tokens: { ...user.tokens, token: newToken },
    };

    // 3. 저장
    await userRef.set(userWithId);
    navigation.replace('Home');
    console.log('회원정보가 Firestore에 저장되었습니다.');
  } catch (error) {
    console.error('Firestore 저장 중 오류 발생:', error);
  }
}

export async function addPostToFirestore(post: PostInfoParam) {
  try {
    // 1. 문서 참조 생성 (자동 ID 포함)
    const postRef = firestore().collection('posts').doc();

    // 2. post 객체에 ID 포함
    const postWithId = {
      ...post,
      id: postRef.id,
    };

    // 3. 저장
    await postRef.set(postWithId);

    console.log('게시글이 Firestore에 저장되었습니다.');
  } catch (error) {
    console.error('Firestore 저장 중 오류 발생:', error);
  }
}

export async function savePostToFirestore(post: PostInfoParam) {
  try {
    const postRef = firestore().collection('posts').doc(post.id);

    await postRef.set(post);
  } catch (error) {
    console.error('Firestore 저장 중 오류 발생:', error);
  }
}

export async function deletePostFromFirestore(post: PostInfoParam) {
  try {
    await firestore().collection('posts').doc(post.id).delete();
  } catch (error) {
    console.error('Firestore 삭제 중 오류 발생:', error);
  }
}

export async function deleteUserFromFireStore(Uid: string) {
  try {
    const user = auth().currentUser;

    if (!user) {
      throw new Error('현재 로그인된 사용자가 없습니다.');
    }

    // [1] Firestore: 유저 문서 삭제
    await firestore().collection('users').doc(Uid).delete();

    // [2] Firestore: 해당 유저의 게시물 전부 삭제
    const postsSnap = await firestore()
      .collection('posts')
      .where('authorUid', '==', Uid)
      .get();

    console.log('찾은 게시물 개수:', postsSnap.size);

    if (!postsSnap.empty) {
      const batch = firestore().batch();
      postsSnap.docs.forEach(doc => {
        console.log('삭제할 문서 ID:', doc.id,"\n삭제할 문서의 저자:",user.uid," ,",Uid);
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('게시물 삭제 완료');
    } else {
      console.log('해당 유저의 게시물이 없습니다.');
    }
    // [3] Firebase Auth: 계정 삭제
    await user.delete();
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      console.error('계정 삭제를 위해 최근 로그인 필요');
      // 이 경우, reauthenticateWithCredential 사용해야 함
    } else {
      console.error('탈퇴 처리 중 오류:', error);
    }
  }
}
