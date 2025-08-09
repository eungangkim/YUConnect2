import { auth, storage } from ".";

export async function uploadImageToStoarage(uri: string, path: string) {
  // path: 'profileImages/파일명.jpg' 형태

  const filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;
  const refPath = `${path}/${filename}`;

  await storage().ref(refPath).putFile(uri); // file:// 경로 그대로 사용 가능
  return refPath;
}

export async function getDownloadURL(refPath:string){
    return await storage().ref(refPath).getDownloadURL();
}

export async function deleteImageFromStorage(refPath:string) {
  await storage().ref(refPath).delete();
}