const GIFEncoder = require('gifencoder');
const express = require('express');
const { createCanvas } = require('canvas');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const tmp = require('tmp');
const app = express();
const port = 6969;
const fs = require('fs');


app.use(bodyParser.json({limit: '20mb'}));

app.use('/', express.static('public'));
app.use('/token-maker', express.static('public'));


const saveGif = (request, response) => {
  const encoder = new GIFEncoder(34, 34);
  const frames = request.body;

  tmp.file((err, path, fd, cleanupCallback) => {
    console.log(`got name ${path}`);
    const md5sum = crypto.createHash('md5');
    fs.access(path, fs.constants.W_OK, (err) => {
      if (err) {
        repsonse.status(400)
        response.end(err.message)
      } else {
        console.log(`created name ${path}`);
        encoder.createReadStream().pipe(fs.createWriteStream(path));
        encoder.start()
        encoder.setRepeat(0)
        encoder.setDelay(200)
        encoder.setQuality(1)
        encoder.setDispose(2)
        encoder.setTransparent(255 * 255 * 255)
        frames.forEach((f) => {
          encoder.addFrame(f.data)
        });
        encoder.finish();
        const stream = fs.createReadStream(path)
      
        stream.on('data', (d) => {
          md5sum.update(d);
        });
        stream.on('end', () => {
          const d = md5sum.digest('hex');
          const outPath = `../../public_html/token-${d}.gif`
          fs.copyFile(path, outPath, (err) => {
            cleanupCallback
            if (err) {
              response.status(400)
              response.end(err.message)
            }
            fs.chmod(outPath, 644, (err) => {
              if (err) {
                response.status(400)
                response.end(err.message)
              }
              response.redirect(`/token-${d}.gif`);
            });
          });
        });
      }
    });
  });
}

app.post('/save-gif', saveGif);
app.post('/token-maker/save-gif', saveGif);

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
