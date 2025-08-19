import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MemberInfoParam } from '../types/memberInfo';
import { auth, firestore } from './index';
import { Alert } from 'react-native';
import { getFCMToken } from './messageingSetup';
import { RootStackParamList } from '../types/navigation';
import { PostInfoParam } from '../types/postInfo';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { guestLogin } from './AuthenticationFunction';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/firestore';

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
  user: FirebaseAuthTypes.User | null,
  member: MemberInfoParam,
) {
  try {
    // 1. 문서 참조 생성 (자동 ID 포함)
    const userRef = firestore().collection('users').doc(user?.uid);

    const newToken = getFCMToken();

    // 2. user 객체에 ID 포함
    const userWithId = {
      ...member,
      id: userRef.id,
      tokens: { token: newToken },
    };

    // 3. 저장
    await userRef.set(userWithId);
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
  const docRef=await firestore().collection('posts').doc(post.id);

    await deleteDocWithCollectionAndId("chats",(await docRef.get()).data()?.chatId??"");
    docRef.delete();
    
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
        console.log('삭제할 문서 ID:', doc.id);
        batch.delete(doc.ref);
      });
      await batch.commit();
      await guestLogin();

      console.log('게시물 삭제 완료');
    } else {
      console.log('해당 유저의 게시물이 없습니다.');
    }
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

export async function deletePostsWithInvalidUser() {
  try {
    console.log('유효하지 않은 유저 UID를 가진 게시물 삭제 시작');

    // 1. 모든 유저 UID 가져오기
    const usersSnap = await firestore().collection('users').get();
    const validUserIds = new Set(usersSnap.docs.map(doc => doc.id)); // 유저 문서 ID 기준

    console.log(`현재 유저 수: ${validUserIds.size}`);

    // 2. 모든 게시물 가져오기
    const postsSnap = await firestore().collection('posts').get();

    let deleteCount = 0;
    const batch = firestore().batch();

    postsSnap.docs.forEach(doc => {
      const postData = doc.data();
      const authorId = postData.authorUid; // 🔹 실제 필드명 맞춰야 함 (userId, uid 등)

      if (!validUserIds.has(authorId)) {
        console.log(`삭제 대상: ${doc.id}, authorId: ${authorId}`);
        batch.delete(doc.ref);
        deleteCount++;
      }
    });

    // 3. 삭제 실행
    if (deleteCount > 0) {
      await batch.commit();
      console.log(`삭제 완료: ${deleteCount}개의 게시물 삭제`);
    } else {
      console.log('삭제할 게시물이 없습니다.');
    }
  } catch (error) {
    console.error('관리자 게시물 정리 중 오류 발생:', error);
  }
}

export async function addChatToFirestore(title: string) {
  const chatRef = firestore().collection('chats').doc();
  const user = auth().currentUser;
  // 2. post 객체에 ID 포함
  const chat = {
    id: chatRef.id,
    users: [user?.uid], // 참여자 UID 리스트
    title: title + '의 채팅방',
    lastMessage: {
      text: '', // 초기에는 메시지 없음
      timestamp:firestore.FieldValue.serverTimestamp(), // 나중에 메시지가 들어올 때 serverTimestamp로 업데이트
    },
    createdAt: firestore.FieldValue.serverTimestamp(), // 생성 시 서버 시간
  };

  chatRef.set(chat);
  return chatRef;
}

export async function updateToken() {
  const token = await getFCMToken();

  // ✅ Firestore 토큰 저장 (배열로 추가)
  const userDocRef = firestore()
    .collection('users')
    .doc(auth().currentUser?.uid);
  await userDocRef.update({
    tokens: firebase.firestore.FieldValue.arrayUnion(token),
  });
}

export async function addDoc(collection:string,data:object) {
    const docRef = await firestore().collection(collection).doc();
    docRef.set({
      id:docRef.id,
      createAt:firestore.FieldValue.serverTimestamp(),
      ...data
    })
}

export async function getDocRefWithCollectionAndId(collection:string,id:string){
  const docRef=await firestore().collection(collection).doc(id);
  return docRef;
}

export async function deleteDocWithCollectionAndId(collection:string,id:string) {
  if(collection==="chats"){
    await deleteMessages(id);
  }
    const docRef=await firestore().collection(collection).doc(id);
  docRef.delete();
}

async function deleteMessages(chatId: string,batchSize = 100) {
  const messagesRef = firestore().collection("chats").doc(chatId).collection("messages");
  const snapshot = await messagesRef.limit(batchSize).get();
  console.log("재귀함수 진입",snapshot);
  if (!snapshot||snapshot.empty) return;

  const batch = firestore().batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  if (snapshot.size >= batchSize) {
    await deleteMessages(chatId); // batch 나눠서 재귀 삭제
  }
}

async function deleteCollectionRecursive(
  collectionRef: FirebaseFirestoreTypes.CollectionReference,
  batchSize = 100
) {
  // 1️⃣ batchSize 만큼 문서 가져오기
  const snapshot = await collectionRef.limit(batchSize).get();

  if (snapshot.empty) {
    return; // 삭제할 문서가 없으면 종료
  }

  // 2️⃣ batch 생성 후 문서 삭제
  const batch = firestore().batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  // 3️⃣ 남은 문서가 있으면 재귀 호출
  if (snapshot.size >= batchSize) {
    await deleteCollectionRecursive(collectionRef, batchSize);
  }
}