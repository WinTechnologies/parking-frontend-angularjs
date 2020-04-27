const express = require('express');
const path = require('path');
const compression = require('compression');

// Express server
const app = express();

const DIST_FOLDER = path.join(process.cwd(), 'dist');
const PORT = process.env.PORT || 4203;

app.use(compression());
app.use(express.static(DIST_FOLDER));
app.get('*', (req, res) => {
  res.sendFile(DIST_FOLDER + '/index.html');
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});

