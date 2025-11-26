import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
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
 * Models
 */
// /**
//  * Draco compression
//  * 1. Lighter
//  * 2. Compression is applied to buffer data (typically geometry)
//  * 3. No exclusive to GLTF
//  * 4. Developed by google under open source license
//  * 5. Decoder is available in Web Assembly and can run be in a worker to improve performances
//  * 6. Copy decoder from node modules (three/examples/jsm/libs/draco) and paste it within static to use it
//  *
//  * Limitations:
//  * 1. Although geometries are lighter, we have to load a loader class and decoder
//  * 2. Takes time to decode a compressed file
//  * 3. Need to adapt the project accordingly
//  */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader) // Not restricted to when using DRACO compressed files

let mixer = null;

gltfLoader.load(
    // '/models/Duck/glTF/Duck.gltf',
    // '/models/Duck/glTF-Binary/Duck.glb',
    // '/models/Duck/glTF-Embedded/Duck.gltf',
    // '/models/Duck/glTF-Draco/Duck.gltf', // --> This throws error, without a DRACOLoader
    // '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        console.log('success: ', gltf)

        /**
         * Animation
         *
         * Like a music needs a player, an AnimationMixer is a player associated with an object
         * that can contain one or many AnimationClips
         */
        mixer = new THREE.AnimationMixer(gltf.scene)

        // Survey
        // const action = mixer.clipAction(gltf.animations[0])

        // Walk
        const action = mixer.clipAction(gltf.animations[1])

        // Run
        // const action = mixer.clipAction(gltf.animations[2])

        action.play()

        // To scale the size of the Fox
        gltf.scene.scale.setScalar(0.025)

        // Add duck to the scene (there are n number of ways to get the duck,
        // see the console.log to understand the many ways)
        // scene.add(gltf.scene.children[0])

        // But unlike duck, flight helmet has almost 6 children. We cannot loop and add them to the scene
        // This is because, as we add a child to the scene, it removes the element from the list,
        // hence looping through it yields dumb results
        // for (const child of gltf.scene.children) {
        //     scene.add(child)
        // }

        // SOLUTION 1 (I came up with this, no idea of its limitations)
        // scene.add(...gltf.scene.children)

        // SOLUTION 2
        // while (gltf.scene.children.length) {
        //     scene.add(gltf.scene.children[0])
        // }

        // SOLUTION 3
        // const children = [...gltf.scene.children]
        // for (const child of children) {
        //     scene.add(child)
        // }

        // SOLUTION 4
        scene.add(gltf.scene)
    },
    (progress) => {
        console.log('progress: ', progress)
    },
    (error) => {
        console.log('error: ', error)
    }
)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
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
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
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
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update mixer
    if (mixer !== null)
        mixer.update(deltaTime)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()