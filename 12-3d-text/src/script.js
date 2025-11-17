import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import GUI from 'lil-gui'

// Can also load THREE JS predefined typefaces, but we move it to static and use from there
// import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axes Helper
const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/8.png')
matcapTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Fonts
 */
// Older versions instantiate Font Loader this way.
// const fontLoader = new THREE.FontLoader()
const fontLoader = new FontLoader()

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        console.log('Font loaded')

        // Older versions instantiate Text Geometry this way.
        // const textGeometry = new THREE.TextBufferGeometry(
        //     ...params
        // )

        const BEVEL_SIZE = 0.02
        const BEVEL_THICKNESS = 0.03

        const textGeometry = new TextGeometry(
            'Hari Lottie Nidhi', {
                font,
                size: 0.5,
                // Older versions used height, newer moved to depth to achieve the same
                // height: 0.2,
                depth: 0.2,
                curveSegments: 3,
                bevelEnabled: true,
                bevelThickness: BEVEL_THICKNESS,
                bevelSize: BEVEL_SIZE,
                bevelOffset: 0,
                bevelSegments: 2,
            }
        )

        /**
         * Solution 1: Computing Bounding Box and Translating
         */
        // By default, THREE JS uses spherical bounding
        // textGeometry.computeBoundingBox()

        // Move the geometry by half to the left on all axes to center it.
        // textGeometry.translate(
        //     - textGeometry.boundingBox.max.x  * 0.5,
        //     - textGeometry.boundingBox.max.y  * 0.5,
        //     - textGeometry.boundingBox.max.z  * 0.5
        // )

        // NOTE: This may not exactly center it due to Bevel
        // (As observed in the console log for min and max values which should be exact opposites)
        // textGeometry.computeBoundingBox()
        // console.log(textGeometry.boundingBox)

        // To solve that we may need to adjust the Bevel size and thickness
        // textGeometry.translate(
        //     - (textGeometry.boundingBox.max.x - BEVEL_SIZE)  * 0.5,
        //     - (textGeometry.boundingBox.max.y - BEVEL_SIZE) * 0.5,
        //     - (textGeometry.boundingBox.max.z - BEVEL_THICKNESS)  * 0.5
        // )

        // Now it would exact center
        // textGeometry.computeBoundingBox()
        // console.log(textGeometry.boundingBox)

        /**
         * Solution 2: Using center() method
         */
        textGeometry.center()

        // const textMaterial = new THREE.MeshBasicMaterial({
        //     wireframe: true
        // })

        const textMaterial = new THREE.MeshMatcapMaterial({
            matcap: matcapTexture
        })

        const text = new THREE.Mesh(textGeometry, textMaterial)
        scene.add(text)

        console.time('donuts')

        // Wrong way to create 100 donuts (Takes 10ms)

        // for (let i = 0; i < 100; i++) {
        //     const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
        //     const donutMaterial = new THREE.MeshMatcapMaterial({
        //         matcap: matcapTexture
        //     })
        //     const donut = new THREE.Mesh(donutGeometry, donutMaterial)
        //
        //     // Randomize Position
        //     donut.position.x = (Math.random() - 0.5) * 10
        //     donut.position.y = (Math.random() - 0.5) * 10
        //     donut.position.z = (Math.random() - 0.5) * 10
        //
        //     // Randomize Rotation
        //     donut.rotation.x = Math.random() * Math.PI
        //     donut.rotation.y = Math.random() * Math.PI
        //
        //     // Randomize Magnitude (Incorrect way)
        //     // donut.scale.x  = Math.random()
        //     // donut.scale.y  = Math.random()
        //     // donut.scale.z  = Math.random()
        //
        //     // Randomize Magnitude (Correct way)
        //     const scale = Math.random()
        //     // donut.scale.x  = scale
        //     // donut.scale.y  = scale
        //     // donut.scale.z  = scale
        //     donut.scale.set(scale, scale, scale) // Uniform across all three axes
        //
        //     scene.add(donut)
        // }
        //
        // console.timeEnd('donuts')

        // Right way (close to 1ms)
        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
        const donutMaterial = new THREE.MeshMatcapMaterial({
            matcap: matcapTexture
        })
        for (let i = 0; i < 100; i++) {
            const donut = new THREE.Mesh(donutGeometry, donutMaterial)

            // Randomize Position
            donut.position.x = (Math.random() - 0.5) * 10
            donut.position.y = (Math.random() - 0.5) * 10
            donut.position.z = (Math.random() - 0.5) * 10

            // Randomize Rotation
            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI

            // Randomize Magnitude
            const scale = Math.random()
            donut.scale.set(scale, scale, scale)

            scene.add(donut)
        }

        console.timeEnd('donuts')
    }
)

/**
 * Object
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )
//
// scene.add(cube)

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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()