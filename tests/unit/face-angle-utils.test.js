/**
 * Unit Tests for face-angle-utils.js
 * Version: 1.0.0
 * Date: 2025-11-10
 */

const {
  RollSmoother,
  computeRollDegrees,
  computePitchDegrees,
  computeYawDegrees,
  getTiltGuidanceMessage,
  validateFacePose,
  getIndicatorColor
} = require('../../lib/face-angle-utils');

describe('RollSmoother', () => {
  test('should initialize with default maxSamples of 5', () => {
    const smoother = new RollSmoother();
    expect(smoother.max).toBe(5);
    expect(smoother.count).toBe(0);
  });

  test('should initialize with custom maxSamples', () => {
    const smoother = new RollSmoother(3);
    expect(smoother.max).toBe(3);
  });

  test('should compute mean correctly', () => {
    const smoother = new RollSmoother(3);
    smoother.push(10);
    smoother.push(20);
    smoother.push(30);
    expect(smoother.mean()).toBe(20);
  });

  test('should limit samples to maxSamples', () => {
    const smoother = new RollSmoother(2);
    smoother.push(10);
    smoother.push(20);
    smoother.push(30);
    
    expect(smoother.count).toBe(2);
    expect(smoother.mean()).toBe(25); // (20 + 30) / 2
  });

  test('should return smoothed value from push', () => {
    const smoother = new RollSmoother(3);
    expect(smoother.push(10)).toBe(10);
    expect(smoother.push(20)).toBe(15);
    expect(smoother.push(30)).toBe(20);
  });

  test('should reset correctly', () => {
    const smoother = new RollSmoother(3);
    smoother.push(10);
    smoother.push(20);
    smoother.reset();
    
    expect(smoother.count).toBe(0);
    expect(smoother.mean()).toBe(0);
  });

  test('should handle empty samples', () => {
    const smoother = new RollSmoother(3);
    expect(smoother.mean()).toBe(0);
  });
});

describe('computeRollDegrees', () => {
  test('should return 0 for horizontal eyes', () => {
    const leftEye = { x: 100, y: 100 };
    const rightEye = { x: 200, y: 100 };
    const roll = computeRollDegrees(leftEye, rightEye);
    
    expect(Math.abs(roll)).toBeLessThan(0.1);
  });

  test('should return positive for right tilt (right eye higher)', () => {
    const leftEye = { x: 100, y: 100 };
    const rightEye = { x: 200, y: 80 }; // Right eye higher = head tilted right
    const roll = computeRollDegrees(leftEye, rightEye);
    
    expect(roll).toBeLessThan(0); // Negative when right eye is higher
  });

  test('should return negative for left tilt (left eye higher)', () => {
    const leftEye = { x: 100, y: 80 }; // Left eye higher = head tilted left
    const rightEye = { x: 200, y: 100 };
    const roll = computeRollDegrees(leftEye, rightEye);
    
    expect(roll).toBeGreaterThan(0); // Positive when left eye is higher
  });

  test('should handle null leftEye', () => {
    expect(computeRollDegrees(null, { x: 200, y: 100 })).toBe(0);
  });

  test('should handle null rightEye', () => {
    expect(computeRollDegrees({ x: 100, y: 100 }, null)).toBe(0);
  });

  test('should handle both null', () => {
    expect(computeRollDegrees(null, null)).toBe(0);
  });

  test('should compute approximate 45 degree tilt', () => {
    const leftEye = { x: 100, y: 100 };
    const rightEye = { x: 200, y: 200 }; // 45 degree angle
    const roll = computeRollDegrees(leftEye, rightEye);
    
    expect(roll).toBeCloseTo(45, 1);
  });
});

describe('getTiltGuidanceMessage', () => {
  const config = {
    roll_soft_threshold: 10,
    roll_hard_threshold: 15,
    pitch_threshold: 20,
    yaw_threshold: 20
  };

  test('should return OK message for good position', () => {
    const message = getTiltGuidanceMessage(5, 5, 5, config);
    expect(message).toContain('Rất tốt');
  });

  test('should warn about right tilt', () => {
    const message = getTiltGuidanceMessage(18, 0, 0, config);
    expect(message).toContain('phải');
    expect(message).toContain('trái'); // Suggestion to rotate left
  });

  test('should warn about left tilt', () => {
    const message = getTiltGuidanceMessage(-18, 0, 0, config);
    expect(message).toContain('trái');
    expect(message).toContain('phải'); // Suggestion to rotate right
  });

  test('should warn about slight tilt', () => {
    const message = getTiltGuidanceMessage(12, 0, 0, config);
    expect(message).toContain('hơi nghiêng');
  });

  test('should warn about head up', () => {
    const message = getTiltGuidanceMessage(0, 25, 0, config);
    expect(message).toContain('Ngẩng');
  });

  test('should warn about head down', () => {
    const message = getTiltGuidanceMessage(0, -25, 0, config);
    expect(message).toContain('Cúi');
  });

  test('should combine multiple warnings', () => {
    const message = getTiltGuidanceMessage(18, 25, 0, config);
    expect(message).toContain('phải');
    expect(message).toContain('Ngẩng');
  });
});

