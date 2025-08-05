import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  MemberInfoParam,
  MainInterest,
  InterestDetails,
  UserInterestProfile,
} from '../types/memberInfo';
import Interest from './Interest';

type Props = {
  member: MemberInfoParam;
  setMember: React.Dispatch<React.SetStateAction<MemberInfoParam>>;
};
export default function MemberForm({ member, setMember }: Props) {
  // 필드별 업데이트 헬퍼
  const setField = (field: keyof MemberInfoParam, value: any) => {
    setMember(prev => ({ ...prev, [field]: value }));
  };

  // images 배열 첫 번째 uri 업데이트 예시
  const setImageUri = (uri: string) => {
    setMember(prev => ({
      ...prev,
      images: [{ uri }],
    }));
  };

  return (
    <View>
      <Text>ID</Text>
      <TextInput
        style={styles.input}
        value={member.id}
        onChangeText={text => setField('id', text)}
        placeholder="고유 ID"
      />

      <Text>이름</Text>
      <TextInput
        style={styles.input}
        value={member.name}
        onChangeText={text => setField('name', text)}
        placeholder="이름"
      />

      <Text>성별 (남: true, 여: false)</Text>
      <Switch value={member.sex} onValueChange={val => setField('sex', val)} />

      <Text>이메일</Text>
      <TextInput
        style={styles.input}
        value={member.email}
        onChangeText={text => setField('email', text)}
        placeholder="example@mail.com"
        keyboardType="email-address"
      />

      <Text>전화번호</Text>
      <TextInput
        style={styles.input}
        value={member.tel}
        onChangeText={text => setField('tel', text)}
        placeholder="010-1234-5678"
        keyboardType="phone-pad"
      />

      <Text>생년월일 (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={member.birth}
        onChangeText={text => setField('birth', text)}
        placeholder="1990-01-01"
      />

      <Text>대표 이미지 URI</Text>
      <TextInput
        style={styles.input}
        value={member.images[0]?.uri}
        onChangeText={text => setImageUri(text)}
        placeholder="https://example.com/image.jpg"
      />

      <Text>MBTI</Text>
      <TextInput
        style={styles.input}
        value={member.mbti}
        onChangeText={text => setField('mbti', text)}
        placeholder="INFP"
      />

      <Text>연애 목적</Text>
      <Switch
        value={member.forLove}
        onValueChange={val => setField('forLove', val)}
      />

      <Text>친구 목적</Text>
      <Switch
        value={member.forFriendship}
        onValueChange={val => setField('forFriendship', val)}
      />

      {/* 관심사 입력은 간단하게 주요 관심사 체크박스 형태로 예시만 */}

      <Interest member={member} setMember={setMember} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  checkboxContainer: {
    marginVertical: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
});
