/**
 * @jest-environment jsdom
 */
import $ from 'jquery';
import './scripts.js';

// Mock EmailJS
jest.mock('emailjs-com', () => ({
  init: jest.fn(),
  send: jest.fn().mockResolvedValue({ status: 200, text: 'OK' }),
}));

// Mock reCAPTCHA
global.grecaptcha = {
  getResponse: jest.fn().mockReturnValue('mock-recaptcha-response'),
  reset: jest.fn(),
};

// Mock FileReader for file uploads
global.FileReader = jest.fn().mockImplementation(() => ({
  readAsDataURL: jest.fn(),
  onload: null,
}));

describe('Loan Application Form', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="loanFormModal" class="modal fade">
        <div class="modal-dialog">
          <div class="modal-content">
            <form id="loanApplicationForm">
              <input type="text" id="fullName" name="fullName" />
              <span class="txt_error" id="fullNameError"></span>
              <input type="tel" id="phone" name="phone" />
              <span class="txt_error" id="phoneError"></span>
              <input type="email" id="email" name="email" />
              <span class="txt_error" id="emailError"></span>
              <input type="text" id="idNumber" name="idNumber" />
              <input type="number" id="loanAmount" name="loanAmount" />
              <input type="number" id="loanTerm" name="loanTerm" />
              <select id="loanType" name="loanType">
                <option value="">Chọn loại vay</option>
                <option value="Vay tiêu dùng">Vay tiêu dùng</option>
              </select>
              <input type="file" id="idPhoto" name="idPhoto" />
              <input type="file" id="atmPhoto" name="atmPhoto" />
              <div class="otp-section" id="otpSection" style="display: none;">
                <input type="text" id="otp" name="otp" />
                <button type="button" onclick="requestOTP()">Gửi OTP</button>
                <button type="button" onclick="verifyOTP()">Xác minh OTP</button>
                <span class="txt_error" id="otpError"></span>
              </div>
              <div class="g-recaptcha"></div>
              <span class="txt_error" id="recaptchaError"></span>
              <button type="submit" id="submitFormBtn">Gửi đăng ký</button>
              <input type="number" id="calcAmount" />
              <input type="number" id="calcTerm" />
              <input type="number" id="calcRate" value="11" />
              <button type="button" onclick="calculateLoan()">Tính toán</button>
              <p id="calcResult"></p>
            </form>
          </div>
        </div>
      </div>
      <div class="modal fade common-modal">
        <div class="modal-dialog">
          <div class="modal-content">
            <span class="modal-title"></span>
            <div class="modal-body"></div>
          </div>
        </div>
      </div>
    `;

    $('#loanApplicationForm').validate({
      rules: {
        fullName: { required: true, minlength: 2 },
        phone: { required: true, pattern: /^[0-9]{10,11}$/ },
        email: { required: true, email: true },
        idNumber: { required: true, minlength: 9 },
        loanAmount: { required: true, min: 1000000 },
        loanTerm: { required: true, min: 1 },
        loanType: { required: true },
        idPhoto: { required: true },
        atmPhoto: { required: true },
        otp: { required: true, minlength: 6 },
      },
      errorPlacement: function (error, element) {
        error.appendTo(element.next('.txt_error'));
      },
    });
  });

  test('should validate form fields correctly', () => {
    $('#fullName').val('');
    $('#phone').val('123');
    $('#email').val('invalid');
    $('#loanApplicationForm').submit();

    expect($('#fullNameError').text()).toBe('Vui lòng nhập họ và tên.');
    expect($('#phoneError').text()).toBe('Số điện thoại phải có 10-11 số.');
    expect($('#emailError').text()).toBe('Email không hợp lệ.');
  });

  test('should show OTP section after requesting OTP with valid phone', () => {
    $('#phone').val('01234567890');
    window.requestOTP();
    expect($('#otpSection').css('display')).toBe('block');
    expect($('.common-modal .modal-title').text()).toBe('Thành công');
  });

  test('should verify OTP correctly', () => {
    $('#phone').val('01234567890');
    window.requestOTP();
    $('#otp').val(window.generatedOTP);
    window.verifyOTP();
    expect($('#otpError').text()).toBe('');
    expect($('#submitFormBtn').css('display')).toBe('block');
  });

  test('should calculate loan payment correctly', () => {
    $('#calcAmount').val(10000000);
    $('#calcTerm').val(12);
    $('#calcRate').val(11);
    window.calculateLoan();
    expect($('#calcResult').text()).toMatch(/Thanh toán hàng tháng: \d+\.\d{2} VNĐ/);
  });

  test('should show error for invalid file upload', () => {
    $('#idPhoto').val('');
    $('#loanApplicationForm').submit();
    expect($('#idPhoto').next('.txt_error').text()).toBe('Vui lòng tải lên ảnh CCCD/CMND.');
  });

  test('should save form data to localStorage', () => {
    $('#fullName').val('Nguyen Van A');
    $('#fullName').trigger('input');
    const savedData = JSON.parse(localStorage.getItem('loanFormData'));
    expect(savedData.fullName).toBe('Nguyen Van A');
  });
});
