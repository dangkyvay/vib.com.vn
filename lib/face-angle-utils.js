/**
 * Face Angle Utilities for eKYC
 * Tính toán và làm mượt góc nghiêng khuôn mặt
 * Version: 1.0.0
 * Date: 2025-11-10
 */

/**
 * Class để làm mượt giá trị góc nghiêng qua nhiều frames
 */
class RollSmoother {
  constructor(maxSamples = 5) {
    this.samples = [];
    this.max = maxSamples;
  }
  
  /**
   * Thêm giá trị mới và trả về giá trị trung bình
   * @param {number} value - Góc nghiêng (degrees)
   * @returns {number} Giá trị trung bình
   */
  push(value) {
    this.samples.push(value);
    if (this.samples.length > this.max) {
      this.samples.shift();
    }
    return this.mean();
  }
  
  /**
   * Tính giá trị trung bình
   * @returns {number}
   */
  mean() {
    if (!this.samples.length) return 0;
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }
  
  /**
   * Reset tất cả samples
   */
  reset() {
    this.samples = [];
  }
  
  /**
   * Lấy số lượng samples hiện tại
   * @returns {number}
   */
  get count() {
    return this.samples.length;
  }
}

/**
 * Tính góc nghiêng (roll) từ 2 điểm mắt
 * @param {Object} leftEye - {x, y} của mắt trái
 * @param {Object} rightEye - {x, y} của mắt phải
 * @returns {number} Góc nghiêng theo độ (positive = nghiêng phải)
 */
function computeRollDegrees(leftEye, rightEye) {
  if (!leftEye || !rightEye) return 0;
  
  const dy = rightEye.y - leftEye.y;
  const dx = rightEye.x - leftEye.x;
  const radians = Math.atan2(dy, dx);
  const degrees = radians * (180 / Math.PI);
  
  return degrees;
}

/**
 * Tính góc pitch (gật đầu) từ landmarks
 * @param {Object} landmarks - Face landmarks object
 * @returns {number} Góc pitch theo độ
 */
function computePitchDegrees(landmarks) {
  // Tính pitch từ nose tip và chin
  if (!landmarks || !landmarks.getNose || !landmarks.getJawOutline) {
    return 0;
  }
  
  const nose = landmarks.getNose();
  const jaw = landmarks.getJawOutline();
  
  if (!nose.length || !jaw.length) return 0;
  
  const noseTip = nose[3]; // Tip of nose
  const chin = jaw[8]; // Center of chin
  
  const dy = chin.y - noseTip.y;
  const expectedDistance = 80; // pixels, adjust based on face size
  
  // Approximate pitch calculation
  return ((dy - expectedDistance) / expectedDistance) * 30;
}

/**
 * Tính góc yaw (quay đầu trái/phải) từ landmarks
 * @param {Object} landmarks - Face landmarks object
 * @returns {number} Góc yaw theo độ
 */
function computeYawDegrees(landmarks) {
  if (!landmarks || !landmarks.getLeftEye || !landmarks.getRightEye || !landmarks.getNose) {
    return 0;
  }
  
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const nose = landmarks.getNose();
  
  if (!leftEye.length || !rightEye.length || !nose.length) return 0;
  
  // Lấy tâm mỗi mắt
  const leftEyeCenter = leftEye.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  leftEyeCenter.x /= leftEye.length;
  leftEyeCenter.y /= leftEye.length;
  
  const rightEyeCenter = rightEye.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  rightEyeCenter.x /= rightEye.length;
  rightEyeCenter.y /= rightEye.length;
  
  const noseTip = nose[3];
  const faceCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
  
  // Offset từ tâm mặt
  const offset = noseTip.x - faceCenterX;
  const eyeDistance = Math.abs(rightEyeCenter.x - leftEyeCenter.x);
  
  // Tính yaw (positive = quay phải)
  return (offset / eyeDistance) * 45; // Approximate
}

/**
 * Tạo thông báo hướng dẫn dựa trên góc nghiêng
 * @param {number} roll - Góc roll (degrees)
 * @param {number} pitch - Góc pitch (degrees)
 * @param {number} yaw - Góc yaw (degrees)
 * @param {Object} config - Configuration object
 * @returns {string} Thông báo hướng dẫn
 */
