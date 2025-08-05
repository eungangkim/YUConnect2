import { MainInterest } from "../types/memberInfo";
import { memberInfo } from "./memberInfo";
import { postInfo } from "./postInfo";

/*
<Image source={{ uri: 'https://example.com/image.jpg' }} />   //웹 주소 방식
<Image source={require('../assets/user1.png')} />   //로컬 파일 - require 방식

*/

//임시 데이터 배열
export const members = [
  memberInfo(
    "0",
    "김민지",
    false,
    "jisu@example.com",
    "010-1234-5678",
    "1998-05-14",
    [require("../assets/user1.jpg")],
    "ENFP",
    {
      interests: {
        운동: true,
        음악: true,
        "영화/드라마/예능": true,
      },
      detailedInterests: {
        운동: ["헬스", "러닝"],
        음악: ["K-POP", "노래 부르기"],
        "영화/드라마/예능": ["넷플릭스", "예능"],
      },
    },
    true,
    true,
    50,
  ),

  memberInfo(
    "1",
    "하니",
    true,
    "junho@example.com",
    "010-2345-6789",
    "1995-11-22",
    [require("../assets/user2.jpg"),require("../assets/user2-1.jpg"),require("../assets/user2-2.jpg")],
    "ISTJ",
    {
      interests: {
        게임: true,
        독서: true,
        자기계발: true,
      },
      detailedInterests: {
        게임: ["콘솔 게임", "배틀그라운드"],
        독서: ["자기계발서", "심리학"],
        자기계발: ["시간 관리", "마인드셋"],
      },
    },
    false,
    true,
    50
  ),

  memberInfo(
    "2",
    "박보영",
    false,
    "seoyeon@example.com",
    "010-3456-7890",
    "2000-02-07",
    [require("../assets/user3.jpg"),require("../assets/user3-1.jpg")],
    "INFP",
    {
      interests: {
        여행: true,
        "사진/영상": true,
        "맛집 탐방": true,
      },
      detailedInterests: {
        여행: ["해외 여행", "자연/캠핑"],
        "사진/영상": ["풍경 사진", "브이로그"],
        "맛집 탐방": ["카페", "디저트"],
      },
    },
    true,
    false,
    50
  ),

  memberInfo(
    "3",
    "윈터터터터ㅓ터터터터ㅓ터ㅓ터터터ㅓㅓㅓㅓ터터터",
    true,
    "minsu@example.com",
    "010-4567-8901",
    "1997-08-30",
    [require("../assets/user4.jpg")],
    "ENTP",
    {
      interests: {
        스터디: true,
        봉사활동: true,
        반려동물: true,
      },
      detailedInterests: {
        스터디: ["면접 준비", "영어"],
        봉사활동: ["환경 보호", "기부 활동"],
        반려동물: ["강아지", "입양"],
      },
    },
    false,
    true,
    50
  ),
  
];


export const posts = [
  postInfo(
    "post1",
    true,
    false,
    "같이 넷플릭스 보고 영화 이야기 나눌 사람 구해요!ㅇㄴ어ㅣ너임너인밍ㄴ머이머이너머임임넝너ㅣ넘어미ㅣㅓ어임너ㅣㄴㅁ이닝너어ㅣㅁㄴ어ㅣㄴㅁ어ㅣㅁㄴ어ㅣㄴㅁ임너ㅣ언미언미어너ㅓㅣ니 🎬",
    [members[0],members[1],members[2],members[3],],
    "/chat/post1"
  ),

  postInfo(
    "post2",
    false,
    true,
    "주말마다 러닝할 친구 구해요. 한강에서 달려요! 🏃‍♂️",
    [members[2]],
    "/chat/post2"
  ),

  postInfo(
    "post3",
    true,
    true,
    "친구도 좋고 연애도 좋아요. 함께 전시회 가실 분~ 🎨",
    [members[0], members[1],members[2]],
    "/chat/post3"
  ),

  postInfo(
    "post4",
    false,
    true,
    "책 같이 읽고 이야기 나눌 사람 있나요? 📚",
    [members[0],members[3]],
    "/chat/post4"
  ),
];

  export const interestList: MainInterest[] = [
    '운동',
    '음악',
    '영화/드라마/예능',
    '게임',
    '스터디',
    '여행',
    '반려동물',
    '맛집 탐방',
    '봉사활동',
    '사진/영상',
    '패션',
    '자기계발',
    '독서',
    'MBTI',
    '기타',
  ];