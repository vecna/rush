const axios = require('axios');

const dbName = 'examplos';
const apiUrl = `http://127.0.0.1:3123/2/io/${dbName}`;

const newEntry = {
    field1: 'Sample Field 1',
    field2: 'Sample Field 2'
};

axios.put(apiUrl, newEntry)
    .then(response => {
        console.log('Entry created with ID:', response.data.id);
    })
    .catch(error => {
        console.error('Error creating entry:', error.response ? error.response.data : error.message);
    });
