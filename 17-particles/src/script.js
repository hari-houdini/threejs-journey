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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/9.png')

/**
 * Particles
 */
// Geometry
// const particlesGeometry = new THREE.SphereGeometry(1, 32, 32)

// Material
// const particlesMaterial = new THREE.PointsMaterial({
//     size: 0.02,
//     sizeAttenuation: true // Would create perspective
// })

// Points
// const particles =  new THREE.Points(particlesGeometry, particlesMaterial)
// scene.add(particles)

/**
 * Particles - Custom geometry, random positions
 */
const particlesGeometry = new THREE.BufferGeometry();
const count = 5000

const positions = new Float32Array(count * 3) // 3 - vertices
const colors = new Float32Array(count * 3) // 3 - RGB

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
    colors[i] = Math.random()
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true, // Would create perspective
    // color: '#ff88cc',
    vertexColors: true, // To use the random colors generated in the geometry
    // The plane it renders still covers the background, so instead of map, we use alphaMap
    // map: particleTexture,
    alphaMap: particleTexture,
    transparent: true
})
const particles =  new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

// Even after using alphaMap, we still face the issue because WebGL draws particle in the same
// order as they are created, and does not know which one is in front of another.
// To help solve this, there are a few solutions

// 1. Alpha Test (WebGL renders when pixel value is greater than threshold, else ignores)
// FYI 0 - Black, 1 - White
// particlesMaterial.alphaTest = 0.001

// 2. Depth Test (WebGL doesn't try to understand what's in front of another)
// But the problem is even if we add a cube in the scene, the particles behind the cube would be visible
// particlesMaterial.depthTest = false

// 3. Depth Write (WebGL to not write particles in depth buffer)
// The depth info from depth test, of what's being drawn, is usually stored in a Depth Buffer.
particlesMaterial.depthWrite = false

// 4. Blending (Similar to Additive filter in Photoshop)
// Has performance issues
// particlesMaterial.blending = THREE.AdditiveBlending

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
camera.position.z = 3
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

    // 1. Since Points inherits from Object3D, we could animate with rotate, position, scale, etc
    // particles.rotation.y = elapsedTime * 0.2

    // 2. Change attributes of stored float array (mutable, poor performance, so bad idea)
    for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const x = particlesGeometry.attributes.position.array[i3]
        // i3 + 1 = y axis value
        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
    }
    // Inform THREE JS to update the buffer
    particlesGeometry.attributes.position.needsUpdate = true

    // 3. Custom shader - TBD (Better solution)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()