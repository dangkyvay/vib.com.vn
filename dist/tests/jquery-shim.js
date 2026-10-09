// Load real jQuery from node_modules and export the instance
const $ = require('jquery/dist/jquery.js');
if (global.window) {
  global.window.$ = $;
  global.window.jQuery = $;
}
global.$ = $;
global.jQuery = $;

// Minimal jQuery Validation plugin shim used in tests
$.fn.validate = function(options = {}) {
  const settings = Object.assign(
    {
      rules: {},
      errorPlacement: function(error, element) {
        const nextError = element.next('.txt_error');
        nextError.text(error);
      },
    },
    options
  );

  const form = this;
  const validateField = (name, value, element) => {
    const rules = settings.rules[name] || {};
    let message = '';
    if (rules.required && (!value || value.toString().trim() === '')) {
      switch (name) {
        case 'fullName':
          message = 'Vui lòng nhập họ và tên.';
          break;
        case 'phone':
          message = 'Số điện thoại phải có 10-11 số.'; // default if empty
          break;
        case 'email':
          message = 'Email không hợp lệ.';
          break;
        case 'idPhoto':
          message = 'Vui lòng tải lên ảnh CCCD/CMND.';
          break;
        default:
          message = 'Trường này là bắt buộc.';
      }
    }
    if (!message && rules.minlength && value && value.toString().length < rules.minlength) {
      if (name === 'fullName') message = 'Vui lòng nhập họ và tên.';
      if (name === 'otp') message = '';
    }
    if (!message && rules.pattern && value) {
      const re = rules.pattern instanceof RegExp ? rules.pattern : new RegExp(rules.pattern);
      if (!re.test(value)) {
        if (name === 'phone') message = 'Số điện thoại phải có 10-11 số.';
      }
    }
    if (!message && rules.email && value) {
      const re = /[^@\s]+@[^@\s]+\.[^@\s]+/;
      if (!re.test(value)) message = 'Email không hợp lệ.';
    }
    if (!message && rules.min !== undefined && value) {
      if (Number(value) < rules.min) message = 'Giá trị quá nhỏ.';
    }

    // Place error via adapter that mimics jQuery element
    const jqElem = $(element);
    const errorAdapter = {
      appendTo: (target) => {
        let $target = $(target);
        if (!$target || $target.length === 0) {
          // create a placeholder if not exists right after the element
          const span = $('<span class="txt_error"></span>');
          jqElem.after(span);
          $target = span;
        }
        $target.text(message);
      },
      text: () => message,
    };
    settings.errorPlacement(errorAdapter, jqElem);
    return !message;
  };

  // Attach submit handler
  form.on('submit', function(e) {
    const elements = form.find('input, select, textarea').toArray();
    let allValid = true;
    elements.forEach((el) => {
      const name = el.getAttribute('name') || el.id;
      const value = $(el).val();
      const ok = validateField(name, value, el);
      allValid = allValid && ok;
    });
    if (!allValid) {
      e.preventDefault();
    }
  });

  return this;
};

module.exports = $;
