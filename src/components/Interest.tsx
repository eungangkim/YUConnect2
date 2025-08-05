import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import type {
  MainInterest,
  MemberInfoParam,
  UserInterestProfile,
} from '../types/memberInfo';
import { interestList } from '../data/data';

type InterestProps = {
  member: MemberInfoParam;
  setMember: React.Dispatch<React.SetStateAction<MemberInfoParam>>;
};

export default function Interest({ member, setMember }: InterestProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>관심사 (예: 운동, 음악)</Text>
      {interestList.map(key => (
          <View key={key} >
            <View style={styles.row}>
            <Text>{key}</Text>
            <Switch
              value={!!member.interest.interests[key]}
              onValueChange={val => {
                setMember(prev => ({
                  ...prev,
                  interest: {
                    ...prev.interest,
                    interests: {
                      ...prev.interest.interests,
                      [key]: val,
                    },
                    detailedInterests: prev.interest.detailedInterests,
                  },
                }));
              }}
            />
          </View>
          {member.interest.interests[key] && (
            <Text style={{ marginLeft: 10, color: 'gray' }}>
              👉 "{key}"에 대한 상세 항목을 선택할 수 있습니다.
              {'\n'}(예: 체크박스, 버튼, 드롭다운 등 UI는 따로 구성)
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12 },
  title: { fontWeight: 'bold', marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
});
