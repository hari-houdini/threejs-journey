import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Sky } from 'three/addons/objects/Sky.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'

// Assume the unit here is in meters to maintain uniformity
// For example, 20 units for floor height would be considered as 20m.

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
 * Axes Helper
 */
// const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

// Floor
const floorAlphaTexture = textureLoader.load('/floor/alpha.jpg')

const floorColorTexture = textureLoader.load('/floor/burned_ground_01_1k/burned_ground_01_diff_1k.jpg')
const floorARMTexture = textureLoader.load('/floor/burned_ground_01_1k/burned_ground_01_arm_1k.jpg')
const floorNormalTexture = textureLoader.load('/floor/burned_ground_01_1k/burned_ground_01_nor_gl_1k.jpg')
const floorDisplacementTexture = textureLoader.load('/floor/burned_ground_01_1k/burned_ground_01_disp_1k.jpg')

// Since the texture is too big, we need to scale it to fit using repeat
floorColorTexture.repeat.set(8, 8)
floorColorTexture.wrapS = THREE.RepeatWrapping
floorColorTexture.wrapT = THREE.RepeatWrapping
// Color textures are normally optimised in terms of color,
// so we need to set it to SRGB to bring it out of that flat profile
floorColorTexture.colorSpace = THREE.SRGBColorSpace

floorARMTexture.repeat.set(8, 8)
floorARMTexture.wrapS = THREE.RepeatWrapping
floorARMTexture.wrapT = THREE.RepeatWrapping

floorNormalTexture.repeat.set(8, 8)
floorNormalTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping

floorDisplacementTexture.repeat.set(8, 8)
floorDisplacementTexture.wrapS = THREE.RepeatWrapping
floorDisplacementTexture.wrapT = THREE.RepeatWrapping

// Wall
const wallColorTexture = textureLoader.load('/wall/damaged_plaster_1k/damaged_plaster_diff_1k.jpg')
const wallARMTexture = textureLoader.load('/wall/damaged_plaster_1k/damaged_plaster_arm_1k.jpg')
const wallNormalTexture = textureLoader.load('/wall/damaged_plaster_1k/damaged_plaster_nor_gl_1k.jpg')

wallColorTexture.repeat.set(1.5, 1.5)
wallColorTexture.wrapS = THREE.RepeatWrapping
wallColorTexture.wrapT = THREE.RepeatWrapping
wallColorTexture.colorSpace = THREE.SRGBColorSpace

wallARMTexture.repeat.set(1.5, 1.5)
wallARMTexture.wrapS = THREE.RepeatWrapping
wallARMTexture.wrapT = THREE.RepeatWrapping

wallNormalTexture.repeat.set(1.5, 1.5)
wallNormalTexture.wrapS = THREE.RepeatWrapping
wallNormalTexture.wrapT = THREE.RepeatWrapping

// Roof
const roofColorTexture = textureLoader.load('/roof/roof_07_1k/roof_07_diff_1k.jpg')
const roofARMTexture = textureLoader.load('/roof/roof_07_1k/roof_07_arm_1k.jpg')
const roofNormalTexture = textureLoader.load('/roof/roof_07_1k/roof_07_nor_gl_1k.jpg')

roofColorTexture.repeat.set(3, 1)
roofColorTexture.wrapS = THREE.RepeatWrapping
roofColorTexture.colorSpace = THREE.SRGBColorSpace

roofARMTexture.repeat.set(3, 1)
roofARMTexture.wrapS = THREE.RepeatWrapping

roofNormalTexture.repeat.set(3, 1)
roofNormalTexture.wrapS = THREE.RepeatWrapping

// Bush
// As part of texture optimisation, always convert jpg or png to
// webp (good performance, good support) or
// Basis (GPU friendly, but more artifacts)
const bushColorTexture = textureLoader.load('/bush/dry_decay_leaves_1k/dry_decay_leaves_diff_1k.webp')
const bushARMTexture = textureLoader.load('/bush/dry_decay_leaves_1k/dry_decay_leaves_arm_1k.webp')
const bushNormalTexture = textureLoader.load('/bush/dry_decay_leaves_1k/dry_decay_leaves_nor_gl_1k.webp')

bushColorTexture.repeat.set(2, 1)
bushColorTexture.wrapS = THREE.RepeatWrapping
bushColorTexture.colorSpace = THREE.SRGBColorSpace

bushARMTexture.repeat.set(2, 1)
bushARMTexture.wrapS = THREE.RepeatWrapping

bushNormalTexture.repeat.set(2, 1)
bushNormalTexture.wrapS = THREE.RepeatWrapping

