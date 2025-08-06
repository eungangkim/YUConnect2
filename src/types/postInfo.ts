export type PostInfoParam = {
    id: string, //key 값 (고유값)   -> firestore 자동생성
    authorUid:string, //
    title:string,
    forLove: boolean, //true 라면 연애가 목적인 글
    forFriendship: boolean, //true 라면 친구가 목적인 글
    description: string, // 사용자가 작성한 글
    userList: string[], //참여된 사용자 배열   -> string[] 사용자들의 id 저장
    chatRoute: string, //게시글에 참여하면 참가할 수 있는 대화창 주소
    maxUserCount:number,
};
