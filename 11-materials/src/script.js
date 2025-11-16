import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

/**
 * Debug
 */
const gui = new GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Textures
const textureLoader = new THREE.TextureLoader()
const doorColorTexture = textureLoader.load("/textures/door/color.jpg")
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg")
const doorAmbientOcclusionTexture = textureLoader.load("/textures/door/ambientOcclusion.jpg")
const doorHeightTexture = textureLoader.load("/textures/door/height.jpg")
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg")
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg")
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg")
doorColorTexture.colorSpace = THREE.SRGBColorSpace

const matcapTexture = textureLoader.load("/textures/matcaps/3.png")
matcapTexture.colorSpace = THREE.SRGBColorSpace

const gradientTexture = textureLoader.load("/textures/gradients/3.jpg")

// Geometries - More subdivisions for maps we will add later to observe more details
const sphereGeometry = new THREE.SphereGeometry(0.5, 64, 64)
const planeGeometry = new THREE.PlaneGeometry(1,1,100, 100)
const torusGeometry = new THREE.TorusGeometry(0.3, 0.2, 64, 128)

// Materials

// Mesh Basic
// const material = new THREE.MeshBasicMaterial()
// material.map = doorColorTexture
// material.color = new THREE.Color('green')
// material.wireframe = true

// When changing alpha values (like opacity), we would also need to enable transparency
// material.transparent = true
// material.opacity = 0.5
// material.alphaMap = doorAlphaTexture

// To enable seeing frontside and backside, but more processing power
// material.side = THREE.DoubleSide

// ------------------------------------------------------------------------

// Mesh Normal
// const material = new THREE.MeshNormalMaterial()
// material.flatShading = true

// ------------------------------------------------------------------------

// Mesh Matcap - Needs Texture as reference
// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture

// ------------------------------------------------------------------------

// Mesh Depth - Further we, darker it becomes
// const material = new THREE.MeshDepthMaterial()

// ------------------------------------------------------------------------

// Mesh Lambert - Needs light source, more performant, but might yield weird pattern at times
// When it works, always use this
// const material = new THREE.MeshLambertMaterial()

// ------------------------------------------------------------------------

// Mesh Phong - Needs light source, Lambert alternative
// const material = new THREE.MeshPhongMaterial()
// material.shininess = 100
// material.specular = new THREE.Color(0x1188ff)

// ------------------------------------------------------------------------

// Mesh Toon - Cell shading, like on Zelda
// const material = new THREE.MeshToonMaterial()
// gradientTexture.generateMipmaps = false
// gradientTexture.minFilter = THREE.NearestFilter
// gradientTexture.magFilter = THREE.NearestFilter
// material.gradientMap = gradientTexture

// ------------------------------------------------------------------------

// Mesh Standard - Uses PBR
// const material = new THREE.MeshStandardMaterial()
// material.metalness = 0.7
// material.roughness = 0.2
// gui
//     .add(material, 'metalness')
//     .min(0)
//     .max(1)
//     .step(0.01)
// gui
//     .add(material, 'roughness')
//     .min(0)
//     .max(1)
//     .step(0.01)

// material.map = doorColorTexture
//
// material.aoMap = doorAmbientOcclusionTexture
// material.aoMapIntensity = 2
//
// material.displacementMap = doorHeightTexture
// material.displacementScale = 0.1
//
// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture
//
// material.normalMap = doorNormalTexture
// material.normalScale.set(0.5, 0.5)
//
// material.transparent = true
// material.alphaMap = doorAlphaTexture

// ------------------------------------------------------------------------

// Mesh Physical - same as Basic, but with clearcoat, sheen, iridescence, transmission, etc,  but weakest performance
const material = new THREE.MeshPhysicalMaterial()
material.metalness = 0.2
material.roughness = 0
gui
    .add(material, 'metalness')
    .min(0)
    .max(1)
    .step(0.01)
gui
    .add(material, 'roughness')
    .min(0)
    .max(1)
    .step(0.01)

// material.map = doorColorTexture
//
// material.aoMap = doorAmbientOcclusionTexture
// material.aoMapIntensity = 2
//
// material.displacementMap = doorHeightTexture
// material.displacementScale = 0.1
//
// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture
//
// material.normalMap = doorNormalTexture
// material.normalScale.set(0.5, 0.5)
//
// material.transparent = true
// material.alphaMap = doorAlphaTexture

// Clearcoat - adds a layer of varnish on top
// material.clearcoat = 1
// material.clearcoatRoughness = 0
// gui
//     .add(material, 'clearcoat')
//     .min(0)
//     .max(1)
//     .step(0.01)
// gui
//     .add(material, 'clearcoatRoughness')
//     .min(0)
//     .max(1)
//     .step(0.01)

// Sheen - Highlight material seen from narrow angle like fluffy fabrics
// material.sheen = 1
// material.sheenRoughness = 0.25
// material.sheenColor.set(1, 1, 1)
// gui
//     .add(material, 'sheen')
//     .min(0)
//     .max(1)
//     .step(0.01)
// gui
//     .add(material, 'sheenRoughness')
//     .min(0)
//     .max(1)
//     .step(0.01)
// gui.addColor(material, 'sheenColor')

// Iridescence - Creates color artifacts like fuel puddle, soap bubble or CDs
// material.iridescence = 1
// material.iridescenceIOR = 1
// material.iridescenceThicknessRange = [ 100, 800 ]
//
// gui
//     .add(material, 'iridescence')
//     .min(0)
//     .max(1)
//     .step(0.01)
// gui
//     .add(material, 'iridescenceIOR')
//     .min(1)
//     .max(2.333)
//     .step(0.01)
// gui
//     .add(material.iridescenceThicknessRange, '0')
//     .min(1)
//     .max(1000)
//     .step(1)
// gui
//     .add(material.iridescenceThicknessRange, '1')
//     .min(1)
//     .max(1000)
//     .step(1)

// Transmission - Enables light to go through the material
material.transmission = 1
material.ior = 1.5 // Index of refraction like 2.417 for diamond, 1.33 for water, etc
material.thickness = 0.5

gui
    .add(material, 'transmission')
    .min(0)
    .max(1)
    .step(0.01)
gui
    .add(material, 'ior')
    .min(1)
    .max(2.333)
    .step(0.01)
gui
    .add(material, 'thickness')
    .min(0)
    .max(1)
    .step(0.01)

// ------------------------------------------------------------------------

// Meshes
const sphere = new THREE.Mesh(sphereGeometry, material)
const plane = new THREE.Mesh(planeGeometry, material)
const torus = new THREE.Mesh(torusGeometry, material)

// Scene
const scene = new THREE.Scene()
scene.add(sphere, plane, torus)

/**
 * Lights
 */
// const ambientLight = new THREE.AmbientLight(0xffffff, 1)
// scene.add(ambientLight)
//
// const pointLight = new THREE.PointLight(0xffffff, 30)
// pointLight.position.x = 2
// pointLight.position.y = 3
// pointLight.position.z = 4
// scene.add(pointLight)

/**
 * Environment Map
 */
const rgbeLoader = new RGBELoader()
rgbeLoader.load('/textures/environmentMap/2k.hdr', (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = envMap
    // To get the reflections on the objects
    scene.environment = envMap
})

/**
 * Position
 */
sphere.position.x = -2
torus.position.x = 2

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Rotate objects in space
    sphere.rotation.y = 0.1 * elapsedTime
    plane.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = -0.15 * elapsedTime
    plane.rotation.x = -0.15 * elapsedTime
    torus.rotation.x = -0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()