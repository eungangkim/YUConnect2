import { Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import ImageWindow from './ImageWindow';
import { PostInfoParam } from '../types/postInfo';
import style from '../styles/components/Post';
import { MemberInfoParam } from '../types/memberInfo';
import { runOnJS, SharedValue, useDerivedValue } from 'react-native-reanimated';
import { useState } from 'react';
import { auth, firestore } from '../firebase';
import { sendNotification } from '../firebase/messageingSetup';

type Props = {
  post: PostInfoParam;
};

export const Post = ({ post }: Props) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]); //현재 ImageWindow에 표시되고 있는 memberInfo.Images 리스트
  const [users, setUsers] = useState<MemberInfoParam[]>([]);

  //console.log(users);
  useDerivedValue(async () => {
    //useDerivedValue(() => { ... }, [currentPage]) currentPage 값이 변할 때마다 내부 로직 실행됨
    const updateSelectedImages = runOnJS(setSelectedImages);

    const chunkSize = 10;
    const fetchedUsers: MemberInfoParam[] = [];

    for (let i = 0; i < post.users.length; i += chunkSize) {
      const chunk = post.users.slice(i, i + chunkSize);
      const usersSnap = await firestore()
        .collection('users')
        .where(firestore.FieldPath.documentId(), 'in', chunk)
        .get();
      usersSnap.docs.forEach(doc => {
        fetchedUsers.push({ ...doc.data() } as MemberInfoParam);
      });
    }
    setUsers(fetchedUsers);
    setSelectedImages(post.images);
  }, []);

  async function onParticipateChat() {
    try{
      const user=auth().currentUser;
      if(!user?.uid)return;
      if(post.users.includes(user?.uid,0)) {
        Alert.alert("경고","사용자는 해당 게시글에 이미 참여하였습니다.");
        return;
      }
      sendNotification([post.authorUid],"대화방 참가 요청",user?.displayName??"(이름 없음)"+"님이 참가 요청을 보냈습니다!","chat_request",{chatId:post.chatId,postId:post.id});
      // const chatRef = firestore().collection('chats').doc(chatId);

    // 
    }catch(e){
      console.log("error",e);
    }
  }
  return (
    <View
      style={[
        {
          backgroundColor: post.forLove ? '#e49aceff' : '#ace4f3ff',
        },
        style.pageView,
      ]}
    >
      <View style={style.userView}>
        <Text style={style.userText}>참가한 사용자 목록</Text>
        <ScrollView horizontal style={style.userListView}>
          {post.users.map((id: string, index: number) => {
            const user = users.find(u => u.id === id);
            if (user === undefined) {
              //console.log(users);
              //console.log(`❌ 유저 데이터를 찾지 못한 ID: ${id}`);
              return (
                <Text key={`missing-user-${index}`}>
                  사용자가 불려오지 못함.
                </Text>
              );
            }
            return (
              <TouchableOpacity
                key={user.id}
                style={style.userNameTouchable}
                onPress={() => setSelectedImages(user.images)}
              >
                <Text style={style.userNameText}>{user.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text>
          {post.title} 인원수 :{post.users.length}/{post.maxUserCount}
        </Text>
        <ImageWindow images={selectedImages} />
        <ScrollView
          style={[
            style.descriptionView,
            {
              backgroundColor: post.forLove ? '#df8ac5ff' : '#96daedff',
            },
          ]}
        >
          <Text style={style.descriptionText}>{post.description}</Text>
        </ScrollView>
        <TouchableOpacity
          style={style.enterTouchable}
          onPress={()=>onParticipateChat()} 
        >
          <Text style={style.enterText}>참가하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
