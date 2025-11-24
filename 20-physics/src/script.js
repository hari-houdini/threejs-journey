import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
// import CANNON from 'cannon' -- Old package
import * as CANNON from 'cannon-es'
// Ammo JS is better in almost every way but difficult
// Physi JS - uses Ammo JS and workers internally, much simpler

/**
 * Debug
 */
const gui = new GUI()

const debugObject = {
    createSphere: () => createSphere(
        Math.random(), {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3
    }),
    createBox: () => createBox(
        Math.random(),
        Math.random(),
        Math.random(), {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3
        }),
    reset: () => {
        for (const object of objectsToUpdate) {
            // Remove body
            object.body.removeEventListener('collide', playHitSound)
            world.removeBody(object.body)

            // Remove mesh
            scene.remove(object.mesh)
        }

        // Empty list
        objectsToUpdate.splice(0, objectsToUpdate.length)
    }
}
gui.add(debugObject, 'createSphere')
gui.add(debugObject, 'createBox')
gui.add(debugObject, 'reset')

/**
 * Constraints in CANNON
 *
 * 1. Hinge - like door hinge
 * 2. Distance - always maintains the same distance
 * 3. Lock - Merge body that move together as one
 * 4. Point-to-Point - Glue them at specific point
 */

/**
 * Points to remember:
 *
 * 1. WebGL is handled in the GPU, whereas Physics is done in the CPU.
 * 2. Workers spread that load by multithreading (better performance).
 */

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sounds
 */
const hitSound = new Audio('/sounds/hit.mp3')
const normalise = (val, max = 15, min = 0) => (val - min) / (max - min);
const playHitSound = (collision) => {
    // Play sound only when there is significant impact
    const impact = collision.contact.getImpactVelocityAlongNormal()

    if (impact > 1.5) {
        // Adding randomness to the sound
        hitSound.volume = Math.random()
        // hitSound.volume = normalise(impact)
        // Without resetting currentTime to 0, every play would be triggered only after the previous completes playing
        hitSound.currentTime = 0
        hitSound.play()
    }
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Physics
 *
 * Idea is to create a physics world that mimics THREE JS world.
 * And update THREE JS as per the physics world.
 */
// World
const world = new CANNON.World()

/**
 * BroadPhase
 *
 * 1. Naive - test every body against every other in the physical world (bad for CPU)
 * 2. Grid - Divide the scene into grids and an object would be tested against every body within the grid cell and its adjacent cells (good for CPU)
 * 3. Sweep and Prune - test bodies on arbitrary axes during multiple steps (better for CPU)
 *
 * Test 1 is default in Cannon
 * Though 2 and 3 are better for CPU, it may provide weird results for very fast moving objects
 *
 * AllowSleep (Perfect for performance)
 *
 * When objects are done interacting or drastically slowed down or at a point where testing
 * against them makes no sense, such bodies will be marked "sleeping". When there is a collision or some
 * interaction that happens with the same bodies, it would be marked "awake" again.
 *
 * Use "sleepSpeedLimit" or "speedTimeLimit" to adjust the sleep/awake based on the requirement
 */
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, -9.82, 0)

// Materials
// const concreteMaterial = new CANNON.Material('concrete')
// const plasticMaterial = new CANNON.Material('plastic')
//
// const concretePlasticContactMaterial = new CANNON.ContactMaterial(
//     concreteMaterial,
//     plasticMaterial, {
//         friction: 0.1,
//         restitution: 0.7 // Bounce
//     }
// )
// world.addContactMaterial(concretePlasticContactMaterial)

// We can make it simpler by using a single material and setting it as the default
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial, {
        friction: 0.1,
        restitution: 0.7
    }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// Sphere
// const sphereShape = new CANNON.Sphere(0.5)
// const sphereBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(0, 3, 0),
//     shape: sphereShape,
//     // material: plasticMaterial
//     // material: defaultMaterial
// })
// sphereBody.applyLocalForce(
//     new CANNON.Vec3(150, 0, 0), // Force along each axis
//     new CANNON.Vec3(0, 0 ,0) // Coordinates within the sphere where the force is applied
// )
// world.addBody(sphereBody)

// Floor
const floorShape = new CANNON.Plane() // Plane is infinite in both it's axes unlike THREE JS
const floorBody = new CANNON.Body({
    mass: 0, // mass zero makes the object static (default)
    shape: floorShape,
    // material: concreteMaterial
    // material: defaultMaterial
})

// Since the floor in 3JS is rotated to XZ plane, we also need to rotate it in physics world.
// Cannon only supports quaternion. So we need to provide it an axis and the rotation we need as params
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0), // Axis that it's rotated at
    Math.PI * 0.5 // Angle it's rotates
)
// Could also do
// floorBody.quaternion.setFromAxisAngle(
//     new CANNON.Vec3(1, 0, 0), // Axis that it's rotated at
//     - Math.PI * 0.5 // Angle it's rotates
// )
world.addBody(floorBody)

// /**
//  * Sphere
//  */
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     new THREE.MeshStandardMaterial({
//         metalness: 0.3,
//         roughness: 0.4,
//         envMap: environmentMapTexture,
//         envMapIntensity: 0.5
//     })
// )
// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
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
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utils (Better approach)
 */
const objectsToUpdate = []

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture
})

const createSphere = (radius, position) => {
    // ThreeJS
    // const mesh = new THREE.Mesh(
    //     new THREE.SphereGeometry(radius, 20, 20),
    //     new THREE.MeshStandardMaterial({
    //         metalness: 0.3,
    //         roughness: 0.4,
    //         envMap: environmentMapTexture
    //     })
    // )
    // sphereGeometry.setAttribute('radius', radius)
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.scale.set(radius, radius, radius)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    body.addEventListener('collide', playHitSound)
    world.addBody(body)

    // Save
    objectsToUpdate.push({
        mesh, body
    })
}

createSphere(0.5, {
    x: 0,
    y: 3,
    z: 0
})

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture
})

const createBox = (width, height, depth, position) => {
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon
    // Expects half-length (length, width, depth from the center of the box)
    const shape = new CANNON.Box(new CANNON.Vec3(
        width / 2,
        height / 2,
        depth / 2
    ))
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    // collide, sleep, wakeup - possible events
    body.addEventListener('collide', playHitSound)
    world.addBody(body)

    // Save
    objectsToUpdate.push({
        mesh, body
    })
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let prevElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - prevElapsedTime
    prevElapsedTime = elapsedTime

    // Update Physics world
    // sphereBody.applyForce( // Similar to applyLocalForce but this is global
    //     new CANNON.Vec3(-0.5, 0, 0), // Mimicking wind, in the opposite direction
    //     sphereBody.position
    // )
    world.step(
        1/60, // Frames per second (fixed time step size)
        deltaTime, // Time elapsed since last call
        3 // Steps to take per function call
    )

    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }

    // Update 3JS from Physics world
    // sphere.position.set(
    //     sphereBody.position.x,
    //     sphereBody.position.y,
    //     sphereBody.position.z
    // )
    // Although 3JS position is Vector3 and Cannon position is Vec3 (different types)
    // This copy method works (as it just grabs x, y, z coordinates)
    // sphere.position.copy(sphereBody.position)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()