const { describe, expect, it } = require('bun:test');
const { ADS_OPERATION_TABS, asItems, dateOffset } = require('./ads-operations');

describe('reklam operasyon merkezi', () => {
  it('zorunlu altı operasyon yüzeyini sunar', () => {
    expect(ADS_OPERATION_TABS.map((tab) => tab.key)).toEqual(['slots', 'packages', 'calendar', 'waitlist', 'requests', 'reports']);
  });

  it('API koleksiyonlarını güvenli biçimde normalize eder', () => {
    expect(asItems({ items: [{ id: 1 }, null, 'x'] })).toEqual([{ id: 1 }]);
    expect(asItems(null)).toEqual([]);
  });

  it('takvim tarih aralığını ISO gün olarak üretir', () => {
    expect(dateOffset(7, new Date('2026-08-13T12:00:00Z'))).toBe('2026-08-20');
  });
});
