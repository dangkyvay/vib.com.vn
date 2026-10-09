<script>
  window.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // === PHIÊN BẢN THỬ NGHIỆM =======================================
    // =================================================================
    // Bật chế độ thử nghiệm để bỏ qua kiểm tra và chuyển hướng ngay
    const IS_TEST_MODE = true;

    // !!! QUAN TRỌNG: Dán ACCESS_TOKEN mới và còn hạn của bạn vào đây
    const ACCESS_TOKEN = 'DÁN_ACCESS_TOKEN_MỚI_CỦA_BẠN_VÀO_ĐÂY';
    // =================================================================

    /**
     * Hàm hiển thị thông báo.
     */
    function showProfessionalMessage(title, message, showSpinner = false) {
      const overlay = document.getElementById('professional-modal-overlay');
    const titleEl = document.getElementById('professional-modal-title');
    const messageEl = document.getElementById('professional-modal-message');
    const spinnerEl = document.getElementById('professional-modal-spinner');

    titleEl.textContent = title;
    messageEl.textContent = message;
    spinnerEl.style.display = showSpinner ? 'block' : 'none';

    overlay.style.display = 'flex';
      setTimeout(() => overlay.classList.add('visible'), 10);
    }

    // Hàm callback này được thiết kế cho chế độ thử nghiệm
    const CALL_BACK_END_FLOW = (result) => {
        console.log('eKYC callback nhận được:', result);

    // Khi ở chế độ thử nghiệm, chúng ta không kiểm tra kết quả chi tiết.
    // Chỉ cần SDK gọi lại là chúng ta sẽ chuyển hướng.
    if (IS_TEST_MODE) {
        console.log('CHẾ ĐỘ THỬ NGHIỆM: Bỏ qua kiểm tra, thực hiện chuyển hướng.');
    const sdkContainer = document.getElementById('ekyc_sdk_intergrated');
    if (sdkContainer) {
        sdkContainer.style.display = 'none';
            }
    showProfessionalMessage('Hoàn tất!', 'Đang chuyển hướng bạn đến bước tiếp theo...', true);
            setTimeout(() => {
        window.location.href = 'pages/vi/step4.html'; 
            }, 2000);

        } else {
        // Logic cho chế độ thực tế sẽ nằm ở đây (bạn sẽ tích hợp sau)
        console.log('Chế độ thực tế đang tắt.');
        }
    };

    // Kiểm tra xem token đã được cập nhật chưa
    if (ACCESS_TOKEN === 'DÁN_ACCESS_TOKEN_MỚI_CỦA_BẠN_VÀO_ĐÂY') {
        showProfessionalMessage('Cảnh báo', 'Vui lòng cập nhật ACCESS_TOKEN mới trong mã nguồn để tiếp tục.');
    return;
    }

    const dataConfig = {
        BACKEND_URL: "https://api.idg.vnpt.vn",
    TOKEN_KEY: "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMxOJVBGwpOeSFmfi0E02+EnXEoD3vWehNHUUSr1ob9I55gP132hfViwRxnYMRL/fZbOzBLGoHElIl2m87ebQFkCAwEAAQ==",
    TOKEN_ID: "384b4517-af4e-391c-e063-62199f0a23e6",
    ACCESS_TOKEN: ACCESS_TOKEN,
    CALL_BACK_END_FLOW: CALL_BACK_END_FLOW,
    HAS_RESULT_SCREEN: false,
    HAS_BACKGROUND_IMAGE: true,
    LIST_TYPE_DOCUMENT: [-1, 4, 5, 6, 7, 9],
    CHECK_LIVENESS_CARD: true,
    CHECK_LIVENESS_FACE: true,
    CHECK_MASKED_FACE: true,
    COMPARE_FACE: true,
    };

    setTimeout(() => {
      if (window.SDK && typeof window.SDK.launch === 'function') {
        console.log('Đang khởi chạy SDK ở chế độ thử nghiệm...');
    window.SDK.launch(dataConfig);
      } else {
        console.error('Không tìm thấy VNPT eKYC SDK (window.SDK).');
    showProfessionalMessage('Lỗi hệ thống', 'Không thể tải dịch vụ xác thực. Vui lòng kiểm tra lại các tệp script và thử lại.', false);
      }
    }, 200);
  });
</script>
