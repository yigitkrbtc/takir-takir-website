import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parcala, terimId} from '../src/lib/terim.ts';

test('her terimin yalnız ilk geçtiği yer işaretlenir, uzun ad önce', () => {
  const p = parcala('Kalsiyum karbonat ve karbonat. Karbonat yine.', ['karbonat', 'kalsiyum karbonat']);
  const terimler = p.filter((x) => x.terim).map((x) => x.metin);
  assert.deepEqual(terimler, ['Kalsiyum karbonat', 'karbonat']);
  assert.equal(p.map((x) => x.metin).join(''), 'Kalsiyum karbonat ve karbonat. Karbonat yine.');
});

test('terim kimliği boşluksuz ve büyük/küçük harften bağımsız', () => {
  assert.equal(terimId('Hidrojen Gazı'), terimId('hidrojen gazı'));
  assert.equal(terimId('asetik asit'), 'terim-asetik-asit');
});
