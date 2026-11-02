import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dersYolu, kisaLink, konuUrl, sonGuncellemeler} from '../src/konu/yol.ts';

const k = {sinav: 'TYT' as const, dersSlug: 'kimya', slug: 'asit-ve-karbonat', medya: {seriNo: 4}, guncelleme: '2026-11-02'};

test('adresler', () => {
  assert.equal(konuUrl(k), '/tyt/kimya/asit-ve-karbonat/');
  assert.equal(dersYolu(k), '/tyt/kimya/');
  assert.equal(kisaLink(k), '/t4');
  assert.equal(kisaLink({...k, sinav: 'AYT'}), '/a4');
  assert.equal(kisaLink({...k, medya: {}}), undefined);
});

test('üst sayfaların lastmod tarihi en yeni konudur', () => {
  const m = sonGuncellemeler([k, {...k, slug: 'baska', guncelleme: '2026-11-05'}, {...k, sinav: 'AYT', guncelleme: '2026-10-01'}]);
  assert.equal(m.get('/'), '2026-11-05');
  assert.equal(m.get('/tyt/kimya/'), '2026-11-05');
  assert.equal(m.get('/tyt/kimya/asit-ve-karbonat/'), '2026-11-02');
  assert.equal(m.get('/ayt/'), '2026-10-01');
});
