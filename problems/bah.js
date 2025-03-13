const express = require('express');
const { Noco } = require('nocodb');

const app = express();

(async () => {
    app.use(await Noco.init({}));
    app.listen(8080, () => {
        console.log('NocoDB is running at http://localhost:8080');
    });
})();

