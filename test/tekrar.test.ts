import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bugunuEkle, seriUzunlugu, sonrakiKayit, vadesiGelen} from '../src/lib/tekrar.ts';

const gun = new Date('2026-11-02T10:00:00Z');

test('Leitner: biliyordum yükseltir, bilmiyordum başa alır', () => {
  assert.deepEqual(sonrakiKayit(undefined, 'bildi', gun), {kutu: 1, sonraki: '2026-11-03'});
  assert.deepEqual(sonrakiKayit({kutu: 2, sonraki: ''}, 'bildi', gun), {kutu: 3, sonraki: '2026-11-09'});
  assert.deepEqual(sonrakiKayit({kutu: 4, sonraki: ''}, 'bildi', gun), {kutu: 4, sonraki: '2026-11-18'});
  assert.deepEqual(sonrakiKayit({kutu: 3, sonraki: ''}, 'emin', gun), {kutu: 3, sonraki: '2026-11-09'});
  assert.deepEqual(sonrakiKayit({kutu: 3, sonraki: ''}, 'bilmedi', gun), {kutu: 0, sonraki: '2026-11-02'});
});

test('vadesi gelen kartlar', () => {
  const kartlar = [{id: 'a'}, {id: 'b'}, {id: 'c'}];
  const kayit = {a: {kutu: 1, sonraki: '2026-11-03'}, b: {kutu: 1, sonraki: '2026-11-02'}};
  assert.deepEqual(vadesiGelen(kartlar, kayit, gun).map((x) => x.id), ['b', 'c']);
});

test('gün serisi', () => {
  assert.equal(seriUzunlugu(['2026-10-31', '2026-11-01', '2026-11-02'], gun), 3);
  assert.equal(seriUzunlugu(['2026-10-30', '2026-11-02'], gun), 1);
  assert.equal(seriUzunlugu(['2026-11-01'], gun), 0);
  assert.deepEqual(bugunuEkle(['2026-11-02'], gun), ['2026-11-02']);
  assert.deepEqual(bugunuEkle([], gun), ['2026-11-02']);
});
