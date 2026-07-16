const fs = require('fs');
const path = require('path');

const dictionary = [
  // Folder & Route specific replacements (Frontend Next.js)
  { from: /\badmin\/siswa\b/g, to: 'admin/student' },
  { from: /\badmin\/pedagang\b/g, to: 'admin/merchant' },
  { from: /\badmin\/ortu\b/g, to: 'admin/parent' },
  { from: /\badmin\/topup\b/g, to: 'admin/topUp' },
  { from: /\badmin\/transaksi\b/g, to: 'admin/transaction' },
  { from: /\badmin\/laporan\b/g, to: 'admin/report' },

  { from: /\/api\/siswa/g, to: '/api/student' },
  { from: /\/api\/pedagang/g, to: '/api/merchant' },
  { from: /\/api\/ortu/g, to: '/api/parent' },
  { from: /\/api\/topup/g, to: '/api/topUp' },
  { from: /\/api\/transaksi/g, to: '/api/transaction' },
  { from: /\/api\/laporan/g, to: '/api/report' },
  { from: /\/api\/kartu/g, to: '/api/card' },

  // PascalCase (Classes, Components, Models, Controllers)
  { from: /\bSiswa(Controller|Resource|Seeder|Request|)\b/g, to: 'Student$1' },
  { from: /\bPedagang(Controller|Resource|Seeder|Request|)\b/g, to: 'Merchant$1' },
  { from: /\bOrtu(Controller|Resource|Seeder|Request|SiswaSeeder)\b/g, to: 'Parent$1' },
  { from: /\bKartu(Controller|Resource|Seeder|Request|)\b/g, to: 'Card$1' },
  { from: /\bTopup(Controller|Resource|Seeder|Request|)\b/g, to: 'TopUp$1' },
  { from: /\bTransaksi(Controller|Resource|Seeder|Request|)\b/g, to: 'Transaction$1' },
  { from: /\bLaporan(Controller|Resource|Seeder|Request|)\b/g, to: 'Report$1' },
  
  // Plural tables / variables
  { from: /\bsiswas\b/g, to: 'students' },
  { from: /\bpedagangs\b/g, to: 'merchants' },
  { from: /\bortus\b/g, to: 'parents' },
  { from: /\bkartus\b/g, to: 'cards' },
  { from: /\btopups\b/g, to: 'top_ups' },
  { from: /\btransaksis\b/g, to: 'transactions' },
  { from: /\blaporans\b/g, to: 'reports' },

  // CamelCase & snake_case exact words
  { from: /\bsiswa_id\b/g, to: 'student_id' },
  { from: /\bsiswa\b/g, to: 'student' },
  { from: /\bpedagang_id\b/g, to: 'merchant_id' },
  { from: /\bpedagang\b/g, to: 'merchant' },
  { from: /\bortu_id\b/g, to: 'parent_id' },
  { from: /\bortu\b/g, to: 'parent' },
  { from: /\bkartu_id\b/g, to: 'card_id' },
  { from: /\bkartu\b/g, to: 'card' },
  { from: /\btopup_id\b/g, to: 'top_up_id' },
  { from: /\btopup\b/g, to: 'topUp' },
  { from: /\btop_up\b/g, to: 'top_up' },
  { from: /\btransaksi_id\b/g, to: 'transaction_id' },
  { from: /\btransaksi\b/g, to: 'transaction' },
  
  // Custom states / variables in frontend
  { from: /\bsetSiswas\b/g, to: 'setStudents' },
  { from: /\bsetSiswa\b/g, to: 'setStudent' },
  { from: /\bfetchSiswa\b/g, to: 'fetchStudent' },
  { from: /\bSiswas\b/g, to: 'Students' },
  
  { from: /\bsetPedagangs\b/g, to: 'setMerchants' },
  { from: /\bsetPedagang\b/g, to: 'setMerchant' },
  { from: /\bfetchPedagang\b/g, to: 'fetchMerchant' },
  { from: /\bPedagangs\b/g, to: 'Merchants' },
  
  { from: /\bsetOrtus\b/g, to: 'setParents' },
  { from: /\bsetOrtu\b/g, to: 'setParent' },
  { from: /\bfetchOrtu\b/g, to: 'fetchParent' },
  { from: /\bOrtus\b/g, to: 'Parents' },

  { from: /\bsetTransaksis\b/g, to: 'setTransactions' },
  { from: /\bsetTransaksi\b/g, to: 'setTransaction' },
  { from: /\bfetchTransaksi\b/g, to: 'fetchTransaction' },
  { from: /\bTransaksis\b/g, to: 'Transactions' },
];

const fileDictionary = [
  { from: 'Siswa', to: 'Student' },
  { from: 'Pedagang', to: 'Merchant' },
  { from: 'Ortu', to: 'Parent' },
  { from: 'Kartu', to: 'Card' },
  { from: 'Topup', to: 'TopUp' },
  { from: 'Transaksi', to: 'Transaction' },
  { from: 'Laporan', to: 'Report' },
  { from: 'siswa', to: 'student' },
  { from: 'pedagang', to: 'merchant' },
  { from: 'ortu', to: 'parent' },
  { from: 'topup', to: 'topUp' },
  { from: 'transaksi', to: 'transaction' },
  { from: 'laporan', to: 'report' },
];

const ignoreDirs = ['node_modules', 'vendor', '.git', 'storage', 'bootstrap', '.next'];

function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  const files = fs.readdirSync(directory);

  for (const file of files) {
    if (ignoreDirs.includes(file)) continue;

    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
      // Rename directory if needed
      let newDirName = file;
      for (const rule of fileDictionary) {
        newDirName = newDirName.replace(rule.from, rule.to);
      }
      if (newDirName !== file) {
        const newFullPath = path.join(directory, newDirName);
        fs.renameSync(fullPath, newFullPath);
        console.log(`Renamed Dir: ${fullPath} -> ${newFullPath}`);
      }
    } else {
      // It's a file
      if (['.php', '.tsx', '.ts', '.css', '.md', '.json', '.env'].includes(path.extname(file)) || file === '.env') {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content;
        for (const rule of dictionary) {
          newContent = newContent.replace(rule.from, rule.to);
        }
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Modified: ${fullPath}`);
        }
      }

      // Rename file if needed
      let newFileName = file;
      for (const rule of fileDictionary) {
        newFileName = newFileName.replace(rule.from, rule.to);
      }
      if (newFileName !== file) {
        const newFullPath = path.join(directory, newFileName);
        fs.renameSync(fullPath, newFullPath);
        console.log(`Renamed File: ${fullPath} -> ${newFullPath}`);
      }
    }
  }
}

// Run for backend
processDirectory(path.join(__dirname, 'santricard-be', 'app'));
processDirectory(path.join(__dirname, 'santricard-be', 'database'));
processDirectory(path.join(__dirname, 'santricard-be', 'routes'));

// Run for frontend
processDirectory(path.join(__dirname, 'santricard-fe', 'src'));

console.log("Refactoring complete.");
