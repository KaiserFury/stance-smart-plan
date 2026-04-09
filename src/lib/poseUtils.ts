export function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export interface PostureFeedback {
  isCorrect: boolean;
  message: string;
  angle: number;
}

export function evaluateSquat(
  hip: { x: number; y: number },
  knee: { x: number; y: number },
  ankle: { x: number; y: number }
): PostureFeedback {
  const angle = calculateAngle(hip, knee, ankle);

  if (angle >= 70 && angle <= 100) {
    return { isCorrect: true, message: "Great squat depth! Hold it!", angle };
  } else if (angle > 100 && angle < 160) {
    return { isCorrect: false, message: "Bend your knees more", angle };
  } else if (angle >= 160) {
    return { isCorrect: true, message: "Standing — ready for next rep", angle };
  } else {
    return { isCorrect: false, message: "Too low! Come up a bit", angle };
  }
}

export function evaluatePushup(
  shoulder: { x: number; y: number },
  elbow: { x: number; y: number },
  wrist: { x: number; y: number }
): PostureFeedback {
  const angle = calculateAngle(shoulder, elbow, wrist);

  if (angle >= 70 && angle <= 110) {
    return { isCorrect: true, message: "Good pushup depth!", angle };
  } else if (angle > 110 && angle < 160) {
    return { isCorrect: false, message: "Go lower", angle };
  } else if (angle >= 160) {
    return { isCorrect: true, message: "Arms extended — ready", angle };
  } else {
    return { isCorrect: false, message: "Too low! Push up", angle };
  }
}
