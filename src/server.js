const GIFEncoder = require('gifencoder');
const express = require('express');
const app = express();
const port = 6969;

app.post('/save-gif', () => {
  res.send('you wish');
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});