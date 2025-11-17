import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
// const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2,2)

// Creates an aray that could hold 9 items (fixed size)
// const positionsArray = new Float32Array(9)

// (OR) Initialize with the existing vertices
// const positionsArray = new Float32Array([
//     0, 0, 0, // First vertex coordinates
//     0, 1, 0, // Second vertex coordinates
//     1, 0, 0  // Third vertex coordinates
// ])

const COUNT = 50
const VERTICES = 3
const COORDINATES = 3
const MAGNIFICATION = 2
const LENGTH = COUNT * VERTICES * COORDINATES
const positionsArray = new Float32Array(LENGTH)

for(let i = 0; i < LENGTH; i++) {
    positionsArray[i] = (Math.random() - 0.5) * MAGNIFICATION
}

// Creating a Buffer for position coordinates, by mentioning that its once every three values (x, y, z)
const positionAttributes = new THREE.BufferAttribute(positionsArray, 3);

// Creating a geometry with the attributes we created
const geometry = new THREE.BufferGeometry()
geometry.setAttribute("position", positionAttributes)

const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
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

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animate
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