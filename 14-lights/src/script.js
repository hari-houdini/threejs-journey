import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// Omnidirectional lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
scene.add(ambientLight)

gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)

// Directional lighting
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9)
directionalLight.position.set(1, 0.25, 0)
// The rays from light usually travel parallel and towards the center of the scene, not the object
// Distance does not matter, intensity remains the same
scene.add(directionalLight)

// Hemisphere lighting
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.9)
scene.add(hemisphereLight)

// Point lighting - With distance and decay, the intensity of light reduces with distance
const pointLight = new THREE.PointLight(0xff9000, 1.5, 10, 2)
pointLight.position.set(1, -0.5, 1)
scene.add(pointLight)

// Rect Area lighting - similar to diffused studio light
// NOTE: Only works with Mesh Standard and Physical Material
const rectAreaLighting = new THREE.RectAreaLight(0x4e00ff, 6, 1, 1)
rectAreaLighting.position.set(-1.5, 0 ,1.5)
rectAreaLighting.lookAt(new THREE.Vector3())
scene.add(rectAreaLighting)

gui.add(rectAreaLighting.position, 'x').min(-10).max(10).step(0.1)
gui.add(rectAreaLighting.position, 'y').min(-10).max(10).step(0.1)
gui.add(rectAreaLighting.position, 'z').min(-10).max(10).step(0.1)

// Spot lighting - Like a flashlight/floodlight
// NOTE: Penumbra is the blurriness at the edges of the light
const spotLight = new THREE.SpotLight(0x78ff00, 4.5, 10, Math.PI * 0.1, 0.25, 1)
spotLight.position.set(0, 2, 3)
scene.add(spotLight)

// Spotlight works differently. We can directly use something like lookAt method.
// So to rotate it we may need to use the target within it.
scene.add(spotLight.target)
spotLight.target.position.x = -0.75

// NOTE: Lights are expensive. Use only when necessary
// Min cost: Ambient and Hemisphere
// Moderate cost: Directional and Point
// High cost: Spot and Rect Area

// Idea is to "bake" lighting and shadows into the texture

/**
 * Light Helpers - help position
 */
// Hemisphere
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
scene.add(hemisphereLightHelper)

// Directional
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
scene.add(directionalLightHelper)

// Point
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
scene.add(pointLightHelper)

// Spotlight
const spotLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(spotLightHelper)

// Rect Area
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLighting)
scene.add(rectAreaLightHelper)

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

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

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()