// Try puppeteer-core which doesn't need local installation
const http = require('http');

async function tryPuppeteerCore() {
  console.log('🔍 Checking for puppeteer-core...');
  
  // Check if it's available via npx
  const { exec } = require('child_process');
  
  return new Promise((resolve, reject) => {
    exec('npx --yes puppeteer-core --version', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ puppeteer-core not available via npx');
        resolve(false);
        return;
      }
      
      console.log('✅ puppeteer-core version:', stdout.trim());
      resolve(true);
    });
  });
}

tryPuppeteerCore().then(available => {
  if (available) {
    console.log('\nNow trying to use puppeteer-core...');
    // If available, we'd try to require it here
  } else {
    console.log('Falling back to text-based screenshots.');
  }
});
