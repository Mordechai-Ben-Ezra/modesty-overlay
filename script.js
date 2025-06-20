let net = null;
bodyPix.load({architecture: 'MobileNetV1', outputStride: 16, multiplier: 0.75})
  .then(model => { net = model; console.log('BodyPix loaded'); });

document.getElementById('file-input').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file || !net) return alert('חכה לטעינת המודל ואז נסה שוב');
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => processImage(img);
});

async function processImage(image) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const multiPersonParts = await net.segmentMultiPersonParts(image, {
    segmentationThreshold: 0.7
  });

  multiPersonParts.forEach(personSegmentation => {
    const partsToCover = [
      'torsoFront','torsoBack',
      'leftUpperArm','rightUpperArm'
    ];
    const coloredPartImage = bodyPix.toMask(
      personSegmentation,
      partsToCover.reduce((map, part) => (map[part] = {r:0,g:0,b:255,a:150}, map), {}),
      {r:0,g:0,b:0,a:0}
    );
    bodyPix.drawMask(
      canvas,
      image,
      coloredPartImage,
      1.0,
      0,
      false
    );
  });
}
