import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { auth } from '../firebase';
import style from '../styles/components/UserInfo';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../types/navigation';
import { useState } from 'react';

const UserInfo = () => {
  const user = auth().currentUser;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={style.container}>
      <Text style={style.title}>👤 로그인된 사용자 정보</Text>

      {user && !user.isAnonymous ? (
        <ScrollView
          style={style.itemContainer}
          contentContainerStyle={{ alignItems: 'center', padding: 16 }}
        >
          {user.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                marginVertical: 10,
              }}
            />
          ) : (
            <Text>No profile image</Text>
          )}
          <Row label="UID" value={user.uid} />

          <Row label="이름" value={user.displayName} />

          <Row label="이메일" value={user.email} />
          <Row
            label="이메일 인증"
            value={user.emailVerified ? '인증됨' : '인증 필요'}
          />
          <Row label="계정 생성 시간" value={user.metadata.creationTime} />
          <Row label="마지막 로그인" value={user.metadata.lastSignInTime} />

          <View style={style.row}>
            <Text style={style.label}>2차 인증 수단:</Text>
            <View style={{ flex: 1 }}>
              {user.multiFactor?.enrolledFactors?.length ? (
                user.multiFactor.enrolledFactors.map((item, index) => (
                  <Text key={index}>
                    • {item.displayName ?? '이름 없음'} ({item.uid})
                  </Text>
                ))
              ) : (
                <Text>없음</Text>
              )}
            </View>
          </View>

          <Row label="전화번호" value={user.phoneNumber ?? '없음'} />
          <Row label="photoURL" value={user.photoURL ?? '없음'} />

          <Row label="providerID" value={user.providerId} />
          <View style={style.google}>
            <Row label="UID" value={user.providerData[0].uid} />
            <Row
              label="Display Name"
              value={user.providerData[0].displayName}
            />
            <Row label="Email" value={user.providerData[0].email} />
            <Row
              label="Phone Number"
              value={user.providerData[0].phoneNumber}
            />
            <Row label="Photo URL" value={user.providerData[0].photoURL} />
            <Row label="Provider ID" value={user.providerData[0].providerId} />
          </View>

          <TouchableOpacity
            style={style.postButton}
            onPress={() => navigation.navigate('PostList')}
          >
            <Text style={style.postText}>나의 게시글</Text>
            <Icon name="arrow-forward-outline" size={30} style={style.arrow} />
          </TouchableOpacity>
        </ScrollView>
      ) : user && user.isAnonymous ? (
        <Row label="이름" value={'익명 사용자'} />
      ) : (
        <Text style={style.noinfo}>로그인 정보 없음</Text>
      )}
    </View>
  );
};
function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={style.row}>
      <Text style={style.label}>{label}</Text>
      <Text style={style.value}>:{value ?? '없음'}</Text>
    </View>
  );
}
export default UserInfo;
