import { firestore } from './index';

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