// Bush
const graveColorTexture = textureLoader.load('/grave/lichen_rock_1k/lichen_rock_diff_1k.jpg')
const graveARMTexture = textureLoader.load('/grave/lichen_rock_1k/lichen_rock_arm_1k.jpg')
const graveNormalTexture = textureLoader.load('/grave/lichen_rock_1k/lichen_rock_nor_gl_1k.jpg')

graveColorTexture.repeat.set(0.3, 0.4)
graveColorTexture.colorSpace = THREE.SRGBColorSpace
graveARMTexture.repeat.set(0.3, 0.4)
graveNormalTexture.repeat.set(0.3, 0.4)

// Door
const doorColorTexture = textureLoader.load("/door/color.jpg")
const doorAlphaTexture = textureLoader.load("/door/alpha.jpg")
const doorAmbientOcclusionTexture = textureLoader.load("/door/ambientOcclusion.jpg")
const doorHeightTexture = textureLoader.load("/door/height.jpg")
const doorMetalnessTexture = textureLoader.load("/door/metalness.jpg")
const doorRoughnessTexture = textureLoader.load("/door/roughness.jpg")
const doorNormalTexture = textureLoader.load("/door/normal.jpg")

doorColorTexture.colorSpace = THREE.SRGBColorSpace

/**
 * House
 */
const house = new THREE.Group()
scene.add(house)

// Walls
const wallParams = {
    width: 4,
    height: 2.5,
    depth: 4
}

const walls = new THREE.Mesh(
    new THREE.BoxGeometry(
        wallParams.width,
        wallParams.height,
        wallParams.depth
    ),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        metalnessMap: wallARMTexture,
        normalMap: wallNormalTexture
    })
)
// Half the house is buried in the ground
walls.position.y += wallParams.height / 2
house.add(walls)

// Roof
const roofParams = {
    radius: 3.5,
    height: 1.5,
}

// The texture might appear skewed to one angle and lighting not 100% accurate
// This is a problem with how Code geometry calculates its uv and normal.
// Hard to solve it but there are two options
// 1. Use 3D software like Blender and set proper UV
// 2. Use Buffer Geometry, modify attributes (and normal using computeVertexNormals)
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(roofParams.radius, roofParams.height, 4),
    new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        normalMap: roofNormalTexture
    })
)
roof.position.y += wallParams.height + (roofParams.height / 2)
roof.rotation.y = Math.PI * 0.25
house.add(roof)

// Door
const doorParams = {
    width: 2.2,
    height: 2.2,
}

const door = new THREE.Mesh(
    new THREE.PlaneGeometry(doorParams.width, doorParams.height, 50, 50),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.15,
        displacementBias: -0.04,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
    })
)
door.position.y += 1
door.position.z += (wallParams.depth / 2) + 0.01 // To eliminate z-fighting
house.add(door)

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({
    color: '#ccffcc', // Make the material more greenish
    map: bushColorTexture,
    aoMap: bushARMTexture,
    roughnessMap: bushARMTexture,
    metalnessMap: bushARMTexture,
    normalMap: bushNormalTexture
})

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)
// We rotate to hide the problem we had with roof.
// We could either follow the two solutions mentioned or simply rotate to hide it
bush1.rotation.x = -0.75

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)
bush2.rotation.x = -0.75

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-0.8, 0.1, 2.2)
bush3.rotation.x = -0.75

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(-1, 0.05, 2.6)
bush4.rotation.x = -0.75

house.add(bush1, bush2, bush3, bush4)

/**
 * Graves
 */
const graves = new THREE.Group()
scene.add(graves)

const graveParams = {
    width: 0.6,
    height: 0.8,
    depth: 0.2,
    total: 30
}

const graveGeometry = new THREE.BoxGeometry(
    graveParams.width,
    graveParams.height,
    graveParams.depth
)
const graveMaterial = new THREE.MeshStandardMaterial({
    map: graveColorTexture,
    aoMap: graveARMTexture,
    roughnessMap: graveARMTexture,
    metalnessMap: graveARMTexture,
    normalMap: graveNormalTexture
})

