import http from 'https';
import fs from 'fs';

http.get('https://web3.sidradex.pw/assets/sidra-BBJArZ7z.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('full_bundle.js', data);
    console.log('Saved full_bundle.js, length:', data.length);
  });
});
