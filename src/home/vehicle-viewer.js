// This module and all Three dependencies are reached only after a vehicle click.
const downloads = new Map();

async function download(url, progress) {
  if (downloads.has(url)) return { buffer: await downloads.get(url), cached: true };
  const pending = (async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Vehicle HTTP ${response.status}: ${url}`);
    const total = Number(response.headers.get('content-length'));
    const reader = response.body?.getReader();
    if (!reader) return response.arrayBuffer();
    let loaded = 0;
    const chunks = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); loaded += value.byteLength;
      progress(total > 0 ? Math.min(100, Math.round(loaded / total * 100)) : null);
    }
    const bytes = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return bytes.buffer;
  })();
  downloads.set(url, pending);
  try { return { buffer: await pending, cached: false }; }
  catch (error) { downloads.delete(url); throw error; }
}

export async function createViewer(host, onError) {
  const [THREE, { GLTFLoader }, { OrbitControls }, { DRACOLoader }, { RoomEnvironment }] = await Promise.all([
    import('three'), import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/controls/OrbitControls.js'), import('three/addons/loaders/DRACOLoader.js'),
    import('three/addons/environments/RoomEnvironment.js'),
  ]);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  host.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', '3D 赛车，拖动旋转，滚轮或双指缩放');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .01, 1000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minPolarAngle = .35;
  controls.maxPolarAngle = Math.PI / 2 - .04;
  controls.autoRotate = false;
  const hemi = new THREE.HemisphereLight(0xffffff, 0x77776e, 2);
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 7, 5);
  scene.add(hemi, key);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  const draco = new DRACOLoader().setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
  const loader = new GLTFLoader().setDRACOLoader(draco);
  let model = null, radius = 1, bounds = new THREE.Vector3(), active = false, disposed = false, sequence = 0;

  function disposeModel(root) {
    if (!root) return;
    const geometries = new Set(), materials = new Set(), textures = new Set();
    root.traverse(node => {
      if (node.geometry) geometries.add(node.geometry);
      for (const material of (Array.isArray(node.material) ? node.material : [node.material])) {
        if (!material) continue;
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      }
    });
    geometries.forEach(item => item.dispose());
    materials.forEach(item => item.dispose());
    textures.forEach(item => { item.dispose(); item.source?.data?.close?.(); });
  }
  function frame() { if (active && !document.hidden) { controls.update(); renderer.render(scene, camera); } }
  function fit() {
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    const vertical = THREE.MathUtils.degToRad(camera.fov);
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
    const direction = camera.position.clone().sub(controls.target).normalize();
    if (!direction.lengthSq()) direction.set(1, .55, 1.4).normalize();
    const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    let distance = 0;
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
      const corner = new THREE.Vector3(x * bounds.x / 2, y * bounds.y / 2, z * bounds.z / 2);
      distance = Math.max(distance, corner.dot(direction) + Math.max(Math.abs(corner.dot(right)) / Math.tan(horizontal / 2), Math.abs(corner.dot(up)) / Math.tan(vertical / 2)));
    }
    distance *= 1.08;
    camera.position.copy(direction.multiplyScalar(distance));
    camera.near = radius * .01; camera.far = distance * 12;
    camera.updateProjectionMatrix();
    controls.minDistance = radius * 1.15;
    controls.maxDistance = distance * 2.2;
    controls.update();
  }
  const observer = new ResizeObserver(() => { if (active) fit(); });
  observer.observe(host);
  function hide() {
    ++sequence; active = false; renderer.setAnimationLoop(null);
    if (model) { scene.remove(model); disposeModel(model); model = null; }
    renderer.renderLists.dispose();
  }
  const lost = event => { event.preventDefault(); hide(); onError(new Error('WebGL context lost')); };
  renderer.domElement.addEventListener('webglcontextlost', lost);
  return {
    async show(car, url, progress, started) {
      hide();
      const ticket = sequence;
      const loadStart = performance.now();
      const { buffer, cached } = await download(url, progress);
      const downloaded = performance.now();
      if (disposed || ticket !== sequence) return null;
      const gltf = await loader.parseAsync(buffer.slice(0), new URL('.', new URL(url, location.href)).href);
      if (disposed || ticket !== sequence) { disposeModel(gltf.scene); return null; }
      model = gltf.scene;
      model.rotation.y += car.viewer?.rotationY || 0;
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      if (box.isEmpty()) { hide(); throw new Error('Empty vehicle model'); }
      const center = box.getCenter(new THREE.Vector3());
      bounds = box.getSize(new THREE.Vector3());
      radius = bounds.length() / 2;
      model.position.sub(center);
      scene.add(model);
      controls.target.set(0, 0, 0);
      camera.position.set(1, .12, .06);
      active = true; fit();
      await renderer.compileAsync(scene, camera);
      if (disposed || ticket !== sequence) return null;
      renderer.render(scene, camera);
      const metrics = { car: car.id, url, bytes: buffer.byteLength, cached,
        downloadMs: Math.round(downloaded - loadStart), readyMs: Math.round(performance.now() - started),
        triangles: renderer.info.render.triangles, calls: renderer.info.render.calls };
      host.dataset.metrics = JSON.stringify(metrics);
      console.info('[AWTC vehicle]', metrics);
      renderer.setAnimationLoop(frame);
      return metrics;
    },
    hide,
    destroy() {
      disposed = true; hide(); observer.disconnect(); controls.dispose(); draco.dispose();
      environment.dispose(); renderer.domElement.removeEventListener('webglcontextlost', lost);
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    },
  };
}
