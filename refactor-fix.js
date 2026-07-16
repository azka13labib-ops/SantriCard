const fs = require('fs');
const path = require('path');

const dictionary = [
  { from: /AddSiswaModal/g, to: 'AddStudentModal' },
  { from: /EditSiswaModal/g, to: 'EditStudentModal' },
  { from: /AddPedagangModal/g, to: 'AddMerchantModal' },
  { from: /EditPedagangModal/g, to: 'EditMerchantModal' },
  { from: /AddOrtuModal/g, to: 'AddParentModal' },
  { from: /EditOrtuModal/g, to: 'EditParentModal' },
  { from: /SidebarOrtu/g, to: 'SidebarParent' },
  { from: /SidebarPedagang/g, to: 'SidebarMerchant' },
  { from: /OrtuLayout/g, to: 'ParentLayout' },
];

function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  const files = fs.readdirSync(directory);

  for (const file of files) {
    if (['node_modules', '.next', '.git'].includes(file)) continue;

    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else {
      if (['.tsx', '.ts'].includes(path.extname(file))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content;
        for (const rule of dictionary) {
          newContent = newContent.replace(rule.from, rule.to);
        }
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Fixed imports in: ${fullPath}`);
        }
      }
    }
  }
}

processDirectory(path.join(__dirname, 'santricard-fe', 'src'));
console.log("Fix complete.");
