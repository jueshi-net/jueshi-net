const fs = require('fs');
const path = require('path');
const { createInterface } = require('readline');

const filePath = path.join(process.cwd(), 'data', 'allCountries.txt');
console.log('File exists:', fs.existsSync(filePath));
console.log('File size:', fs.statSync(filePath).size);

let count = 0;
let withPostal = 0;

const rl = createInterface({ 
  input: fs.createReadStream(filePath), 
  crlfDelay: Infinity 
});

rl.on('line', (line) => {
  count++;
  const parts = line.split('\t');
  if (parts.length >= 3 && parts[1]?.trim()) {
    withPostal++;
  }
  if (count % 500000 === 0) {
    console.log(`Processed: ${count}, With postal: ${withPostal}`);
  }
});

rl.on('close', () => {
  console.log(`\nDone! Total: ${count}, With postal: ${withPostal}`);
});
