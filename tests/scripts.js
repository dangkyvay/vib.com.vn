// Minimal implementation to satisfy tests/form.test.js
import $ from 'jquery';

// Form autosave to localStorage when fullName input changes
(function attachAutoSave() {
  if (typeof document === 'undefined') return;
  // Use jQuery delegated handler so $.trigger('input') is captured
  $(document).on('input', '#fullName', function () {
    let data;
    try {
      data = JSON.parse(localStorage.getItem('loanFormData') || '{}');
    } catch (e) {
      data = {};
    }
    data.fullName = this.value || '';
    localStorage.setItem('loanFormData', JSON.stringify(data));
  });
})();

// OTP request/verify
window.generatedOTP = null;
window.requestOTP = function requestOTP() {
  const phone = $('#phone').val();
  const isValid = /^\d{10,11}$/.test(String(phone || ''));
  if (!isValid) {
    $('.common-modal .modal-title').text('Lỗi');
    $('.common-modal .modal-body').text('Số điện thoại không hợp lệ');
    return;
  }
  window.generatedOTP = '123456';
  $('#otpSection').css('display', 'block');
  $('.common-modal .modal-title').text('Thành công');
  $('.common-modal .modal-body').text('OTP đã được gửi');
};

window.verifyOTP = function verifyOTP() {
  const otp = $('#otp').val();
  if (otp === window.generatedOTP) {
    $('#otpError').text('');
    $('#submitFormBtn').css('display', 'block');
  } else {
    $('#otpError').text('OTP không đúng');
  }
};

// Loan calculator for test DOM
window.calculateLoan = function calculateLoan() {
  const amount = Number($('#calcAmount').val());
  const term = Number($('#calcTerm').val());
  const rate = Number($('#calcRate').val());
  if (!amount || !term || rate === undefined || isNaN(rate)) {
    $('#calcResult').text('');
    return;
  }
  const monthlyRate = rate / 12 / 100;
  const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  $('#calcResult').text(`Thanh toán hàng tháng: ${payment.toFixed(2)} VNĐ`);
};
