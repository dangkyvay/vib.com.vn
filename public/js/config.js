// public/js/config.js

// CẢNH BÁO BẢO MẬT: Không lưu trữ token bí mật ở phía trình duyệt.
// Các trường bên dưới chỉ là nơi đọc cấu hình đã được tiêm vào thời điểm chạy
// (ví dụ qua `lib/env.js` hoặc được backend proxy hóa). Nếu không có, để trống.
// Hãy cấu hình một API proxy phía server để giữ bí mật token.
export const apiConfig = {
    // Đọc domain từ window.env nếu có, fallback an toàn
    VNPT_DOMAIN: (typeof window !== 'undefined' && window.env && window.env.apiUrl) || 'https://api.idg.vnpt.vn',

    // Các thông tin nhạy cảm phải được cung cấp an toàn tại runtime (không commit)
    ACCESS_TOKEN: (typeof window !== 'undefined' && window.env && window.env.accessToken) || '',
    TOKEN_ID: (typeof window !== 'undefined' && window.env && window.env.tokenId) || '',
    TOKEN_KEY: (typeof window !== 'undefined' && window.env && window.env.tokenKey) || ''
};

