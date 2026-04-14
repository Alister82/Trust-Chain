const fs = require('fs');
const path = require('path');

const basePath = 'd:\\user1\\alister\\projects\\TrustChain\\TrustChain\\frontend\\src\\app';
const dirs = ['login', 'register', 'wallet-setup'];

dirs.forEach(dir => {
  const fullPath = path.join(basePath, dir);
  
  // Create directory
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
  
  // Create page.tsx file
  const filePath = path.join(fullPath, 'page.tsx');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`Created file: ${filePath}`);
  }
});

console.log('\nDirectory structure created successfully!');
console.log('\nCreated:');
console.log('- d:\\user1\\alister\\projects\\TrustChain\\TrustChain\\frontend\\src\\app\\login\\page.tsx');
console.log('- d:\\user1\\alister\\projects\\TrustChain\\TrustChain\\frontend\\src\\app\\register\\page.tsx');
console.log('- d:\\user1\\alister\\projects\\TrustChain\\TrustChain\\frontend\\src\\app\\wallet-setup\\page.tsx');
