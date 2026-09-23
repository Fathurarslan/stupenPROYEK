import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { FOLDER_UNGGAH, hapusBerkas, namaBerkasDariUrl } from "../middleware/unggah.js";
import { urlYangTerpakai } from "../utils/berkas.js";
import pool from "./pool.js";

// Penyapu berkas unggahan yang tidak dirujuk baris mana pun di database.
//
// Sejak rute hapus dan ubah ikut membuang berkasnya sendiri, seharusnya tidak
// ada berkas yatim baru. Perintah ini untuk membereskan yang sudah telanjur
// menumpuk sebelum itu, dan sebagai pemeriksaan berkala.
//
//   npm run berkas:sapu            -> hanya melaporkan, tidak menghapus apa pun
//   npm run berkas:sapu -- --hapus -> benar-benar menghapus
//
// Bawaannya sengaja TIDAK menghapus: perintah yang menghapus berkas sebaiknya
// diminta secara sadar, bukan kebetulan terpanggil.

const benarHapus = process.argv.includes("--hapus");

// Berkas yang baru diunggah tapi kabarnya belum disimpan akan terlihat yatim
// padahal admin masih mengetik di formulir. Yang lebih muda dari ini dilewati.
const UMUR_AMAN_JAM = 24;

const diDisk = (await readdir(FOLDER_UNGGAH)).filter((nama) => nama !== ".gitkeep");
const terpakai = await urlYangTerpakai();
const namaTerpakai = new Set(
    [...terpakai].map(namaBerkasDariUrl).filter((n): n is string => n !== null)
);

const batasWaktu = Date.now() - UMUR_AMAN_JAM * 60 * 60 * 1000;
const yatim: string[] = [];
const masihBaru: string[] = [];
let byteYatim = 0;

for (const nama of diDisk) {
    if (namaTerpakai.has(nama)) continue;

    const info = await stat(join(FOLDER_UNGGAH, nama));
    if (info.mtimeMs > batasWaktu) {
        masihBaru.push(nama);
        continue;
    }
    yatim.push(nama);
    byteYatim += info.size;
}

console.log(`Berkas di disk        : ${diDisk.length}`);
console.log(`Dirujuk database      : ${namaTerpakai.size}`);
console.log(`Baru (< ${UMUR_AMAN_JAM} jam, dilewati): ${masihBaru.length}`);
console.log(`Yatim                 : ${yatim.length} (${(byteYatim / 1024 / 1024).toFixed(2)} MB)`);

if (yatim.length > 0) {
    console.log();
    for (const nama of yatim) console.log(`  ${nama}`);
}

if (yatim.length === 0) {
    console.log("\nTidak ada yang perlu disapu.");
} else if (benarHapus) {
    await Promise.all(yatim.map(hapusBerkas));
    console.log(`\n${yatim.length} berkas dihapus.`);
} else {
    console.log("\nTidak ada yang dihapus. Jalankan dengan --hapus kalau daftar di atas sudah benar:");
    console.log("  npm run berkas:sapu -- --hapus");
}

await pool.end();
