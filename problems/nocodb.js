(async () => {
  try {
    const express = require(‘express’);
    const app = express();
    const { Noco } = require(‘nocodb’);
    const port = process.env.PORT || 8080;
    const httpServer = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Initialize NocoDB
    app.use(await Noco.init({}, httpServer, app));

    // Define root route
    app.get('/', (req, res) => {
      res.redirect('/dashboard');
    });

    console.log(`Visit: http://localhost:${port}/dashboard`);

  } catch (e) {
    console.error(e);
  }
})();