const mood = {
  happy: { tint: 'rgba(255,104,184,0.17)', accent: '#ff6fbd' },
  surprised: { tint: 'rgba(99,222,255,0.16)', accent: '#6de7ff' },
  sad: { tint: 'rgba(113,154,255,0.14)', accent: '#9ac0ff' },
  angry: { tint: 'rgba(255,55,84,0.17)', accent: '#ff3b4f' },
  neutral: { tint: 'rgba(221,218,255,0.12)', accent: '#e7e2ff' }
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r)
  else { ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); }
  ctx.closePath()
}

function drawNoise(ctx, w, h, amount) {
  const count = Math.floor((w * h) / 1200 * amount)
  ctx.save()
  ctx.globalAlpha = 0.08
  for (let i = 0; i < count; i++) {
    const v = 150 + Math.floor(Math.random() * 105)
    ctx.fillStyle = `rgb(${v},${v},${v})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1)
  }
  ctx.restore()
}

function drawMoodFx(ctx, emotion, w, h, intensity) {
  const a = mood[emotion] || mood.neutral
  ctx.save()
  ctx.fillStyle = a.tint
  ctx.fillRect(0, 0, w, h)
  const count = Math.floor(7 + intensity * 16)
  ctx.font = `${18 + intensity * 16}px Arial`
  ctx.textAlign = 'center'
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    if (emotion === 'happy') ctx.fillText(i % 2 ? '♥' : '✦', x, y)
    if (emotion === 'surprised') ctx.fillText(i % 2 ? '⚡' : '✶', x, y)
    if (emotion === 'sad') ctx.fillText(i % 2 ? '•' : '☂', x, y)
    if (emotion === 'angry') ctx.fillText(i % 2 ? '×' : '✹', x, y)
    if (emotion === 'neutral') ctx.fillText(i % 2 ? '✧' : '◇', x, y)
  }
  ctx.restore()
}

function drawLandmarkFx(ctx, emotion, landmarks, scaleX, scaleY, intensity) {
  if (!landmarks || landmarks.length < 68) return
  const leftEye = landmarks[36]
  const rightEye = landmarks[45]
  const mouth = landmarks[62]
  const lx = leftEye.x * scaleX
  const ly = leftEye.y * scaleY
  const rx = rightEye.x * scaleX
  const ry = rightEye.y * scaleY
  const mx = mouth.x * scaleX
  const my = mouth.y * scaleY
  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = `${28 + intensity * 24}px Arial`
  if (emotion === 'happy') {
    ctx.fillText('✦', lx - 26, ly - 32)
    ctx.fillText('♥', rx + 28, ry - 22)
  }
  if (emotion === 'surprised') {
    ctx.fillText('✶', lx - 30, ly - 30)
    ctx.fillText('⚡', rx + 32, ry - 18)
  }
  if (emotion === 'sad') {
    ctx.fillStyle = 'rgba(160,210,255,0.85)'
    ctx.beginPath()
    ctx.ellipse(lx, ly + 34, 7, 18, 0, 0, Math.PI * 2)
    ctx.ellipse(rx, ry + 34, 7, 18, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  if (emotion === 'angry') {
    ctx.fillStyle = '#ff334f'
    ctx.fillText('╱', lx, ly - 20)
    ctx.fillText('╲', rx, ry - 20)
  }
  if (emotion === 'neutral') ctx.fillText('✧', mx + 44, my - 18)
  ctx.restore()
}

export function renderPhoto({ source, emotion, intensity, stickers, caption, flash, inference }) {
  const canvas = document.createElement('canvas')
  const sw = source.videoWidth || source.naturalWidth || source.width
  const sh = source.videoHeight || source.naturalHeight || source.height
  if (!sw || !sh) throw new Error('The camera or image is not ready yet')
  canvas.width = 1080
  canvas.height = 1080
  const ctx = canvas.getContext('2d')
  const size = Math.min(sw, sh)
  const sx = (sw - size) / 2
  const sy = (sh - size) / 2
  ctx.filter = `saturate(${1 + intensity * 0.13}) contrast(${1 + intensity * 0.08}) brightness(${1 + intensity * 0.03})`
  if (source.tagName === 'VIDEO') {
    ctx.save()
    ctx.translate(1080, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(source, sx, sy, size, size, 0, 0, 1080, 1080)
    ctx.restore()
  } else {
    ctx.drawImage(source, sx, sy, size, size, 0, 0, 1080, 1080)
  }
  ctx.filter = 'none'
  drawMoodFx(ctx, emotion, 1080, 1080, intensity)
  if (inference?.landmarks) {
    const scale = 1080 / size
    const translated = inference.landmarks.map(p => ({ x: p.x - sx, y: p.y - sy }))
    drawLandmarkFx(ctx, emotion, translated, scale, scale, intensity)
  }
  drawNoise(ctx, 1080, 1080, 1 + intensity)
  const gradient = ctx.createRadialGradient(540, 500, 120, 540, 500, 680)
  gradient.addColorStop(0, 'rgba(255,255,255,0.06)')
  gradient.addColorStop(1, 'rgba(35,8,48,0.22)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1080, 1080)
  if (flash) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fillRect(0, 0, 1080, 1080)
  }
  stickers.forEach(sticker => {
    const x = sticker.x / 100 * 1080
    const y = sticker.y / 100 * 1080
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(sticker.rotation * Math.PI / 180)
    ctx.font = `${sticker.size * 2}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = sticker.color
    ctx.shadowColor = 'rgba(0,0,0,.25)'
    ctx.shadowBlur = 10
    ctx.fillText(sticker.icon, 0, 0)
    ctx.restore()
  })
  ctx.fillStyle = 'rgba(255,255,255,.82)'
  ctx.font = '22px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(new Date().toLocaleString(), 30, 1040)
  ctx.textAlign = 'right'
  ctx.fillText(`MOODMORPH/${emotion.toUpperCase()}`, 1050, 1040)
  if (caption) {
    roundedRect(ctx, 260, 72, 560, 64, 16)
    ctx.fillStyle = 'rgba(255,255,255,.88)'
    ctx.fill()
    ctx.fillStyle = '#4f155f'
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(caption.slice(0, 42), 540, 114)
  }
  return canvas.toDataURL('image/png')
}

