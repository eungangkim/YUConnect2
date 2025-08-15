/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// 알림 전송 함수: HTTP 요청으로 호출
exports.sendNotification = functions.https.onRequest(async (req, res) => {
  const { tokens, title, body } = req.body;

  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    console.error("❌ 유효하지 않은 토큰 배열:", tokens);
    return res.status(400).send("잘못된 요청: 토큰이 없습니다.");
  }
  if (!title) {
    console.error("❌ 누락된 필드:", { title });
    return res.status(400).send("잘못된 요청: 필드 누락");
  }
  try {
    // 사용자 문서에서 FCM 토큰 가져오기
    

    // FCM 메시지 구성
    
    if (tokens.length === 1) {
      const message = {
        token: tokens[0],
        notification: {
          title: title,
          body: body
      }};
      const response = await admin.messaging().send(message);
      console.log("✅ 단일 알림 전송 성공:", response);
      } else {
        const message = {
          tokens,
          notification: {
            title: title,
            body: body
          }
        };
      const response = await admin.messaging().sendMulticast(message);
      console.log(`✅ 알림 전송: 성공 ${response.successCount}, 실패 ${response.failureCount}`);
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`❌ 토큰 ${tokens[idx]} 전송 실패:`, resp.error);
        }
      });cd
    }

    return res.status(200).send("✅ 알림 전송 완료");
  } catch (error) {
    console.error("❌ 알림 전송 실패입니다.:", error);
    return res.status(500).send("서버 오류");
  }
});

