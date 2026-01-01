/**
 * ISBN-10 to ISBN-13 Converter Utility Tests
 * 
 * Test cases based on official ISBN conversion algorithm
 */

import { convertISBN10ToISBN13, convertISBN13ToISBN10, normalizeISBN } from '../isbnConverter';

describe('ISBN Converter', () => {
    describe('normalizeISBN', () => {
        it('should remove hyphens and spaces from ISBN', () => {
            expect(normalizeISBN('978-0-306-40615-7')).toBe('9780306406157');
            expect(normalizeISBN('0-306-40615-2')).toBe('0306406152');
            expect(normalizeISBN('978 0 306 40615 7')).toBe('9780306406157');
        });

        it('should handle already normalized ISBN', () => {
            expect(normalizeISBN('9780306406157')).toBe('9780306406157');
            expect(normalizeISBN('0306406152')).toBe('0306406152');
        });
    });

    describe('convertISBN10ToISBN13', () => {
        it('should convert valid ISBN-10 to ISBN-13', () => {
            // Test case from official ISBN documentation
            expect(convertISBN10ToISBN13('0-306-40615-2')).toBe('9780306406157');
            expect(convertISBN10ToISBN13('0306406152')).toBe('9780306406157');
        });

        it('should handle another valid ISBN-10', () => {
            // Harry Potter example
            expect(convertISBN10ToISBN13('0439708184')).toBe('9780439708180');
        });

        it('should return null for invalid ISBN-10', () => {
            expect(convertISBN10ToISBN13('123')).toBeNull();
            expect(convertISBN10ToISBN13('abcdefghij')).toBeNull();
            expect(convertISBN10ToISBN13('12345678901')).toBeNull(); // 11 digits
        });

        it('should return null for ISBN-13 input', () => {
            expect(convertISBN10ToISBN13('9780306406157')).toBeNull();
        });
    });

    describe('convertISBN13ToISBN10', () => {
        it('should convert valid ISBN-13 with 978 prefix to ISBN-10', () => {
            expect(convertISBN13ToISBN10('978-0-306-40615-7')).toBe('0306406152');
            expect(convertISBN13ToISBN10('9780306406157')).toBe('0306406152');
        });

        it('should return null for ISBN-13 with 979 prefix', () => {
            // 979 prefix ISBN-13 cannot be converted to ISBN-10
            expect(convertISBN13ToISBN10('9791234567890')).toBeNull();
        });

        it('should return null for invalid ISBN-13', () => {
            expect(convertISBN13ToISBN10('123')).toBeNull();
            expect(convertISBN13ToISBN10('abcdefghijklm')).toBeNull();
        });

        it('should return null for ISBN-10 input', () => {
            expect(convertISBN13ToISBN10('0306406152')).toBeNull();
        });
    });
});
