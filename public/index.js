var head = {
  current: 1,
  max: 3
}

var arm1 = {
  current: 1,
  max: 3
}

var body = {
  current: 1,
  max: 3
}

var arm2 = {
  current: 1,
  max: 3
}

var legs = {
  current: 1,
  max: 3
}

var extra = {
  current: 1,
  max: 3
}

let reset = false;
let outlinebuffer = [];
const c_big = document.querySelector('#c-big');
const ctx_b = c_big.getContext('2d');

function renderLargeCanvas(canvas) {
  ctx_b.clearRect(0,0,c_big.width,c_big.height);
  ctx_b.imageSmoothingEnabled = false
  ctx_b.drawImage(canvas, 0, 0, c_big.width, c_big.height);
}

function loadAndRenderGifs() {
  var frames = 0;

  // Load the GIF, set custom frame render function
  const g_head = gifler(`Head ${head.current}.gif`);
  const g_arm1 = gifler(`Arm 1-${arm1.current}.gif`);
  const g_body = gifler(`Body ${body.current}.gif`);
  const g_arm2 = gifler(`Arm 2-${arm2.current}.gif`);
  const g_legs = gifler(`Legs ${legs.current}.gif`);
  const g_extra = gifler(`Extra ${extra.current}.gif`);

  Promise.all([g_legs.get(), g_arm2.get(), g_body.get(), g_arm1.get() , g_head.get(), g_extra.get()]).then((parts) => {
    const names = ['legs', 'arm2', 'body', 'arm1', 'head', 'extra'];
    const c = document.createElement('canvas');
    c.width = 34;
    c.height = 34;
    const ctx = c.getContext('2d');
    const A = parts[0].constructor;
    let i = 0
    function render() {
      ctx.clearRect(0,0,c.width,c.height);
      ctx.imageSmoothingEnabled = false
      if (outlinebuffer[i]) {
        ctx.putImageData(outlinebuffer[i], 0, 0);
        renderLargeCanvas(c)
        i++
        if (i >= parts[0]._frames.length) { i = 0 }
        if (reset === false) {
          setTimeout(()=> {requestAnimationFrame(render)}, 200);
        } else {
          outlinebuffer = [];
          reset = false;
          loadAndRenderGifs();
        }
        return;
      }
      const frames = parts.map(g => g._frames[i]);
      const buffers = frames.map(f => A.createBufferCanvas(f, 34, 34));
      buffers.forEach((b, j) => {
        const f = frames[j];
        ctx.drawImage(b, f.x, f.y, f.width, f.height);
        if (i == 0) {
          const cu = document.createElement('canvas');
          cu.width = 34 * 4
          cu.height = 34 * 4
          const cutx = cu.getContext('2d');
          cutx.clearRect(0,0,cu.width, cu.height);
          cutx.imageSmoothingEnabled = false
          cutx.drawImage(b, f.x, f.y, f.width * 4, f.height * 4);
          document.querySelector(`.${names[j]}`).src = cu.toDataURL("image/png");
        }
      })
      const imgData = ctx.getImageData(0,0,c.width, c.height);
      const outData = ctx.createImageData(c.width, c.height);
      const i_data = imgData.data;
      const o_data = outData.data;
      let [col, row, x,y,p] = [4, c.width * 4, 0,0,null];

      for (var j = 0; j < i_data.length; j += 4) {
        const rgba_i = j + 3;
        if (i_data[rgba_i] === 0) {
          const next_pixel = i_data[rgba_i + col];
          const last_pixel = i_data[rgba_i - col];
          const next_row = i_data[rgba_i + row];
          const last_row = i_data[rgba_i - row];
          if ( next_pixel || next_row || last_pixel || last_row) {
            o_data[j] = 0
            o_data[j + 1] = 0
            o_data[j + 2] = 0
            o_data[rgba_i] = 255;
          }
        } else {
          o_data[j] = i_data[j];
          o_data[j + 1] = i_data[j + 1];
          o_data[j + 2] = i_data[j + 2];
          o_data[j + 3] = i_data[j + 3];
        }
      }
      ctx.clearRect(0,0,c.width,c.height);
      ctx.putImageData(outData, 0, 0);
      renderLargeCanvas(c)
      outlinebuffer[i] = ctx.getImageData(0, 0, c.width, c.height);
      i++
      if (i >= parts[0]._frames.length) { i = 0 }
      if (reset === false) {
        setTimeout(()=> {requestAnimationFrame(render)}, 200);
      } else {
        reset = false;
      }
    }
    render()
  }, () => {
    setTimeout(loadAndRenderGifs, 1000);
    reset = false;
  }).catch(() => {
    setTimeout(loadAndRenderGifs, 1000);
    reset = false;
  });
}

function change(name, value) {
  const {current, max} = window[name];
  if (current + value > 0 && current + value <= max) {
    window[name].current += value;
  }
  if (reset === false) {
    reset = true;
  } else {
    loadAndRenderGifs();
  }
}

async function save() {
  const response = await fetch('/save-gif', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: JSON.stringify(outlinebuffer)
  });
  const blob = await response.blob()
  download(blob, 'token.gif', 'image/gif');
}

loadAndRenderGifs();