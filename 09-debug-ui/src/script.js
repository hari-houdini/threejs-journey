import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import GUI from 'lil-gui'

/**
 * Debug
 */
const gui = new GUI({
    width: 340,
    title: "Debug UI",
    closeFolders: true
})

// By default, if needed, have the main debug tool minimised
gui.close()

// By default, we could also have it hidden. And maybe show only on certain cases
gui.hide()

window.addEventListener('keypress', (event) => {
    if (event.key === 'h')
        // This does more like a one-time event
        // gui.show()
        // To toggle it multiple times, use below
        gui.show(gui._hidden)
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const debugObject = {}

/**
 * Object
 */
debugObject.color = '#ff00ff'

const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
const material = new THREE.MeshBasicMaterial({ color: debugObject.color, wireframe: true })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// REMEMBER: We could only debug a property of an "Object"
// To work with a user-defined value, the option to debug is to make it into an "Object"
// const someObject = {
//     myVariable: 12
// }
// gui.add(someObject, 'myVariable')

// -------------------------------------------------

// Add Folder - Debug (Optional)
// Anything with 'cubeAttrs' would be placed within the folder
// and anything that uses 'gui' directly would be placed at the root
const cubeAttrs = gui.addFolder("Awesome Cube")

// By default, if needed, have the folder minimised
cubeAttrs.close()

// -------------------------------------------------

// RANGE - Debug
// gui.add(mesh.position, 'y', -3, 3, 0.01)
cubeAttrs
    .add(mesh.position, 'y')
    .min(-3)
    .max(3)
    .step(0.01)
    .name("Elevation")

// -------------------------------------------------

// CHECKBOX - Debug
gui
    .add(mesh, 'visible')
    .name("Show")
cubeAttrs
    .add(material, 'wireframe')
    .name("Wireframe")

// -------------------------------------------------

// COLORS - Debug
// gui
//     .addColor(material, 'color')
//     .name("Skin")

// But because of the way THREE.JS handles color space, we cannot get hex value from debug tool directly and use it.
// To understand the issue, use the above commented code and copy the new hex color fom the debug tool
// and update it in the material color. The colors wouldn't be the same.

// SOLUTION 1: To avoid that, we could get the value (which is a material:color object) and get modified hex string
gui
    .addColor(material, 'color')
    .onChange((value) => {
        console.log(value.getHexString())
    })
    .name("Solution 1")

// SOLUTION 2 (Recommended): Use a global attribute object that contains the color, to update and set material data
cubeAttrs
    .addColor(debugObject, 'color')
    .onChange((value) => {
        // material.color.set(debugObject.color)
        material.color.set(value)
    })
    .name("Solution 2")

// -------------------------------------------------

// BUTTONS - Debug
// Similar to Color, we may need to modify it through an object
const onClickHandler = () => {
    gsap.to(mesh.rotation, { duration: 2, y: mesh.rotation.y + 2 * Math.PI })
}
debugObject.spin = onClickHandler
cubeAttrs
    .add(debugObject, 'spin')
    .name("Spin")

// -------------------------------------------------

// TASK: Update the segments of the wireframe

// This would not work as it would update these properties only at the point of instantiation
// gui.add(geometry, 'widthSegments')

// To avoid that use the debugObject to update the attrs,
// destroy the old geometry and create a new one
debugObject.subdivision = 2
gui
    .add(debugObject, 'subdivision')
    .min(1)
    .max(20)
    .step(1)
    .onChange((val) => {
        // DO NOT UPDATE GEOMETRY in ONCHANGE CB, AS IT IS COMPUTATION INTENSIVE
        console.log("Updated Subdivisions: ", val)
    })
    .onFinishChange((val) => {
        // Hence update the geometry at this CB.
        console.log("Finished Subdivisions", val)

        // Old geometries are sitting in the GPU memory somewhere, causing memory leaks.
        // So, before creating a new one, dispose the previous.
        mesh.geometry.dispose()

        mesh.geometry = new THREE.BoxGeometry(
            1, 1, 1,
            val, val, val
        )
    })
    .name("Subdivision")

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