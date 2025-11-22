import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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
 * Textures - Baked shadows
 */
const textureLoader = new THREE.TextureLoader()

// This is to get a static shadow
const bakedShadow = textureLoader.load(('/textures/bakedShadow.jpg'))
bakedShadow.colorSpace = THREE.SRGBColorSpace

// This is to mimic shadow moving wrt the object
const simpleShadow = textureLoader.load(('/textures/simpleShadow.jpg'))
simpleShadow.colorSpace = THREE.SRGBColorSpace

/**
 * Lights
 */
// NOTE: Only three types of lights support shadows - Directional, point and spot

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(2, 2, - 1)
gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)

// Can add after adding the light to the scene
directionalLight.castShadow = true

// To cast a shadow, a camera takes a render from each light, and creates a shadow map
// Shadow Light Camera is Orthographic camera and
// Must add before adding to the scene
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.bottom = -2
directionalLight.shadow.camera.left = -2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 6
directionalLight.shadow.radius = 10 // Blur

// Info regarding the shadow map
console.log(directionalLight.shadow)

// We could modify the resolution by modifying these values.
// But cautious, too much might take a toll on the frame rate
directionalLight.shadow.mapSize.set(1024, 1024)

// To control its near and far values
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// Once we are happy with the render, we could hide the guidelines
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)

// Spotlight
const spotLight = new THREE.SpotLight(0xffffff, 3.6, 10, Math.PI * 0.3)
spotLight.castShadow = true

// Shadow Light Camera is Perspective camera
spotLight.shadow.mapSize.set(1024, 1024)
// In the later versions, fov cannot be changed and will be overwritten by spotlight
// spotLight.shadow.camera.fov = 30
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 6

spotLight.position.set(0, 2, 2)
scene.add(spotLight)
scene.add(spotLight.target)

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
// Once we are happy with the render, we could hide the guidelines
spotLightCameraHelper.visible = false
scene.add(spotLightCameraHelper)

// Point Light
const pointLight = new THREE.PointLight(0xffffff, 2.7)
pointLight.castShadow = true
pointLight.position.set(-1, 1, 0)

// Since it's a point light that has rays pointed at all directions,
// Three JS uses a Perspective camera and generates a render for each axis (six directions)
// Hence its expensive and could not control fov
pointLight.shadow.mapSize.set(1024, 1024)
pointLight.shadow.camera.near = 0.1
pointLight.shadow.camera.far = 5


const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
// Once we are happy with the render, we could hide the guidelines
pointLightCameraHelper.visible = false
scene.add(pointLightCameraHelper)

scene.add(pointLight)

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.castShadow = true

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)

// To use the baked shadow texture
// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(5, 5),
//     new THREE.MeshBasicMaterial({
//         map: bakedShadow
//     })
// )

plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5

plane.receiveShadow = true

// We shall be creating a plane just above the surface plane and just below the sphere
// to mimic the shadow. WARNING: But careful, if two planes are at the same position,
// GPU might struggle to find precedence and leads to glitch called z-fighting
const sphereShadow = new THREE.Mesh(
    // It was called PlaneBufferGeometry in older versions
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        color: 0x000000,
        // When using alpha props, make transparent true
        transparent: true,
        alphaMap: simpleShadow
    })
)
// To make it parallel to surface plane
sphereShadow.rotation.x = -Math.PI * 0.5
// To make it just above the surface plane
sphereShadow.position.y = plane.position.y + 0.01

scene.add(sphere, sphereShadow, plane)

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

// To inform renderer to enable shadow mapping for shadow simulation
// Toggle to turn on/off shadows
renderer.shadowMap.enabled = false

/**
 * Shadow map Algorithms
 * 1. Basic - Very performant but poor quality
 * 2. PCF - Less performant but smoother edges (default)
 * 3. PCF Soft - Less performant but even smoother edges
 * 4. VSM - Less performant, more constraints, might exhibit unexpected results
 */
renderer.shadowMap.type = THREE.PCFSoftShadowMap // blur has little to no effect

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update the sphere (animate)
    // Sin and Cos combo makes the sphere go in circle in XZ plane (same as the surface)
    // Absolute(sine) would make the ball bounce like the abs(sin) wave
    // Refer this: https://www.google.com/search?q=abs%28sin%28x%29%29&client=firefox-b-d&uact=5&oq=abs%28sin%28x%29%29
    sphere.position.set(
        Math.cos(elapsedTime) * 1.5,
        Math.abs(Math.sin(elapsedTime * 2)),
        Math.sin(elapsedTime) * 1.5
    )

    // update the shadow dynamically (simple alpha shadow)
    sphereShadow.position.x = sphere.position.x
    sphereShadow.position.z = sphere.position.z
    // Shadow should appear more as bounce reaches more close to the surface plane
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()