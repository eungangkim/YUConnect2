import { storage } from ".";

export async function uploadImageAsync(uri: string, path: string) {
  // path: 'profileImages/파일명.jpg' 형태
  const filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;
  const refPath = `${path}/${filename}`;

  await storage().ref(refPath).putFile(uri); // file:// 경로 그대로 사용 가능
  const downloadURL = await storage().ref(refPath).getDownloadURL();
  return downloadURL;
}