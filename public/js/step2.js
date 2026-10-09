// public/js/step2.js

// Import cả hai tệp cấu hình
import { apiConfig } from './config.js';
// Note: uiConfig import removed as configs.js doesn't exist - this was causing import error

// --- Khai báo các biến và phần tử DOM ---
const guideSection = document.getElementById('guideSection');
const captureSection = document.getElementById('captureSection');
const confirmSection = document.getElementById('confirmSection');
const appLogo = document.getElementById('appLogo');
const startCaptureBtn = document.getElementById('startCaptureBtn');
const manualCaptureBtn = document.getElementById('manualCaptureBtn');
const confirmFinalBtn = document.getElementById('confirmFinalBtn');
const recaptureAllBtn = document.getElementById('recaptureAllBtn');
const video = document.getElementById('cameraVideo');
const captureTitle = document.getElementById('captureTitle');
const captureInstruction = document.getElementById('captureInstruction');
const frontPreview = document.getElementById('frontPreview');
const backPreview = document.getElementById('backPreview');
const submissionStatus = document.getElementById('submissionStatus');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');

let currentStream;
let frontImageDataUrl = null;
let backImageDataUrl = null;
let currentCaptureSide = 'front';

// --- Các hàm xử lý giao diện ---

function applyUiConfig() {
    // Default UI configuration since uiConfig is not available
    if (appLogo) {
        appLogo.src = appLogo.src || 'https://shinhan.com.vn/public/themes/shinhan/img/logo-01.svg';
    }
    // Apply default theme colors
    document.documentElement.style.setProperty('--primary-color', '#00A859');
    document.documentElement.style.setProperty('--secondary-color', '#001f3f');
}

function showSection(section) {
    guideSection.classList.add('hidden');
    captureSection.classList.add('hidden');
    confirmSection.classList.add('hidden');
    section.classList.remove('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    loader.classList.add('hidden');
    submissionStatus.classList.add('hidden');
    confirmFinalBtn.disabled = false;
}

function updateSubmissionStatus(message) {
    submissionStatus.textContent = message;
    submissionStatus.classList.remove('hidden');
    errorMessage.classList.add('hidden');
}

// --- Các hàm xử lý Camera ---
async function startCamera() {
    try {
        if (currentStream) currentStream.getTracks().forEach(track => track.stop());
        const constraints = { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } };
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        await video.play();
    } catch (err) {
        alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập và thử lại.");
        showSection(guideSection);
    }
}

function stopCamera() {
    if (currentStream) currentStream.getTracks().forEach(track => track.stop());
}

function captureImage() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
}

// --- Quy trình chụp ảnh ---
function startCaptureFlow(side) {
    currentCaptureSide = side;
    captureTitle.textContent = `Chụp mặt ${side === 'front' ? 'trước' : 'sau'} CCCD/CMND`;
    captureInstruction.textContent = `Vui lòng canh chỉnh giấy tờ vào giữa khung hình và nhấn "Chụp ảnh".`;
    showSection(captureSection);
    startCamera();
}

startCaptureBtn.addEventListener('click', () => startCaptureFlow('front'));

manualCaptureBtn.addEventListener('click', () => {
    if (currentCaptureSide === 'front') {
        frontImageDataUrl = captureImage();
        frontPreview.src = frontImageDataUrl;
        startCaptureFlow('back');
    } else {
        backImageDataUrl = captureImage();
        backPreview.src = backImageDataUrl;
        stopCamera();
        showSection(confirmSection);
    }
});

recaptureAllBtn.addEventListener('click', () => {
    frontImageDataUrl = null;
    backImageDataUrl = null;
    showSection(guideSection);
});

// --- Quy trình gọi API VNPT ---
async function dataURLtoFile(dataUrl, filename) {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
}

async function uploadImageAPI(imageDataUrl, title) {
    const imageFile = await dataURLtoFile(imageDataUrl, `${title}.jpg`);
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('title', title);
    const response = await fetch(`${apiConfig.VNPT_DOMAIN}/file-service/v1/addFile`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiConfig.ACCESS_TOKEN}`,
            'Token-Id': apiConfig.TOKEN_ID,
            'Token-Key': apiConfig.TOKEN_KEY,
        },
        body: formData,
    });
    const result = await response.json();
    if (!response.ok || result.message !== "IDG-00000000") {
        throw new Error(`Lỗi tải ảnh ${title}: ${result.message || response.statusText}`);
    }
    return result.object.hash;
}

async function ocrAPI(frontHash, backHash) {
    const payload = { img_front: frontHash, img_back: backHash, client_session: crypto.randomUUID(), type: -1, validate_postcode: true, token: crypto.randomUUID() };
    const response = await fetch(`${apiConfig.VNPT_DOMAIN}/ai/v1/ocr/id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiConfig.ACCESS_TOKEN}`, 'Token-Id': apiConfig.TOKEN_ID, 'Token-Key': apiConfig.TOKEN_KEY, 'mac-address': 'TEST1' },
        body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok || result.message !== "IDG-00000000") {
        throw new Error(`Lỗi bóc tách OCR: ${result.message || 'Lỗi không xác định'}`);
    }
    return result;
}

// --- Sự kiện nút xác nhận cuối cùng ---
confirmFinalBtn.addEventListener('click', async () => {
    confirmFinalBtn.disabled = true;
    loader.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    try {
        updateSubmissionStatus('Đang tải lên ảnh mặt trước...');
        const frontHash = await uploadImageAPI(frontImageDataUrl, 'id_front');
        updateSubmissionStatus('Đang tải lên ảnh mặt sau...');
        const backHash = await uploadImageAPI(backImageDataUrl, 'id_back');
        updateSubmissionStatus('Đang bóc tách thông tin...');
        const ocrResult = await ocrAPI(frontHash, backHash);
        
        localStorage.setItem('ekycOcrResult', JSON.stringify(ocrResult.object));
        localStorage.setItem('frontImageHash', frontHash);
        
        updateSubmissionStatus('Xác thực giấy tờ thành công! Đang chuyển hướng...');
        window.location.href = './step3.html'; 
    } catch (error) {
        console.error("eKYC process failed:", error);
        showError(error.message);
    }
});

// --- Khởi chạy khi trang được tải ---
document.addEventListener('DOMContentLoaded', () => {
    applyUiConfig();
});
