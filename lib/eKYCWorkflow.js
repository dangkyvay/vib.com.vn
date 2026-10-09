import { VNPTBrowserSDKApp } from 'VNPTBrowserSDKAppV4.0.0.js';

// Mô tả chi tiết các bước trong luồng eKYC
const eKYCWorkflow = {
  // Bước 1: Nhập hình ảnh từ camera
  // - Yêu cầu quyền truy cập camera
  // - Hiển thị khung hướng dẫn căn chỉnh giấy tờ
  cameraInput: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      // Gán stream vào video element
      const videoElement = document.getElementById('cameraVideo');
      videoElement.srcObject = stream;
      // Đảm bảo video đã sẵn sàng
      await videoElement.play();
      // Trả về trạng thái thành công
      return { status: 'success', stream, videoElement };
    } catch (error) {
      console.error('Camera access failed:', error);
      return { status: 'error', message: 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.' };
    }
  },

  // Bước 2: Tải lên và xử lý giấy tờ
  // - Xử lý ảnh từ camera hoặc file upload
  // - Áp dụng OpenCV để phát hiện và căn chỉnh
  documentUpload: async (stream, captureType = 'idcard') => {
    if (!cv) throw new Error('OpenCV chưa được khởi tạo');

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const video = document.getElementById('cameraVideo');

    // Đặt kích thước canvas theo video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Chụp ảnh từ video
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);

    // Xử lý ảnh với OpenCV
    const img = new Image();
    img.src = imageDataUrl;
    await img.decode();

    const mat = cv.imread(img);
    const gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
    const edges = new cv.Mat();
    cv.Canny(gray, edges, 100, 200);

    // Phát hiện contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let maxArea = 0;
    let maxContourIdx = -1;
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      if (area > maxArea) {
        maxArea = area;
        maxContourIdx = i;
      }
    }

    let processedImage = imageDataUrl;
    if (maxArea > 5000 && maxContourIdx !== -1) {
      const contour = contours.get(maxContourIdx);
      const perimeter = cv.arcLength(contour, true);
      const approx = new cv.Mat();
      cv.approxPolyDP(contour, approx, 0.02 * perimeter, true);

      if (approx.rows === 4) {
        const warpedMat = eKYCWorkflow.warpPerspective(mat, approx);
        processedImage = eKYCWorkflow.matToDataUrl(warpedMat);
      }
      approx.delete();
    }

    // Giải phóng bộ nhớ
    mat.delete();
    gray.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();

    return { status: 'success', processedImage, captureType };
  },

  // Hàm phụ: Căn chỉnh ảnh bằng perspective transform
  warpPerspective: (srcMat, corners) => {
    const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
      corners.data32F[0], corners.data32F[1],
      corners.data32F[2], corners.data32F[3],
      corners.data32F[4], corners.data32F[5],
      corners.data32F[6], corners.data32F[7]
    ]);
    const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, 400, 0, 400, 250, 0, 250]);
    const M = cv.getPerspectiveTransform(srcPts, dstPts);
    const dstMat = new cv.Mat();
    cv.warpPerspective(srcMat, dstMat, M, new cv.Size(400, 250));
    srcPts.delete();
    dstPts.delete();
    M.delete();
    return dstMat;
  },

  // Hàm phụ: Chuyển Mat thành Data URL
  matToDataUrl: (mat) => {
    const canvas = document.createElement('canvas');
    canvas.width = mat.cols;
    canvas.height = mat.rows;
    cv.imshow(canvas, mat);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    mat.delete();
    return dataUrl;
  },

  // Bước 3: Xác minh qua SDK
  // - Sử dụng VNPTBrowserSDKAppV4.0.0.js
  // - Kiểm tra tính hợp lệ của giấy tờ
  sdkVerification: async (processedImage, captureType) => {
    try {
      const sdk = new VNPTBrowserSDKApp();
      const verificationResult = await sdk.verifyDocument({
        image: processedImage,
        documentType: captureType,
        ocr: true,
        confidenceThreshold: 0.9
      });

      if (!verificationResult.isValid) {
        throw new Error('Giấy tờ không hợp lệ');
      }

      return {
        status: 'success',
        data: {
          documentType: captureType,
          ocrData: verificationResult.ocrData,
          confidence: verificationResult.confidence
        }
      };
    } catch (error) {
      console.error('SDK verification failed:', error);
      return { status: 'error', message: 'Xác minh giấy tờ thất bại' };
    }
  },

  // Bước 4: Xác thực phía server
  // - Gửi dữ liệu lên server
  // - Nhận kết quả xác thực
  serverValidation: async (sdkData) => {
    try {
      const response = await fetch('/api/ekyc/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentData: sdkData,
          timestamp: new Date().toISOString(),
          clientId: 'ekyc-client-001'
        })
      });

      if (!response.ok) {
        throw new Error('Lỗi kết nối server');
      }

      const result = await response.json();
      return {
        status: result.isAuthenticated ? 'success' : 'error',
        result: {
          isAuthenticated: result.isAuthenticated,
          verificationId: result.verificationId,
          details: result.details
        }
      };
    } catch (error) {
      console.error('Server validation failed:', error);
      return { status: 'error', message: 'Lỗi xác thực server. Vui lòng thử lại.' };
    }
  },

  // Bước bổ sung: Xác thực khuôn mặt
  // - Sử dụng face-api.js để nhận diện khuôn mặt
  // - So sánh với ảnh trên giấy tờ
  faceVerification: async () => {
    if (!faceapi) throw new Error('FaceAPI chưa được khởi tạo');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      const videoElement = document.getElementById('faceVideo');
      videoElement.srcObject = stream;
      await videoElement.play();

      const canvas = document.getElementById('faceCanvas');
      faceapi.matchDimensions(canvas, { width: videoElement.clientWidth, height: videoElement.clientHeight });

      const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      stream.getTracks().forEach(track => track.stop());

      if (!detection) {
        throw new Error('Không phát hiện khuôn mặt');
      }

      return {
        status: 'success',
        faceDescriptor: detection.descriptor
      };
    } catch (error) {
      console.error('Face verification failed:', error);
      return { status: 'error', message: 'Xác thực khuôn mặt thất bại' };
    }
  }
};

