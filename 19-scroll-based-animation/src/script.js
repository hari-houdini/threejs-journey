import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material.color.set(parameters.materialColor)
        particles.material.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Texture
 */
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
// WebGL/ThreeJS tries to create a mix of two adjacent pixels in the gradient
// If the light on the objects falls in between the two pixels.
// Nearest Filter picks the closest pixel, if set as Mag filter.
// For example, in this case, 3.jpg has three shades. If the light falls between grey and white
// Nearest filter picks either grey or white, and not a mix of both
// Remove the code below to understand the difference.
gradientTexture.magFilter = THREE.NearestFilter

/**
 * Objects
 */
// Materials
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})

// Meshes
const objectsDistance = 4
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)

// Negating it to make it one below the other in negative axis
mesh1.position.y = - objectsDistance * 0
mesh2.position.y = - objectsDistance * 1
mesh3.position.y = - objectsDistance * 2

mesh1.position.x = 2
mesh2.position.x = - 2
mesh3.position.x = 2

scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [mesh1, mesh2, mesh3]

/**
 * Particles
 */
// Geometry
const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)
const numberOfMeshes = sectionMeshes.length ?? 0

for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3

    positions[i3] = (Math.random() - 0.5) * 10
    // To make it spread through the entire scene
    positions[i3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * numberOfMeshes
    positions[i3 + 2] = (Math.random() - 0.5) * 10
}

const particles = new THREE.Points(
    new THREE.BufferGeometry()
        .setAttribute('position', new THREE.BufferAttribute(positions, 3)),
    new THREE.PointsMaterial({
        color: parameters.materialColor,
        sizeAttenuation: true,
        size: 0.03
    })
)
scene.add(particles)

/**
 * Lights - Needed to illuminate Toon material
 */
const directionalLight = new THREE.DirectionalLight('#fff', 3)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

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
// Group
// We are creating group because we would like camera to move to imitate parallax,
// But also move properly on scroll
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll Animation
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
    scrollY = window.scrollY

    // Since we would like to change value when half of next section appears,
    // We could round it as anything > 0.5 would be ceiled
    const newSection = Math.round(scrollY / sizes.height)

    if (newSection !== currentSection) {
        currentSection = newSection

        gsap.to(
            sectionMeshes[currentSection].rotation, {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'
            }
        )
    }
})

/**
 * Cursor - Parallax Effect
 */
const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) => {
    cursor.x = (event.clientX / sizes.width) - 0.5
    cursor.y = (event.clientY / sizes.height) - 0.5
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    // If we test on high frequency screen, tick would be called more often,
    // and camera tends to move faster. To make it consistent, we could use this technique
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Move camera
    // Window scrollY provides pixels moved from top
    // If e attached the same to camera position, each unit camera moved would in pixels.
    // Which means, if I move 1000 pixels, I move the camera by 1000 units
    // But items are just "objectsDistance" units apart.
    // So we divide the scrollY by viewport height, to get each section height
    // And move it by that much "objectDistance"
    camera.position.y = - (scrollY / sizes.height) * objectsDistance

    // Lowering amplitude to move it less
    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5

    // Since we update camera y position to update on scroll, we can use the same for parallax as well
    // camera.position.x = cursor.x
    // camera.position.y = -cursor.y

    // So instead of moving the camera, we move the group as a workaround
    // cameraGroup.position.x = cursor.x
    // cameraGroup.position.y = -cursor.y

    // Easing/Smoothing/Lerping
    // To achieve that, we update the value but by something like 1/10th every tick
    // Since delta time is too small, we could multiply by some value to make animation ease the way we want.
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * deltaTime * 5
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * deltaTime * 5

    // Animate meshes
    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()