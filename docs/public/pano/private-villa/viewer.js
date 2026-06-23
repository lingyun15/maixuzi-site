import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import pako from 'https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm'

const statusEl = document.querySelector('#status')
const container = document.querySelector('#app')

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x171717)

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100000)
camera.position.set(6, 4, 8)

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
renderer.outputColorSpace = THREE.SRGBColorSpace
container.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.08
controls.screenSpacePanning = true
controls.target.set(0, 1.5, 0)

const hemi = new THREE.HemisphereLight(0xffffff, 0x555555, 2.2)
scene.add(hemi)

const dir = new THREE.DirectionalLight(0xffffff, 2.4)
dir.position.set(5, 10, 7)
scene.add(dir)

const fill = new THREE.DirectionalLight(0xffffff, 1.1)
fill.position.set(-6, 4, -5)
scene.add(fill)

const grid = new THREE.GridHelper(20, 20, 0x444444, 0x2a2a2a)
scene.add(grid)

let model = null
let box = null
let center = new THREE.Vector3()
let size = new THREE.Vector3(10, 5, 10)

function setStatus(text, cls = '') {
  statusEl.textContent = text
  statusEl.className = cls
}

function frameModel() {
  if (!model) return
  box = new THREE.Box3().setFromObject(model)
  center = box.getCenter(new THREE.Vector3())
  size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 10
  const dist = maxDim * 1.25
  camera.position.set(center.x + dist, center.y + maxDim * 0.65, center.z + dist)
  camera.near = Math.max(maxDim / 1000, 0.01)
  camera.far = maxDim * 50
  camera.updateProjectionMatrix()
  controls.target.copy(center)
  controls.update()
  grid.position.y = box.min.y
  grid.scale.setScalar(Math.max(maxDim / 20, 1))
}

function materialFallback(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = false
      child.receiveShadow = false
      if (!child.material) {
        child.material = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.85 })
      } else if (Array.isArray(child.material)) {
        child.material.forEach((m) => {
          m.side = THREE.DoubleSide
          if ('roughness' in m) m.roughness = 0.85
        })
      } else {
        child.material.side = THREE.DoubleSide
        if ('roughness' in child.material) child.material.roughness = 0.85
      }
    }
  })
}

async function loadModel() {
  const objPath = './models/model.obj.gz'

  const objLoader = new OBJLoader()

  try {
    const mtl = await new Promise((resolve, reject) => {
      const loader = new MTLLoader()
      loader.setPath('./models/')
      loader.load('model.mtl', resolve, undefined, reject)
    })
    mtl.preload()
    objLoader.setMaterials(mtl)
    setStatus('已加载 MTL，正在加载 OBJ...')
  } catch (err) {
    setStatus('未找到 model.mtl，将只加载 OBJ 白模。')
  }

  try {
    setStatus('正在下载压缩模型，首次打开可能需要一会儿...')
    const response = await fetch(objPath)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const compressed = new Uint8Array(await response.arrayBuffer())
    setStatus('正在解压模型...')
    const objText = pako.ungzip(compressed, { to: 'string' })
    setStatus('正在解析 OBJ 模型...')
    model = objLoader.parse(objText)
    materialFallback(model)
    scene.add(model)
    frameModel()
    setStatus('模型加载成功：拖动鼠标即可查看。', 'ok')
  } catch (err) {
    console.error(err)
    setStatus('模型加载失败：请确认 models/model.obj.gz 存在，或模型文件过大导致浏览器内存不足。', 'error')
  }
}

function setView(name) {
  if (!model) return
  const maxDim = Math.max(size.x, size.y, size.z) || 10
  const dist = maxDim * 1.2
  const eye = center.clone()
  switch (name) {
    case 'front': camera.position.set(center.x, center.y + maxDim * 0.35, center.z + dist); break
    case 'back': camera.position.set(center.x, center.y + maxDim * 0.35, center.z - dist); break
    case 'left': camera.position.set(center.x - dist, center.y + maxDim * 0.35, center.z); break
    case 'right': camera.position.set(center.x + dist, center.y + maxDim * 0.35, center.z); break
    case 'top': camera.position.set(center.x, center.y + dist, center.z + 0.01); break
    case 'inside': camera.position.set(center.x, box.min.y + size.y * 0.35, center.z + size.z * 0.08); break
  }
  controls.target.copy(eye)
  controls.update()
}

for (const btn of document.querySelectorAll('[data-view]')) {
  btn.addEventListener('click', () => setView(btn.dataset.view))
}
document.querySelector('#fit').addEventListener('click', frameModel)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

loadModel()
animate()