export async function buildLayout(images, layout, caption = '') {
  if (!images?.length) return null
  const loaded = await Promise.all(images.map(src => new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('A captured image could not be loaded for export'))
    img.src = src
  })))
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser')
  const latest = loaded[loaded.length - 1]

  if (layout === 'single') {
    canvas.width = 1080
    canvas.height = 1080
    ctx.drawImage(latest, 0, 0, canvas.width, canvas.height)
  } else if (layout === 'polaroid') {
    canvas.width = 1000
    canvas.height = 1220
    ctx.fillStyle = '#f8eff7'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.shadowColor = 'rgba(54, 14, 58, .24)'
    ctx.shadowBlur = 28
    ctx.shadowOffsetY = 14
    ctx.fillStyle = '#fffdfd'
    ctx.fillRect(66, 58, 868, 1100)
    ctx.restore()
    ctx.fillStyle = '#fffdfd'
    ctx.fillRect(66, 58, 868, 1100)
    ctx.drawImage(latest, 104, 96, 792, 792)
    ctx.fillStyle = '#62266c'
    ctx.textAlign = 'center'
    ctx.font = 'italic 34px Georgia, serif'
    ctx.fillText((caption || 'moodmorph angel archive').slice(0, 34), 500, 962)
    ctx.font = '16px monospace'
    ctx.fillStyle = '#9d6ba0'
    ctx.fillText(`MOODMORPH.EXE  ·  ${new Date().toLocaleDateString()}`, 500, 1010)
    ctx.save()
    ctx.translate(835, 1080)
    ctx.rotate(-0.15)
    ctx.fillStyle = '#f879bd'
    ctx.font = '42px Arial'
    ctx.fillText('♥', 0, 0)
    ctx.restore()
  } else if (layout === 'three') {
    canvas.width = 760
    canvas.height = 2220
    ctx.fillStyle = '#fff5fb'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#2b172f'
    ctx.fillRect(18, 18, 724, 2184)
    for (let i = 0; i < 3; i++) {
      const img = loaded[Math.max(0, loaded.length - 3 + i)] || loaded[0]
      const x = 52
      const y = 52 + i * 700
      ctx.drawImage(img, x, y, 656, 656)
      ctx.fillStyle = '#fff1fa'
      ctx.font = '18px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`MOODMORPH · FRAME 0${i + 1}`, x + 4, y + 678)
    }
    ctx.fillStyle = '#fff7fd'
    ctx.font = 'bold 20px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('MOODMORPH.EXE ♥ PHOTOBOOTH', 380, 2172)
  } else if (layout === 'four') {
    canvas.width = 1600
    canvas.height = 1740
    ctx.fillStyle = '#f8eff7'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#2b172f'
    ctx.fillRect(28, 28, 1544, 1684)
    for (let i = 0; i < 4; i++) {
      const img = loaded[Math.max(0, loaded.length - 4 + i)] || loaded[0]
      const x = 72 + (i % 2) * 760
      const y = 72 + Math.floor(i / 2) * 790
      ctx.drawImage(img, x, y, 696, 696)
      ctx.fillStyle = '#fff1fa'
      ctx.font = '16px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`FRAME 0${i + 1}`, x + 4, y + 724)
    }
    ctx.fillStyle = '#fff7fd'
    ctx.font = 'bold 28px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('MOODMORPH.EXE / CONTACT SHEET', 800, 1680)
  }
  return canvas.toDataURL('image/png')
}

export function downloadImage(dataUrl, filename) {
  if (!dataUrl) throw new Error('No image data to download')
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
}
