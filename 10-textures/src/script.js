import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Textures
 */

// Method 0: Use Event Listener
// const image = new Image();
// image.addEventListener('load', (event) => {
//     console.log('image loading...')
// })
// image.src = '/textures/door/color.jpg'

// -----------------------------------------------

// Method 1: Use Native JS
// const image = new Image();
// const texture = new THREE.Texture(image)
// image.onload = () => {
//     console.log(texture)
//     texture.needsUpdate = true
// }
// image.src = '/textures/door/color.jpg'

// -----------------------------------------------

// Method 2: Use TextureLoader/LoadingManager
// const textureLoader = new THREE.TextureLoader()
// Texture loader can load multiple textures
// const texture = textureLoader.load(
//     '/textures/door/color.jpg',
//     () => {
//         console.log('optional load cb')
//     },
//     () => {
//         console.log('optional progress cb')
//     },
//     () => {
//         console.log('optional error cb')
//     }
// )
// When we load multiple textures, we cannot add cb for all the textures separately.
// This is where THREE.LoadingManager comes into picture
const manager = new THREE.LoadingManager()

manager.onStart = (() => console.log("Started..."))
manager.onProgress = (() => console.log("Loading..."))
manager.onLoad = (() => console.log("Loaded..."))
manager.onError = (() => console.log("Error..."))

const textureLoader = new THREE.TextureLoader(manager)

// Use this to for minification filter (also view Moiré patterns)
const checkBoardColorLgTexture = textureLoader.load('/textures/checkerboard-1024x1024.png')
// Use this to for magnification filter
const checkBoardColorSmTexture = textureLoader.load('/textures/checkerboard-8x8.png')

// Minecraft Texture
const minecraftTexture = textureLoader.load('/textures/minecraft.png')

// Door Textures
const colorTexture = textureLoader.load('/textures/door/color.jpg')
const alphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const heightTexture = textureLoader.load('/textures/door/height.jpg')
const normalTexture = textureLoader.load('/textures/door/normal.jpg')
const ambientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg')

const texture = minecraftTexture

/**
 * Transformation - Texture
 */
texture.repeat.x = 2
texture.repeat.y = 3

// By default, Texture does not repeat. It only stretches the last pixel when needed (ClampToEdgeWrapping).
// So make change its behaviour to repeat, we do the following
// WrapS -> Horizontal wrapping and U coordinate in UV
// WrapT -> Horizontal wrapping and V coordinate in UV
texture.wrapS = THREE.RepeatWrapping
texture.wrapT = THREE.MirroredRepeatWrapping

texture.offset.x = 0.5
texture.offset.y = 0.5

// texture.rotation = 1 // In Radians
texture.rotation = Math.PI * 0.25 // (or) 1 rad

// To move pivot point of rotation of the texture
texture.center.x = 0.5
texture.center.y = 0.5

/**
 * Filtering and MipMapping
 */
// If the result is good enough, THREE.NearestFilter is better for GPU performance
// We also don't need MipMapping if we use Nearest Filter for MinFilter

// Minification Filter
texture.generateMipmaps = false
texture.minFilter = THREE.NearestFilter

// Magnification Filter
texture.magFilter = THREE.NearestFilter

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
// UV coordinates
// console.log(geometry.attributes.uv)

// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const material = new THREE.MeshBasicMaterial({ map: texture })
// Newer version of ThreeJS expects color space to be specified as well
texture.colorSpace = THREE.SRGBColorSpace
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

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
camera.position.z = 1
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()