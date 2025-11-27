import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from "three/addons";
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
 * Model
 */
const gltfLoader = new GLTFLoader()
let model = null
gltfLoader.load('/models/Duck/glTF/Duck.gltf', (gltf) => {
    model = gltf.scene // group, not mesh
    model.position.y = -1.2
    scene.add(model)
})

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('#fff', 0.9)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#fff', 2.1)
directionalLight.position.set(1, 2, 3)
scene.add(directionalLight)

/**
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

/**
 * Raycaster - cast a ray and observe the objects it intersects
 *
 * Few use cases:
 * 1. Check if there's a wall in front of a player
 * 2. Test if lazer gun would hit something
 * 3. Observe is something is under to stimulate events
 * 4. Alert when spaceship is heading towards a planet
 */
const raycaster = new THREE.Raycaster()

// const rayOrigin = new THREE.Vector3(-3, 0, 0)
// const rayDirection = new THREE.Vector3(10, 0 ,0)
//
// rayDirection.normalize() // Length normalised (one unit), not coordinates
// console.log(rayDirection.length()) // should be equal to one
//
// raycaster.set(rayOrigin, rayDirection)
//
// // See point 3 mentioned below
// object1.updateMatrixWorld()
// object2.updateMatrixWorld()
// object3.updateMatrixWorld()
//
// const intersect = raycaster.intersectObject(object2)
// console.log(intersect)
//
// const intersects = raycaster.intersectObjects([object1, object2, object3])
// console.log(intersects)

// /**
//  * Understanding the logs
//  *
//  * 1. "intersect" still returns an array similar to "intersects", because raycaster can penetrate the same object at multiple points (like a donut)
//  * 2. distance - distance between origin of object and collision point
//  * 3. distance returns the same value (in this case 2.5 for all objects) because we raycast immediately,
//  * even which may have been calculated even before rendering. To fix it use "object.updateMatrixWorld()"
//  * 4. face - which face of the geometry had the collision
//  * 5. object - object involved in collision
//  * 6. point - exact point of collision
//  * 7. uv - uv coordinates in that geometry
//  */

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
 * Cursor
 */
const mouse = new THREE.Vector2() // Focusing on XY (because mouse can move only in those two directions in the screen)

window.addEventListener('mousemove', (_event) => {
    // Modifying pixel values to THREE JS scene units
    mouse.x = ((_event.clientX / sizes.width) * 2) - 1
    mouse.y = - (((_event.clientY / sizes.width) * 2) - 1)
})

window.addEventListener('click', (_) => {
    // console.log(currentIntersect)
    if (currentIntersect) {
        console.log("clicked on a sphere")

        switch (currentIntersect.object) {
            case object1:
                console.log('clicked on object 1')
                break;

            case object2:
                console.log('clicked on object 2')
                break;

            case object3:
                console.log('clicked on object 3')
                break;
        }
    }
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

// Witness variable for mouse enter/leave events
let currentIntersect = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Animate object
    object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
    object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
    object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

    // Create a ray

    // const rayOrigin = new THREE.Vector3(-3, 0, 0)
    // const rayDirection = new THREE.Vector3(1, 0, 0)
    // rayDirection.normalize()
    //
    // raycaster.set(rayOrigin, rayDirection)

    // Use this instead of origin/direction, based on the use case
    raycaster.setFromCamera(mouse, camera)

    const objectsToTest = [object1, object2, object3]
    const intersects = raycaster.intersectObjects(objectsToTest)

    // // Objects in the path of target
    // // console.log(intersects.length)

    for (const object of objectsToTest) {
        // Reset all the values to red
        object.material.color.set('#ff0000')
    }

    for (const intersect of intersects) {
        // Set every hit target to blue
        intersect.object.material.color.set('#0000ff')
    }

    if (intersects.length) {
        // console.log("something's hovered")
        // if (currentIntersect === null) {
        //     console.log("mouse enter")
        // }
        currentIntersect = intersects[0]
    } else  {
        // console.log("nothing's hovered")
        // if (currentIntersect !== null) {
        //     console.log("mouse leave")
        // }
        currentIntersect = null
    }

    if (model) {
        const modelIntersects = raycaster.intersectObject(model)
        if (modelIntersects.length) {
            model.scale.setScalar(1.2) // Magnify on hover
        } else {
            model.scale.setScalar(1)
        }
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()