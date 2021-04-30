const GIFEncoder = require('gifencoder');
const express = require('express');
const { createCanvas } = require('canvas');
const bodyParser = require('body-parser');
const app = express();
const port = 6969;

const encoder = new GIFEncoder(34, 34);

app.use(bodyParser.json({limit: '20mb'}));

app.use('/', express.static('public'));
app.use('/token-maker', express.static('public'));

app.post('/save-gif', saveGif);
app.post('/token-maker/save-gif', saveGif);

const saveGif = (request, response) => {
  const frames = request.body;
  encoder.start()
  encoder.setRepeat(0)
  encoder.setDelay(200)
  encoder.setQuality(1)
  encoder.setDispose(2)
  encoder.setTransparent(255 * 255 * 255)

  frames.forEach((f) => {
    encoder.addFrame(f.data)
  });

  encoder.finish()

  response.setHeader('Content-Type', 'image/gif');
  response.end(encoder.out.getData(), 200)
}

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});