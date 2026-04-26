import { translations } from '../src/constants/i18n';

const vi = translations.vi;
const en = translations.en;
const viKeys = Object.keys(vi) as (keyof typeof vi)[];

describe('i18n completeness', () => {
  it('en has all keys that vi has', () => {
    const missing = viKeys.filter(k => !(k in en));
    expect(missing).toEqual([]);
  });

  it('vi has all keys that en has', () => {
    const enKeys = Object.keys(en) as (keyof typeof en)[];
    const missing = enKeys.filter(k => !(k in vi));
    expect(missing).toEqual([]);
  });

  it('no key has empty string value in vi', () => {
    const empty = viKeys.filter(k => vi[k] === '');
    expect(empty).toEqual([]);
  });

  it('no key has empty string value in en', () => {
    const enKeys = Object.keys(en) as (keyof typeof en)[];
    const empty = enKeys.filter(k => en[k] === '');
    expect(empty).toEqual([]);
  });

  it('no key is undefined in either language', () => {
    viKeys.forEach(k => {
      expect(vi[k]).toBeDefined();
      expect(en[k]).toBeDefined();
    });
  });

  it('vi and en have same number of keys', () => {
    expect(Object.keys(vi).length).toBe(Object.keys(en).length);
  });
});

describe('i18n unit labels', () => {
  it('vi has correct unit labels', () => {
    expect(vi.reps).toBe('lần');
    expect(vi.seconds).toBe('giây');
    expect(vi.minutes).toBe('phút');
    expect(vi.km).toBe('km');
    expect(vi.meters).toBe('m');
  });

  it('en has correct unit labels', () => {
    expect(en.reps).toBe('reps');
    expect(en.seconds).toBe('sec');
    expect(en.minutes).toBe('min');
    expect(en.km).toBe('km');
    expect(en.meters).toBe('m');
  });
});
