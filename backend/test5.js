const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// create a dummy pdf file for testing
const testPdfPath = path.join(__dirname, 'dummy.pdf');
fs.writeFileSync(testPdfPath, '%PDF-1.4\n%äüöß\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 55\n>>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000015 00000 n \n0000000064 00000 n \n0000000121 00000 n \n0000000295 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n400\n%%EOF');

const form = new FormData();
form.append('resume', fs.createReadStream(testPdfPath), 'dummy.pdf');

axios.post('http://127.0.0.1:5000/api/upload-resume', form, {
  headers: form.getHeaders()
})
  .then(res => {
    console.log('SUCCESS:', res.data);
    fs.unlinkSync(testPdfPath);
  })
  .catch(err => {
    if (err.response) {
      console.log('AXIOS RESPONSE ERROR:', err.response.status, JSON.stringify(err.response.data, null, 2));
    } else {
      console.log('AXIOS NETWORK ERROR:', err.message);
    }
    fs.unlinkSync(testPdfPath);
  });
