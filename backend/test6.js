const axios = require('axios');

const payload = {
  cgpa: 8.5,
  skills: ["React", "Node"],
  interests: [],
  internships: [],
  certifications: [],
  bio: "Test bio"
};

axios.post("http://127.0.0.1:8000/recommend", payload)
  .then(res => console.log('SUCCESS:', res.data))
  .catch(err => {
    if (err.response) {
      console.log('PYTHON ERROR:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.log('NETWORK ERROR:', err.message);
    }
  });
