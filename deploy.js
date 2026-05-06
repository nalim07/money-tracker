/**
 * deploy.js — Auto Deploy ke cPanel via FTP/SFTP
 *
 * Cara pakai:
 *   npm run deploy
 *
 * Konfigurasi:
 *   Isi kredensial di file .env.deploy (JANGAN commit file ini)
 */

import { config as dotenvConfig } from "dotenv";
import FtpDeploy from "ftp-deploy";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.deploy (bukan .env default)
dotenvConfig({ path: path.join(__dirname, ".env.deploy") });


// ─── Validasi ENV ─────────────────────────────────────────────────────────────
const required = ["FTP_HOST", "FTP_USER", "FTP_PASS", "FTP_PATH"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`\n❌ ENV tidak lengkap di .env.deploy:`);
  missing.forEach((k) => console.error(`   • ${k} belum diisi`));
  console.error(`\n📄 Contoh isi .env.deploy:`);
  console.error(`   FTP_HOST=ftp.domainanda.com`);
  console.error(`   FTP_USER=cpanel_username`);
  console.error(`   FTP_PASS=cpanel_password`);
  console.error(`   FTP_PATH=/public_html/mooney\n`);
  process.exit(1);
}

// ─── Konfigurasi FTP ──────────────────────────────────────────────────────────
const config = {
  user: process.env.FTP_USER,
  password: process.env.FTP_PASS,
  host: process.env.FTP_HOST,
  port: parseInt(process.env.FTP_PORT || "21"),
  localRoot: path.join(__dirname, "dist"),
  remoteRoot: process.env.FTP_PATH,

  // Upload semua file dari dist/
  include: ["*", "**/*"],

  // Hapus file lama di server sebelum upload (bersih)
  deleteRemote: process.env.FTP_DELETE_REMOTE === "true",

  // Gunakan FTPS (FTP over TLS) — lebih aman
  forcePasv: true,
  sftp: process.env.FTP_PROTOCOL === "sftp",
};

// ─── Jalankan Deploy ──────────────────────────────────────────────────────────
const ftpDeploy = new FtpDeploy();
const startTime = Date.now();

console.log("\n🚀 Memulai proses deploy...");
console.log(`📦 Local  : ${config.localRoot}`);
console.log(`🌐 Remote : ${config.host}${config.remoteRoot}`);
console.log(`🔌 Port   : ${config.port}`);
console.log(`🗑️  Delete : ${config.deleteRemote ? "Ya (hapus file lama)" : "Tidak"}`);
console.log("─".repeat(50));

// Progress per file
ftpDeploy.on("uploading", (data) => {
  const pct = Math.round((data.transferredFileCount / data.totalFilesCount) * 100);
  const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
  process.stdout.write(
    `\r[${bar}] ${pct}% — ${data.filename.padEnd(40).slice(0, 40)}`
  );
});

ftpDeploy.on("uploaded", () => {
  // Kosongkan baris progress setelah selesai
});

ftpDeploy.on("log", (data) => {
  // Uncomment untuk debug verbose:
  // console.log("LOG:", data);
});

ftpDeploy.on("upload-error", (data) => {
  console.error(`\n⚠️  Gagal upload: ${data.filename}`);
  console.error(`   Error: ${data.err}`);
});

ftpDeploy
  .deploy(config)
  .then((result) => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n\n✅ Deploy berhasil!`);
    console.log(`   📁 File diupload : ${result.length}`);
    console.log(`   ⏱️  Waktu         : ${elapsed}s`);
    console.log(`   🌍 URL           : https://${process.env.FTP_HOST.replace(/^ftp\./, "")}\n`);
  })
  .catch((err) => {
    console.error(`\n\n❌ Deploy GAGAL!`);
    console.error(`   ${err.message || err}`);
    console.error(`\n💡 Tips:`);
    console.error(`   • Cek kredensial FTP di .env.deploy`);
    console.error(`   • Pastikan FTP_PATH sudah ada di cPanel (misal: /public_html)`);
    console.error(`   • Coba nonaktifkan firewall/VPN sementara\n`);
    process.exit(1);
  });
