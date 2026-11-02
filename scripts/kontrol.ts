// Konu paketi kontrolü: build öncesi çalışır, hata varsa site yayınlanmaz.
import {ayristir, hamPaketler} from '../src/konu/yukle.ts';
import {denetle} from '../src/konu/denetle.ts';

const {paketler, sorunlar} = ayristir(hamPaketler());
const {hatalar, uyarilar} = denetle(paketler);
const tum = [...sorunlar, ...hatalar];

for (const w of uyarilar) console.log(`uyarı  ${w}`);
for (const e of tum) console.log(`HATA   ${e}`);
console.log(`\n${paketler.length} paket, ${tum.length} hata, ${uyarilar.length} uyarı`);
if (tum.length) process.exit(1);
