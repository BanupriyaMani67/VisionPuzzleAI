// Landmark indices follow MediaPipe Hands: wrist, finger joints, then fingertips.
const fingerTips = [8, 12, 16, 20];
const fingerPips = [6, 10, 14, 18];
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function isExtended(landmarks, tip, pip) { return distance(landmarks[tip], landmarks[0]) > distance(landmarks[pip], landmarks[0]) * 1.12; }
export function recognizeGesture(landmarks, history = []) {
  if (!landmarks?.length) return { name: 'NO HAND', confidence: 0 };
  const pinchDistance = distance(landmarks[4], landmarks[8]);
  const scale = distance(landmarks[0], landmarks[9]) || 0.1;
  const pinch = pinchDistance / scale < 0.58;
  const extended = fingerTips.map((tip, index) => isExtended(landmarks, tip, fingerPips[index]));
  const openPalm = extended.every(Boolean);
  const twoFingers = extended[0] && extended[1] && !extended[2] && !extended[3];
  const fist = extended.filter(Boolean).length === 0 && !pinch;
  let name = 'READY';
  if (pinch) name = 'PINCH'; else if (openPalm) name = 'OPEN PALM'; else if (fist) name = 'FIST'; else if (twoFingers) name = 'TWO FINGERS';
  const x = landmarks[9].x;
  const previous = history[history.length - 1];
  if (!pinch && previous && Math.abs(x - previous.x) > 0.16 && history.length >= 3) name = x > previous.x ? 'SWIPE RIGHT' : 'SWIPE LEFT';
  return { name, confidence: Math.round((pinch ? Math.max(0, 1 - pinchDistance / scale) : 0.72) * 100), x: landmarks[8].x, y: landmarks[8].y };
}