// Hàm thực thi luồng eKYC hoàn chỉnh
export async function executeEKYCWorkflow(captureType = 'idcard') {
  try {
    // Bước 1: Lấy ảnh từ camera
    const cameraResult = await eKYCWorkflow.cameraInput();
    if (cameraResult.status !== 'success') {
      throw new Error(cameraResult.message);
    }

    // Bước 2: Xử lý ảnh giấy tờ
    const uploadResult = await eKYCWorkflow.documentUpload(cameraResult.stream, captureType);
    if (uploadResult.status !== 'success') {
      throw new Error('Xử lý ảnh thất bại');
    }

    // Bước 3: Xác minh qua SDK
    const sdkResult = await eKYCWorkflow.sdkVerification(uploadResult.processedImage, captureType);
    if (sdkResult.status !== 'success') {
      throw new Error(sdkResult.message);
    }

    // Bước 4: Xác thực khuôn mặt
    const faceResult = await eKYCWorkflow.faceVerification();
    if (faceResult.status !== 'success') {
      throw new Error(faceResult.message);
    }

    // Bước 5: Xác thực server
    const serverResult = await eKYCWorkflow.serverValidation({
      ...sdkResult.data,
      faceDescriptor: faceResult.faceDescriptor
    });
    if (serverResult.status !== 'success') {
      throw new Error(serverResult.message);
    }

    // Dừng camera sau khi hoàn tất
    if (cameraResult.stream) {
      cameraResult.stream.getTracks().forEach(track => track.stop());
    }

    // Trả về kết quả cuối cùng
    return {
      status: 'completed',
      result: {
        verificationId: serverResult.result.verificationId,
        documentType: captureType,
        details: serverResult.result.details
      }
    };
  } catch (error) {
    // Dừng camera nếu có lỗi
    const videoElement = document.getElementById('cameraVideo');
    if (videoElement && videoElement.srcObject) {
      videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
    throw error;
  }
}
