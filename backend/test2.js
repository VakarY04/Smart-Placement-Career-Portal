const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const form = new FormData();
// Add a dummy file just to trigger multer correctly
form.append('resume', fs.createReadStream('.env'), 'test.pdf'); // Pretending it's a PDF

axios.post('http://localhost:5000/api/upload-resume', form, {
  headers: form.getHeaders()
})
  .then(res => console.log('SUCCESS:', res.data))
  .catch(err => {
    if (err.response) {
      console.log('AXIOS RESPONSE ERROR:', err.response.status, err.response.data);
    } else {
      console.log('AXIOS NETWORK ERROR:', err.message);
    }
  });