function getTiltGuidanceMessage(roll, pitch, yaw, config) {
  const messages = [];
  
  // Kiểm tra roll (nghiêng trái/phải)
  if (Math.abs(roll) > config.roll_hard_threshold) {
    if (roll > 0) {
      messages.push(`Đầu đang nghiêng phải ${Math.abs(roll).toFixed(0)}°. Xoay nhẹ sang trái.`);
    } else {
      messages.push(`Đầu đang nghiêng trái ${Math.abs(roll).toFixed(0)}°. Xoay nhẹ sang phải.`);
    }
  } else if (Math.abs(roll) > config.roll_soft_threshold) {
    messages.push(`Đầu hơi nghiêng ${Math.abs(roll).toFixed(0)}°. Cố gắng giữ thẳng.`);
  }
  
  // Kiểm tra pitch (gật đầu)
  if (Math.abs(pitch) > config.pitch_threshold) {
    if (pitch > 0) {
      messages.push('Ngẩng đầu lên một chút.');
    } else {
      messages.push('Cúi đầu xuống một chút.');
    }
  }
  
  // Kiểm tra yaw (quay đầu)
  if (Math.abs(yaw) > config.yaw_threshold) {
    if (yaw > 0) {
      messages.push('Quay mặt sang trái một chút.');
    } else {
      messages.push('Quay mặt sang phải một chút.');
    }
  }
  
  return messages.length > 0 ? messages.join(' ') : 'Rất tốt! Giữ nguyên tư thế.';
}

/**
 * Kiểm tra xem khuôn mặt có đạt yêu cầu không
 * @param {number} roll - Góc roll (degrees)
 * @param {number} pitch - Góc pitch (degrees)  
 * @param {number} yaw - Góc yaw (degrees)
 * @param {number} confidence - Độ tin cậy của detection
 * @param {Object} config - Configuration object
 * @returns {Object} {passed: boolean, reason: string}
 */
function validateFacePose(roll, pitch, yaw, confidence, config) {
  const result = {
    passed: true,
    reason: '',
    details: {}
  };
  
  // Kiểm tra confidence trước
  if (confidence < config.confidence_threshold) {
    result.passed = false;
    result.reason = 'Không nhận diện rõ khuôn mặt. Vui lòng di chuyển vào nơi sáng hơn.';
    result.details.confidence = confidence;
    return result;
  }
  
  // Kiểm tra roll
  if (Math.abs(roll) > config.roll_hard_threshold) {
    result.passed = false;
    result.reason = roll > 0 
      ? `Đầu nghiêng phải quá mức (${Math.abs(roll).toFixed(0)}°)`
      : `Đầu nghiêng trái quá mức (${Math.abs(roll).toFixed(0)}°)`;
    result.details.roll = roll;
    return result;
  }
  
  // Kiểm tra pitch
  if (Math.abs(pitch) > config.pitch_threshold) {
    result.passed = false;
    result.reason = pitch > 0 
      ? 'Đầu ngẩng quá cao'
      : 'Đầu cúi quá thấp';
    result.details.pitch = pitch;
    return result;
  }
  
  // Kiểm tra yaw
  if (Math.abs(yaw) > config.yaw_threshold) {
    result.passed = false;
    result.reason = yaw > 0 
      ? 'Mặt quay phải quá nhiều'
      : 'Mặt quay trái quá nhiều';
    result.details.yaw = yaw;
    return result;
  }
  
  result.reason = 'OK';
  return result;
}

/**
 * Lấy màu sắc indicator dựa trên góc nghiêng
 * @param {number} angle - Góc (degrees)
 * @param {number} softThreshold - Ngưỡng mềm
 * @param {number} hardThreshold - Ngưỡng cứng
 * @returns {string} Màu sắc (green, yellow, red)
 */
function getIndicatorColor(angle, softThreshold, hardThreshold) {
  const absAngle = Math.abs(angle);
  
  if (absAngle <= softThreshold) {
    return 'green';
  } else if (absAngle <= hardThreshold) {
    return 'yellow';
  } else {
    return 'red';
  }
}

// Export cho browser
if (typeof window !== 'undefined') {
  window.FaceAngleUtils = {
    RollSmoother,
    computeRollDegrees,
    computePitchDegrees,
    computeYawDegrees,
    getTiltGuidanceMessage,
    validateFacePose,
    getIndicatorColor
  };
}

// Export cho Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RollSmoother,
    computeRollDegrees,
    computePitchDegrees,
    computeYawDegrees,
    getTiltGuidanceMessage,
    validateFacePose,
    getIndicatorColor
  };
}
