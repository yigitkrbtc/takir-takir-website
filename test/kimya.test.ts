import {test} from 'node:test';
import assert from 'node:assert/strict';
import {denge, gazMi, turAyristir, turBilgisi} from '../src/konu/kimya.ts';

test('formül ayrıştırma: katsayı, parantez, yük', () => {
  assert.deepEqual(turAyristir('2CH₃COOH'), {katsayi: 2, atomlar: {C: 2, H: 4, O: 2}, yuk: 0});
  assert.deepEqual(turAyristir('Ca(CH₃COO)₂'), {katsayi: 1, atomlar: {Ca: 1, C: 4, H: 6, O: 4}, yuk: 0});
  assert.equal(turAyristir('CO₃²⁻').yuk, -2);
  assert.equal(turAyristir('H⁺').yuk, 1);
  assert.equal(turAyristir('CO₂↑').atomlar.O, 2);
});

test('denge: dengeli ve dengesiz denklem', () => {
  assert.equal(denge('CaCO₃ + 2CH₃COOH → Ca(CH₃COO)₂ + H₂O + CO₂').dengeli, true);
  assert.equal(denge('CO₃²⁻ + 2H⁺ → H₂CO₃').dengeli, true);
  const r = denge('CaCO₃ + CH₃COOH → Ca(CH₃COO)₂ + H₂O + CO₂');
  assert.equal(r.dengeli, false);
  assert.match(r.neden!, /^C: sol 3, sağ 5$/);
  assert.match(denge('CO₃²⁻ + H⁺ → HCO₃').neden!, /yük/);
});

test('görsel kit yardımcıları', () => {
  assert.deepEqual(turBilgisi('2CH₃COO⁻'), {katsayi: 2, govde: 'CH₃COO⁻', yuk: -1});
  assert.equal(gazMi('CO₂'), true);
  assert.equal(gazMi('2H₂'), true);
  assert.equal(gazMi('H₂O'), false);
  assert.equal(gazMi('H₂CO₃'), false);
});

test('görsel kit: okunamayan metin çökertmez, faz eki ve ok tanınır', () => {
  assert.deepEqual(turBilgisi('ısı'), {katsayi: 1, govde: 'ısı', yuk: 0});
  assert.equal(gazMi('ısı'), false);
  assert.equal(gazMi('CO₂ (g)'), true);
  assert.equal(gazMi('2CO₂(g)'), true);
  assert.equal(gazMi('X↑'), true);
  assert.equal(gazMi('H₂O(l)'), false);
});
