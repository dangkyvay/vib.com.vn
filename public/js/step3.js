import { apiConfig } from './config.js';

const FaceCaptureApp = {
    state: {
        faceImageDataUrl: null,
        faceImageHash: null,
        faceVerified: false,
        currentStream: null,
        isAutoCapturing: false,
        autoCaptureTimeoutId: null,
        autoCaptureMaxTimeoutId: null,
        simulationAttempts: 0,
        isFaceDetected: false,
        cameraCanvasPreview: null,
        cameraCanvasContext: null,
        animationFrameId: null,
        matchResult: null,
    },
    elements: {},
    config: {
        AUTO_CAPTURE_INTERVAL: 2500,
        ERROR_MESSAGE_TIMEOUT: 5000,
        MAX_CAPTURE_TIMEOUT: 30000,
        API_BASE_URL: apiConfig.VNPT_DOMAIN,
        TOKEN_ID: apiConfig.TOKEN_ID,
        TOKEN_KEY: apiConfig.TOKEN_KEY,
        ACCESS_TOKEN: apiConfig.ACCESS_TOKEN,
        CLIENT_SESSION: `IOS_iphone13_ios16_Device_1.3.6_${crypto.randomUUID()}_${Math.floor(Date.now() / 1000)}`,
        FINAL_URL: 'pages/vi/complete.html'
    },

    async init() {
        this.cacheDOMElements();
        if (!('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)) {
            this.showPermanentError("Trình duyệt không hỗ trợ camera.");
            return;
        }
        this.addEventListeners();
        console.log("eKYC Step 3 initialized.");
        this.elements.startCaptureBtn.disabled = false;
        this.elements.initStatusMessage.textContent = "Hệ thống đã sẵn sàng!";
        this.elements.initStatusMessage.style.display = 'block';
        this.elements.initStatusMessage.style.color = 'var(--accent-color)';
    },

    cacheDOMElements() {
        const ids = ['guideSection', 'captureSection', 'startCaptureBtn', 'cameraFrame', 'cameraVideo', 'statusMessage', 'loader', 'errorMessage', 'manualCaptureBtn', 'recaptureBtn', 'captureInstruction', 'backButton', 'confirmSection', 'facePreview', 'redoFaceBtn', 'confirmFinalBtn', 'cameraCanvasPreview', 'initStatusMessage', 'matchResult', 'matchProbability'];
        ids.forEach(id => this.elements[id] = document.getElementById(id));
        this.state.cameraCanvasPreview = this.elements.cameraCanvasPreview;
        this.state.cameraCanvasContext = this.state.cameraCanvasPreview.getContext('2d');
    },

    addEventListeners() {
        this.elements.startCaptureBtn.addEventListener('click', () => this.startCaptureProcess());
        this.elements.manualCaptureBtn.addEventListener('click', () => this.triggerCapture(false));
        this.elements.recaptureBtn.addEventListener('click', () => this.startCaptureProcess());
        this.elements.backButton.addEventListener('click', () => this.cancelCapture());
        this.elements.redoFaceBtn.addEventListener('click', () => this.retakePhoto());
        this.elements.confirmFinalBtn.addEventListener('click', () => this.submitFinalData());
    },

    async startCaptureProcess() {
        this.state.simulationAttempts = 0;
        this.state.isFaceDetected = false;
        this.resetUIForCapture();
        await this.stopCamera();
        try {
            const constraints = {
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.state.currentStream = stream;
            this.elements.cameraVideo.srcObject = stream;
            this.elements.cameraVideo.onloadedmetadata = () => {
                const frame = this.elements.cameraFrame;
                this.state.cameraCanvasPreview.width = frame.offsetWidth;
                this.state.cameraCanvasPreview.height = frame.offsetHeight;
                this.drawVideoToCanvas();
                this.autoCaptureLoop();
            };
            await this.elements.cameraVideo.play();
        } catch (err) {
            console.error("Camera access error:", err);
            let message = "Không thể truy cập camera. Vui lòng kiểm tra quyền và thử lại.";
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                message = "Quyền truy cập camera bị từ chối. Vui lòng cấp quyền trong Cài đặt trình duyệt.";
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                message = "Không tìm thấy camera nào trên thiết bị của bạn.";
            }
            await this.showPermanentError(message);
        }
    },

    drawVideoToCanvas() {
        if (!this.state.currentStream || !this.state.currentStream.active) return;
        const { cameraCanvasPreview: canvas, cameraCanvasContext: context } = this.state;
        const video = this.elements.cameraVideo;
        const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
        const x = (canvas.width / 2) - (video.videoWidth / 2) * scale;
        const y = (canvas.height / 2) - (video.videoHeight / 2) * scale;
        context.drawImage(video, x, y, video.videoWidth * scale, video.videoHeight * scale);
        this.state.animationFrameId = requestAnimationFrame(() => this.drawVideoToCanvas());
    },

    autoCaptureLoop() {
        if (!this.state.currentStream || !this.state.currentStream.active || this.state.isAutoCapturing) return;

        if (!this.state.autoCaptureMaxTimeoutId) {
            this.state.autoCaptureMaxTimeoutId = setTimeout(() => {
                if (this.state.isAutoCapturing) return;
                this.showError("Không thể tự động chụp. Vui lòng nhấn nút 'Chụp ảnh'.", false);
                this.stopAutoCapture();
            }, this.config.MAX_CAPTURE_TIMEOUT);
        }

        const { isValid, message, isFaceDetected } = this.simulateValidation();
        this.state.isFaceDetected = isFaceDetected;
        this.setCameraFrameReady(isFaceDetected && isValid);
        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.style.display = 'block';

        if (isFaceDetected && isValid) {
            if (!this.state.autoCaptureTimeoutId) {
                this.state.autoCaptureTimeoutId = setTimeout(() => this.triggerCapture(true), this.config.AUTO_CAPTURE_INTERVAL);
            }
        } else {
            this.stopAutoCapture();
            setTimeout(() => this.autoCaptureLoop(), 500);
        }
    },

    triggerCapture(isAuto = false) {
        if (this.state.isAutoCapturing) return;
        this.state.isAutoCapturing = true;
        this.stopAutoCapture();
        if (this.state.animationFrameId) cancelAnimationFrame(this.state.animationFrameId);
        this.toggleUIState('loading');
        this.elements.cameraFrame.classList.add('blink-once');
        setTimeout(() => this.elements.cameraFrame.classList.remove('blink-once'), 500);
        this.handleImageVerification();
    },

    async handleImageVerification() {
        const imageDataUrl = this.elements.cameraCanvasPreview.toDataURL('image/jpeg', 0.9);
        this.state.isAutoCapturing = true;
        try {
            // Bước 1: Tải ảnh khuôn mặt lên
            const file = await this.dataURLtoFile(imageDataUrl, 'face.jpg');
            this.elements.statusMessage.textContent = 'Đang tải ảnh khuôn mặt...';
            const faceHash = await this.uploadImage(file, 'face_image', 'Khuôn mặt người dùng');

            // Bước 2: Kiểm tra tính sống động
            this.elements.statusMessage.textContent = 'Đang kiểm tra tính sống động...';
            const liveness = await this.checkLiveness(faceHash);
            if (liveness.liveness !== 'success') {
                throw new Error(liveness.liveness_msg || 'Ảnh khuôn mặt không hợp lệ.');
            }

            // Bước 3: So sánh khuôn mặt với ảnh CCCD
            this.elements.statusMessage.textContent = 'Đang so sánh khuôn mặt...';
            // Fix: Use correct localStorage key from step2.js
            const frontImageHash = localStorage.getItem('frontImageHash');
            if (!frontImageHash) {
                throw new Error('Không tìm thấy dữ liệu CCCD từ bước trước.');
            }
            const matchResult = await this.compareFace(frontImageHash, faceHash);

            this.state.faceImageDataUrl = imageDataUrl;
            this.state.faceImageHash = faceHash;
            this.state.faceVerified = true;
            this.state.matchResult = matchResult;

            this.toggleUIState('success');
            this.elements.statusMessage.textContent = 'Chụp ảnh khuôn mặt thành công!';
            setTimeout(() => this.showConfirmationScreen(), 1000);
            this.triggerHapticFeedback();
            this.setCameraFrameReady(false);
        } catch (error) {
            this.handleVerificationFailure(error.message || 'Lỗi xử lý ảnh khuôn mặt. Vui lòng thử lại.');
        }
    },

    async uploadImage(file, title, description) {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', title);
        formData.append('description', description);

        const response = await fetch(`${this.config.API_BASE_URL}/file-service/v1/addFile`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.ACCESS_TOKEN}`,
                'Token-Id': this.config.TOKEN_ID,
                'Token-Key': this.config.TOKEN_KEY
            },
            body: formData
        });

        if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
        const data = await response.json();
        if (data.message !== 'IDG-00000000') throw new Error(data.message);
        return data.object.hash;
    },

    async checkLiveness(imageHash) {
        const payload = {
            img: imageHash,
            client_session: this.config.CLIENT_SESSION,
            token: `random-token-${Date.now()}`
        };

        const response = await fetch(`${this.config.API_BASE_URL}/ai/v1/face/liveness`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.ACCESS_TOKEN}`,
                'Token-Id': this.config.TOKEN_ID,
                'Token-Key': this.config.TOKEN_KEY,
                'mac-address': 'CHECK1'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Liveness check failed: ${response.statusText}`);
        const data = await response.json();
        if (data.message !== 'IDG-00000000') throw new Error(data.message);
        return data.object;
    },

    async compareFace(frontImageHash, faceImageHash) {
        const payload = {
            img_front: frontImageHash,
            img_face: faceImageHash,
            client_session: this.config.CLIENT_SESSION,
            token: `random-token-${Date.now()}`
        };

        const response = await fetch(`${this.config.API_BASE_URL}/ai/v1/face/compare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.ACCESS_TOKEN}`,
                'Token-Id': this.config.TOKEN_ID,
                'Token-Key': this.config.TOKEN_KEY,
                'mac-address': 'CHECK1'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Face comparison failed: ${response.statusText}`);
        const data = await response.json();
        if (data.message !== 'IDG-00000000') throw new Error(data.message);
        return data.object;
    },

    simulateValidation() {
        this.state.simulationAttempts++;
        if (this.state.simulationAttempts < 3) return { isValid: false, message: "Đang tìm kiếm khuôn mặt...", isFaceDetected: false };
        if (this.state.simulationAttempts < 6) return { isValid: false, message: "Đã tìm thấy khuôn mặt. Vui lòng giữ yên...", isFaceDetected: true };
        return { isValid: true, message: "Sẵn sàng chụp! Giữ máy ổn định.", isFaceDetected: true };
    },

    handleVerificationFailure(message) {
        this.state.isAutoCapturing = false;
        this.showError(message || "Ảnh không rõ hoặc không nhận diện được. Vui lòng thử lại.", true);
        this.toggleUIState('error');
        if (this.state.currentStream) {
            this.state.simulationAttempts = 0;
            this.drawVideoToCanvas();
            this.autoCaptureLoop();
        }
    },

    async showConfirmationScreen() {
        this.stopCamera();
        this.elements.captureSection.classList.add('hidden');
        this.elements.confirmSection.classList.remove('hidden');
        this.elements.facePreview.src = this.state.faceImageDataUrl;
        this.elements.facePreview.addEventListener('click', () => this.showFullScreen(this.state.faceImageDataUrl));
        this.elements.matchResult.textContent = this.state.matchResult.result || 'Không xác định';
        this.elements.matchProbability.textContent = this.state.matchResult.prob ? `${this.state.matchResult.prob}%` : '-';
    },

    showFullScreen(imageDataUrl) {
        const modal = document.createElement('div');
        modal.className = 'fullscreen-modal';
        modal.innerHTML = `<img src="${imageDataUrl}" alt="Ảnh phóng to của khuôn mặt">`;
        modal.onclick = () => modal.remove();
        document.body.appendChild(modal);
    },

    async dataURLtoFile(dataUrl, filename) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
    },

    async submitFinalData() {
        const btn = this.elements.confirmFinalBtn;
        btn.disabled = true;
        btn.classList.add('is-loading');

        try {
            this.elements.statusMessage.textContent = 'Đang hoàn tất xác thực...';
            this.elements.statusMessage.style.display = 'block';

            localStorage.setItem('faceMatchResult', JSON.stringify(this.state.matchResult));

            window.location.href = this.config.FINAL_URL;
        } catch (error) {
            console.error('Submit error:', error);
            this.showError(`Lỗi xử lý: ${error.message}. Vui lòng thử lại.`, false);
            btn.disabled = false;
            btn.classList.remove('is-loading');
        }
    },

    retakePhoto() {
        this.elements.confirmSection.classList.add('hidden');
        this.state.faceImageDataUrl = null;
        this.state.faceImageHash = null;
        this.state.faceVerified = false;
        this.startCaptureProcess();
    },

    cancelCapture() {
        this.stopCamera();
        this.elements.captureSection.classList.add('hidden');
        this.elements.confirmSection.classList.add('hidden');
        this.elements.guideSection.classList.remove('hidden');
        this.elements.backButton.classList.add('hidden');
    },

    resetUIForCapture() {
        this.elements.guideSection.classList.add('hidden');
        this.elements.confirmSection.classList.add('hidden');
        this.elements.captureSection.classList.remove('hidden');
        this.elements.backButton.classList.remove('hidden');
        this.elements.captureSection.className = `capture-section state-capturing`;
        this.elements.captureInstruction.textContent = `Vui lòng đặt khuôn mặt vào khung hình.`;
        this.setCameraFrameReady(false);
        this.elements.errorMessage.classList.remove('visible');
        this.elements.statusMessage.style.display = 'none';
    },

    async stopCamera() {
        if (this.state.currentStream) {
            this.state.currentStream.getTracks().forEach(track => track.stop());
            this.state.currentStream = null;
        }
        this.elements.cameraVideo.srcObject = null;
        this.stopAutoCapture();
        if (this.state.animationFrameId) {
            cancelAnimationFrame(this.state.animationFrameId);
            this.state.animationFrameId = null;
        }
        if (this.state.cameraCanvasContext) {
            this.state.cameraCanvasContext.clearRect(0, 0, this.state.cameraCanvasPreview.width, this.state.cameraCanvasPreview.height);
        }
    },

    stopAutoCapture() {
        if (this.state.autoCaptureTimeoutId) clearTimeout(this.state.autoCaptureTimeoutId);
        if (this.state.autoCaptureMaxTimeoutId) clearTimeout(this.state.autoCaptureMaxTimeoutId);
        this.state.autoCaptureTimeoutId = null;
        this.state.autoCaptureMaxTimeoutId = null;
    },

    showError(message, autoHide) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.classList.add('visible');
        if (autoHide) setTimeout(() => this.elements.errorMessage.classList.remove('visible'), this.config.ERROR_MESSAGE_TIMEOUT);
    },

    async showPermanentError(message) {
        await this.stopCamera();
        this.elements.guideSection.innerHTML = `<div class="error-message visible" style="margin-bottom:20px;">${message}</div><button onclick="window.location.reload()" class="btn btn-primary">Thử lại</button>`;
        this.elements.guideSection.classList.remove('hidden');
        this.elements.captureSection.classList.add('hidden');
        this.elements.confirmSection.classList.add('hidden');
    },

    setCameraFrameReady(isReady) {
        this.elements.cameraFrame.classList.toggle('ready-to-capture', isReady);
    },

    triggerHapticFeedback() {
        if (navigator.vibrate) navigator.vibrate(50);
    },

    toggleUIState(state) {
        this.elements.captureSection.className = `capture-section state-${state}`;
        const msg = this.elements.statusMessage;
        if (msg) {
            msg.style.display = 'block';
            if (state === 'success') msg.textContent = `Đã lưu ảnh khuôn mặt.`;
            else if (state === 'loading') msg.textContent = "Đang xử lý...";
            else if (state === 'capturing' || state === 'error') msg.textContent = "";
            else msg.textContent = "";
        }
    }
};

document.addEventListener('DOMContentLoaded', () => FaceCaptureApp.init());

