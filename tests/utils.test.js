// tests/utils.test.js
// Simple tests for utility functions

// Load the utils module
const utils = require('../assets/js/utils.js');

describe('Utility Functions', () => {
    describe('formatNumber', () => {
        test('formats number with Vietnamese locale', () => {
            expect(utils.formatNumber(1000000)).toBe('1.000.000');
        });

        test('returns empty string for invalid input', () => {
            expect(utils.formatNumber(null)).toBe('');
            expect(utils.formatNumber(undefined)).toBe('');
            expect(utils.formatNumber('abc')).toBe('');
        });
    });

    describe('formatNumberInput', () => {
        test('removes non-digits and formats', () => {
            expect(utils.formatNumberInput('1000000')).toBe('1.000.000');
            expect(utils.formatNumberInput('1,000,000')).toBe('1.000.000');
        });

        test('returns empty string for empty input', () => {
            expect(utils.formatNumberInput('')).toBe('');
            expect(utils.formatNumberInput(null)).toBe('');
        });
    });

    describe('unformatNumber', () => {
        test('converts formatted string to number', () => {
            expect(utils.unformatNumber('1.000.000')).toBe(1000000);
            expect(utils.unformatNumber('1,000,000')).toBe(1000000);
        });

        test('returns 0 for invalid input', () => {
            expect(utils.unformatNumber('abc')).toBe(0);
        });
    });

    describe('generateContractId', () => {
        test('generates ID in correct format', () => {
            const id = utils.generateContractId();
            expect(id).toMatch(/^SHB-\d{8}-\d{6}$/);
        });

        test('generates unique IDs', () => {
            const id1 = utils.generateContractId();
            const id2 = utils.generateContractId();
            // Random parts should be different (very likely)
            expect(id1).not.toBe(id2);
        });
    });

    describe('generateRandomCode', () => {
        test('generates 6-digit code', () => {
            const code = utils.generateRandomCode();
            expect(code).toMatch(/^\d{6}$/);
        });
    });

    describe('getCurrentDate', () => {
        test('returns date in DD/MM/YYYY format', () => {
            const date = utils.getCurrentDate();
            expect(date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
        });
    });

    describe('getDateComponents', () => {
        test('parses date string correctly', () => {
            const result = utils.getDateComponents('25/12/2023');
            expect(result).toEqual({ day: '25', month: '12', year: '2023' });
        });

        test('returns empty components for invalid input', () => {
            const result = utils.getDateComponents('');
            expect(result).toEqual({ day: '', month: '', year: '' });
        });
    });

    describe('calculateInterestRate', () => {
        test('returns correct rate for different loan amounts', () => {
            expect(utils.calculateInterestRate(300000000)).toBe(10);
            expect(utils.calculateInterestRate(100000000)).toBe(11);
            expect(utils.calculateInterestRate(50000000)).toBe(11.5);
            expect(utils.calculateInterestRate(10000000)).toBe(12);
        });

        test('returns empty string for invalid input', () => {
            expect(utils.calculateInterestRate(null)).toBe('');
            expect(utils.calculateInterestRate('')).toBe('');
        });
    });

    describe('calculateMonthlyPayment', () => {
        test('calculates monthly payment correctly', () => {
            const payment = utils.calculateMonthlyPayment(100000000, 12, 12);
            // Should return a formatted string
            expect(typeof payment).toBe('string');
            expect(payment).toBeTruthy();
        });

        test('handles zero interest rate', () => {
            const payment = utils.calculateMonthlyPayment(12000000, 12, 0);
            expect(payment).toBe('1.000.000');
        });

        test('returns empty string for invalid input', () => {
            expect(utils.calculateMonthlyPayment(null, 12)).toBe('');
            expect(utils.calculateMonthlyPayment(100000000, null)).toBe('');
        });
    });

    describe('generateLoanCode', () => {
        test('generates code in correct format', () => {
            const code = utils.generateLoanCode();
            expect(code).toMatch(/^SHB-\d{8}-\d{6}$/);
        });
    });
});
