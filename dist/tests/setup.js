// JSDOM setup and globals
import $ from './jquery-shim';

global.$ = $;

global.bootstrap = {
  Tooltip: function() {}
};

// Minimal grecaptcha mock if any code references it implicitly
if (!global.grecaptcha) {
  global.grecaptcha = {
    getResponse: jest.fn(() => 'mock-recaptcha-response'),
    reset: jest.fn(),
  };
}
