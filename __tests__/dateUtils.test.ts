import {
  getDateString,
  getWeekDates,
  isLeapYear,
  getDaysInMonth,
  getDaysInYear,
  getCurrentPeriodBounds,
  getPeriodCount,
} from '../src/utils/dateUtils';

describe('getDateString', () => {
  it('formats date correctly', () => {
    expect(getDateString(new Date(2026, 3, 26))).toBe('2026-04-26');
  });

  it('pads single-digit month and day', () => {
    expect(getDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('handles December 31', () => {
    expect(getDateString(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('getWeekDates', () => {
  it('returns 7 dates starting from Monday', () => {
    const sunday = new Date(2026, 3, 26); // Sunday 26/04/2026
    const week = getWeekDates(sunday);
    expect(week).toHaveLength(7);
    expect(week[0].getDay()).toBe(1); // Monday
    expect(week[6].getDay()).toBe(0); // Sunday
  });

  it('Monday input returns same week', () => {
    const monday = new Date(2026, 3, 20); // Mon 20/04/2026
    const week = getWeekDates(monday);
    expect(getDateString(week[0])).toBe('2026-04-20');
    expect(getDateString(week[6])).toBe('2026-04-26');
  });

  it('Wednesday returns Mon-Sun of that week', () => {
    const wed = new Date(2026, 3, 22); // Wed 22/04/2026
    const week = getWeekDates(wed);
    expect(getDateString(week[0])).toBe('2026-04-20');
    expect(getDateString(week[6])).toBe('2026-04-26');
  });

  it('consecutive dates are exactly 1 day apart', () => {
    const ref = new Date(2026, 3, 15);
    const week = getWeekDates(ref);
    for (let i = 1; i < 7; i++) {
      const diff = week[i].getTime() - week[i - 1].getTime();
      expect(diff).toBe(24 * 60 * 60 * 1000);
    }
  });
});

describe('isLeapYear', () => {
  it('2024 is a leap year', () => expect(isLeapYear(2024)).toBe(true));
  it('2026 is not a leap year', () => expect(isLeapYear(2026)).toBe(false));
  it('2000 is a leap year (divisible by 400)', () => expect(isLeapYear(2000)).toBe(true));
  it('1900 is not a leap year (divisible by 100 but not 400)', () => expect(isLeapYear(1900)).toBe(false));
});

describe('getDaysInMonth', () => {
  it('April has 30 days', () => expect(getDaysInMonth(2026, 3)).toBe(30));
  it('January has 31 days', () => expect(getDaysInMonth(2026, 0)).toBe(31));
  it('February 2026 has 28 days (non-leap)', () => expect(getDaysInMonth(2026, 1)).toBe(28));
  it('February 2024 has 29 days (leap)', () => expect(getDaysInMonth(2024, 1)).toBe(29));
});

describe('getDaysInYear', () => {
  it('2026 has 365 days', () => expect(getDaysInYear(2026)).toBe(365));
  it('2024 has 366 days', () => expect(getDaysInYear(2024)).toBe(366));
});

describe('getCurrentPeriodBounds', () => {
  const fixedNow = new Date(2026, 3, 26, 12, 0, 0); // Sun 26/04/2026 noon

  describe('week range', () => {
    it('offset 0 returns current week Mon-Sun', () => {
      const { startMs, endMs } = getCurrentPeriodBounds('week', 0, fixedNow);
      expect(getDateString(new Date(startMs))).toBe('2026-04-20');
      expect(getDateString(new Date(endMs))).toBe('2026-04-26');
    });

    it('offset -1 returns previous week', () => {
      const { startMs, endMs } = getCurrentPeriodBounds('week', -1, fixedNow);
      expect(getDateString(new Date(startMs))).toBe('2026-04-13');
      expect(getDateString(new Date(endMs))).toBe('2026-04-19');
    });

    it('start is at 00:00:00 and end is at 23:59:59', () => {
      const { startMs, endMs } = getCurrentPeriodBounds('week', 0, fixedNow);
      const start = new Date(startMs);
      const end = new Date(endMs);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
    });
  });

  describe('month range', () => {
    it('offset 0 returns April 2026', () => {
      const { startMs, endMs } = getCurrentPeriodBounds('month', 0, fixedNow);
      expect(getDateString(new Date(startMs))).toBe('2026-04-01');
      expect(getDateString(new Date(endMs))).toBe('2026-04-30');
    });

    it('offset -1 returns March 2026', () => {
      const { startMs, endMs } = getCurrentPeriodBounds('month', -1, fixedNow);
      expect(getDateString(new Date(startMs))).toBe('2026-03-01');
      expect(getDateString(new Date(endMs))).toBe('2026-03-31');
    });

    it('handles February correctly', () => {
      const febNow = new Date(2026, 1, 15);
      const { endMs } = getCurrentPeriodBounds('month', 0, febNow);
      expect(getDateString(new Date(endMs))).toBe('2026-02-28');
    });
  });

  describe('year range', () => {
    it('offset 0 returns full 2026', () => {
      const { startMs, endMs } = getCurrentPeriodBounds('year', 0, fixedNow);
      expect(getDateString(new Date(startMs))).toBe('2026-01-01');
      expect(getDateString(new Date(endMs))).toBe('2026-12-31');
    });

    it('offset -1 returns 2025', () => {
      const { startMs } = getCurrentPeriodBounds('year', -1, fixedNow);
      expect(new Date(startMs).getFullYear()).toBe(2025);
    });
  });
});

describe('getPeriodCount', () => {
  const fixedNow = new Date(2026, 3, 26);

  it('week always returns 7', () => {
    expect(getPeriodCount('week', 0, fixedNow)).toBe(7);
    expect(getPeriodCount('week', -5, fixedNow)).toBe(7);
  });

  it('month returns days in that month', () => {
    expect(getPeriodCount('month', 0, fixedNow)).toBe(30); // April
    expect(getPeriodCount('month', -3, fixedNow)).toBe(31); // January
  });

  it('year returns 365 or 366', () => {
    expect(getPeriodCount('year', 0, fixedNow)).toBe(365); // 2026
    expect(getPeriodCount('year', -2, fixedNow)).toBe(366); // 2024 leap
  });

  it('uses current date when now not provided', () => {
    // Cover default parameter branch — result must be 7 for week regardless
    expect(getPeriodCount('week', 0)).toBe(7);
  });
});

describe('getCurrentPeriodBounds default parameter', () => {
  it('uses current date when now not provided', () => {
    const { startMs, endMs } = getCurrentPeriodBounds('week', 0);
    expect(endMs).toBeGreaterThan(startMs);
    // start should be a Monday at 00:00:00
    expect(new Date(startMs).getDay()).toBe(1);
  });
});
