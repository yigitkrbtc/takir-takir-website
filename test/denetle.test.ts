import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ayristir, hamPaketler} from '../src/konu/yukle.ts';
import {denetle} from '../src/konu/denetle.ts';
import type {Konu} from '../src/konu/schema.ts';

// Gerçek paket temiz geçmeli; bozulan her kural tek tek yakalanmalı.
const {paketler, sorunlar} = ayristir(hamPaketler());
const asil = paketler[0];
const bozuk = (degistir: (k: Konu) => void) => {
  const k = structuredClone(asil.k);
  degistir(k);
  return denetle([{dosya: asil.dosya, k}]);
};

test('mevcut paketler şemaya uyar ve hatasızdır', () => {
  assert.deepEqual(sorunlar, []);
  assert.ok(paketler.length > 0);
  assert.deepEqual(denetle(paketler).hatalar, []);
});

test('dengesiz kural formülü yakalanır', () => {
  const r = bozuk((k) => (k.kural.formul = 'CaCO₃ + CH₃COOH → Ca(CH₃COO)₂ + H₂O + CO₂'));
  assert.ok(r.hatalar.some((h) => h.includes('kural.formul dengesiz')));
});

test('sözlükle çelişen terim formülü yakalanır', () => {
  const r = bozuk((k) => (k.terimler.find((t) => t.ad === 'asetat')!.formul = 'CH₃COO'));
  assert.ok(r.hatalar.some((h) => h.includes('terim "asetat"')));
});

test('metinde geçip terimlerde olmayan kimyasal ad yakalanır', () => {
  const r = bozuk((k) => (k.sorular[0].cevap += ' Sodyum hidroksit ise bazdır.'));
  assert.ok(r.hatalar.some((h) => h.includes('"sodyum hidroksit"')));
});

test('doğrulanmamış iddia (belirsiz, yanlış, bekliyor) yayını durdurur', () => {
  for (const durum of ['belirsiz', 'yanlis', 'bekliyor'] as const) {
    const r = bozuk((k) => (k.iddialar[0].durum = durum));
    assert.ok(r.hatalar.some((h) => h.includes(`${durum}: yayınlanamaz`)), durum);
  }
});

test('çalışma klasöründen bağımsız okur', () => {
  const once = process.cwd();
  process.chdir('/');
  try {
    assert.equal(hamPaketler().length, paketler.length);
  } finally {
    process.chdir(once);
  }
});

test('olmayan bağlantı ve çakışan kısa link yakalanır', () => {
  const k2 = structuredClone(asil.k);
  k2.id = 'ikinci';
  const r = denetle([
    {dosya: asil.dosya, k: {...structuredClone(asil.k), sonraki: ['yok-boyle-konu']}},
    {dosya: 'ikinci.json', k: k2},
  ]);
  assert.ok(r.hatalar.some((h) => h.includes('bağlantı "yok-boyle-konu" yok')));
  assert.ok(r.hatalar.some((h) => h.includes('kısa link /t4 iki pakette')));
});

test('şemaya uymayan paket ayrıştırmada ayrılır', () => {
  const r = ayristir([{dosya: 'x.json', veri: {...structuredClone(asil.k), ozet: 'x'.repeat(400)}}]);
  assert.equal(r.paketler.length, 0);
  assert.ok(r.sorunlar.some((s) => s.startsWith('x.json: ozet')));
});
