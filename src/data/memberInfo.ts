/*
memberInfo의 정보는 가입 시 필요한 정보와 앱 이용에 필요한 정보가 통합된 객체이다.
*/

import { UserInterestProfile } from "../types/memberInfo";

export function memberInfo(
    id:string,   //key 값 (고유번호)
    name:string,  //사용자의 이름
    sex:boolean,  //성별
    email:string, //이메일
    tel:string,   //전화번호
    birth:string, //생년월일
    images:string[], //자신을 표현하는 이미지
    mbti:string,  //mbti
    interest:UserInterestProfile, //관심사
    forLove:boolean,  //연애가 목적
    forFriendship:boolean, //친구가 목적
    mannerDegree:number,     //매너 온도 0~100
    tokens:string[],   //사용자의 디바이스 토큰배열
){
    return {id,name,sex,email,tel,birth,images,mbti,interest,forLove,forFriendship,mannerDegree,tokens};
}