describe('validateFacePose', () => {
  const config = {
    roll_soft_threshold: 10,
    roll_hard_threshold: 15,
    pitch_threshold: 20,
    yaw_threshold: 20,
    confidence_threshold: 0.7
  };

  test('should pass for good pose', () => {
    const result = validateFacePose(5, 5, 5, 0.9, config);
    expect(result.passed).toBe(true);
    expect(result.reason).toBe('OK');
  });

  test('should fail for low confidence', () => {
    const result = validateFacePose(5, 5, 5, 0.5, config);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('Không nhận diện rõ');
  });

  test('should fail for excessive roll', () => {
    const result = validateFacePose(20, 0, 0, 0.9, config);
    expect(result.passed).toBe(false);
    expect(result.reason).toContain('nghiêng');
  });

  test('should fail for excessive pitch', () => {
    const result = validateFacePose(0, 25, 0, 0.9, config);
    expect(result.passed).toBe(false);
  });

  test('should fail for excessive yaw', () => {
    const result = validateFacePose(0, 0, 25, 0.9, config);
    expect(result.passed).toBe(false);
  });

  test('should pass for roll within soft threshold', () => {
    const result = validateFacePose(9, 0, 0, 0.9, config);
    expect(result.passed).toBe(true);
  });

  test('should pass for roll between soft and hard threshold', () => {
    const result = validateFacePose(12, 0, 0, 0.9, config);
    expect(result.passed).toBe(true); // Within hard threshold
  });

  test('should fail for roll beyond hard threshold', () => {
    const result = validateFacePose(16, 0, 0, 0.9, config);
    expect(result.passed).toBe(false);
  });
});

describe('getIndicatorColor', () => {
  test('should return green for angle within soft threshold', () => {
    expect(getIndicatorColor(5, 10, 15)).toBe('green');
  });

  test('should return yellow for angle within hard threshold', () => {
    expect(getIndicatorColor(12, 10, 15)).toBe('yellow');
  });

  test('should return red for angle beyond hard threshold', () => {
    expect(getIndicatorColor(18, 10, 15)).toBe('red');
  });

  test('should work with negative angles', () => {
    expect(getIndicatorColor(-5, 10, 15)).toBe('green');
    expect(getIndicatorColor(-12, 10, 15)).toBe('yellow');
    expect(getIndicatorColor(-18, 10, 15)).toBe('red');
  });

  test('should handle edge cases', () => {
    expect(getIndicatorColor(10, 10, 15)).toBe('green'); // At soft threshold should still be green (<=)
    expect(getIndicatorColor(10.1, 10, 15)).toBe('yellow'); // Just over soft threshold
    expect(getIndicatorColor(15, 10, 15)).toBe('yellow'); // At hard threshold should be yellow (<=)
    expect(getIndicatorColor(15.1, 10, 15)).toBe('red'); // Just over hard threshold
  });
});

describe('Edge Cases and Error Handling', () => {
  test('RollSmoother should handle negative values', () => {
    const smoother = new RollSmoother(3);
    smoother.push(-10);
    smoother.push(-20);
    smoother.push(-30);
    expect(smoother.mean()).toBe(-20);
  });

  test('computeRollDegrees should handle same point', () => {
    const point = { x: 100, y: 100 };
    const roll = computeRollDegrees(point, point);
    expect(roll).toBe(0);
  });

  test('validateFacePose should include details in result', () => {
    const config = {
      roll_soft_threshold: 10,
      roll_hard_threshold: 15,
      pitch_threshold: 20,
      yaw_threshold: 20,
      confidence_threshold: 0.7
    };
    
    const result = validateFacePose(20, 0, 0, 0.9, config);
    expect(result.details).toBeDefined();
    expect(result.details.roll).toBe(20);
  });
});