for (let i = 0; i < graveParams.total; i++) {
    // Get a random angle between 0 and 360
    const angle = Math.random() * Math.PI * 2

    // We don't want the graves to be in house
    // We want it to be outside the radius of the house (~wallParams.depth)
    // But should be within the boundaries of the scene (which is houseRadius + someDistance)
    // That someDistance here is selected to be 4
    const radius = wallParams.depth + (Math.random() * 4)

    // Passing that angle to sine and cosine would give the coordinates on the plane (here XZ plane)
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius

    const grave = new THREE.Mesh(graveGeometry, graveMaterial)
    grave.position.set(
        x,
        Math.random() * (graveParams.height / 2), // Buried in the ground at random depths
        z
    )

    // Math.random is between 0 and 1, which makes everything rotate in positive direction
    // So diff by 0.5 to adjust the range from -0.5 to 0.5
    // To minimise the rotation we multiply it by 0.4
    grave.rotation.set(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
    )
    graves.add(grave)
}

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
        transparent: true,
        alphaMap: floorAlphaTexture,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.4, // To slightly tone down the aggressive bumps on 50x50 segments on the place
        displacementBias: 0.01 // To bring the floor down a bit post-displacement
    })
)
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

gui.add(floor.material, 'displacementScale').min(0).max(1).step(0.001)
gui.add(floor.material, 'displacementBias').min(-1).max(1).step(0.001)

/**
 * Lights
 */
// Ambient light - Moonlight
const ambientLight = new THREE.AmbientLight('#86cdff', 0.075)
scene.add(ambientLight)

// Directional light - Moonlight
const directionalLight = new THREE.DirectionalLight('#86cdff', 1)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

// Point light - Door light (warm)
const doorLight = new THREE.PointLight('#ff7d46', 5)
doorLight.position.set(0, 2.2, 2.5)
house.add(doorLight)

/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight('#8800ff', 6)
const ghost2 = new THREE.PointLight('#ff0088', 6)
const ghost3 = new THREE.PointLight('#ff0000', 6)
scene.add(ghost1, ghost2, ghost3)

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
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
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
 * Shadows
 */
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// Cast and receive
directionalLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

// We are not activating shadows for door light
// because it's not very important to accommodate for performance tradeoff
walls.castShadow = true
walls.receiveShadow = true

floor.receiveShadow = true
roof.castShadow = true

graves.children.forEach((grave)=> {
    grave.castShadow = true
    grave.receiveShadow = true
})

// Mapping
directionalLight.shadow.mapSize.set(256, 256)
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 20

ghost1.shadow.mapSize.set(256, 256)
ghost1.shadow.camera.far = 10

ghost2.shadow.mapSize.set(256, 256)
ghost2.shadow.camera.far = 10

ghost3.shadow.mapSize.set(256, 256)
ghost3.shadow.camera.far = 10

/**
 * Sky
 */
const sky = new Sky()
// Sky is a box so we need to make it big and fit the scene within it to make it work
sky.scale.set(100, 100, 100)
scene.add(sky)

sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.95
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)

/**
 * Fog
 */
// Near and Far values dictate where the fog starts and where fog becomes opaque
// scene.fog = new THREE.Fog('#04343f',1, 13)

// Another approach to do it
scene.fog = new THREE.FogExp2('#04343f',0.2)

/**
 * Animate
 */
const timer = new Timer()

const tick = () =>
{
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Ghost
    // 0.5 to slow the ghost
    const ghost1Angle = elapsedTime * 0.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    // Triple sine/cosine action to create randomness
    // Try in "Desmos" calculator and understand the randomness in the wave
    ghost1.position.y = (
        Math.sin(ghost1Angle) *
        Math.sin(ghost1Angle * 2.34) *
        Math.sin(ghost1Angle * 3.45)
    ) + 1.5 // Offset to make the ghost float in air

    const ghost2Angle = elapsedTime * 0.75
    ghost2.position.x = Math.sin(ghost2Angle) * 5
    ghost2.position.z = Math.cos(ghost2Angle) * 5
    // Triple sine/cosine action to create randomness
    // Try in "Desmos" calculator and understand the randomness in the wave
    ghost2.position.y = (
        Math.sin(ghost2Angle) *
        Math.sin(ghost2Angle * 2.34) *
        Math.sin(ghost2Angle * 3.45)
    )

    const ghost3Angle = elapsedTime * 0.25
    ghost3.position.x = Math.sin(ghost3Angle) * 6
    ghost3.position.z = Math.cos(ghost3Angle) * 6
    // Triple sine/cosine action to create randomness
    // Try in "Desmos" calculator and understand the randomness in the wave
    ghost3.position.y = (
        Math.sin(ghost3Angle) *
        Math.sin(ghost3Angle * 2.34) *
        Math.sin(ghost3Angle * 3.45)
    ) + 1 // Offset to make the ghost float in air

    // My attempt at making the door light flicker
    doorLight.intensity = Math.abs(
        Math.sin(elapsedTime) *
        Math.sin(elapsedTime * 2.34) *
        Math.sin(elapsedTime * 3.45)
    ) * 5

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()