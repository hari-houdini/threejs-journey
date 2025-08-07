import * as THREE from 'three';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Group
 */
const group = new THREE.Group();
scene.add(group);

/**
 * Objects
 */
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);
group.add(mesh);

const geometry_2 = new THREE.BoxGeometry(1, 1, 1);
const material_2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh_2 = new THREE.Mesh(geometry_2, material_2);
mesh_2.position.x = 2;
group.add(mesh_2);

/**
 * Position
 */
group.position.y = 1;

mesh.position.y = 2;
mesh.position.set(1, 1, 1);
scene.add(mesh);

mesh.position.normalize();
console.log(mesh.position.length());

/**
 * Scale
 */
mesh.scale.set(0.5, 1.5, 0.75);
console.log(mesh.scale.length());

/**
 * Rotation
 */
mesh.rotation.reorder('ZYX');
mesh.rotation.x = Math.PI / 2;
mesh.rotation.y = Math.PI / 3;
mesh.rotation.z = Math.PI / 4;

/**
 * Axes helper
 */
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

/**
 * Sizes
 */
const sizes = {
  width: 800,
  height: 600,
};

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height
);
camera.position.z = 3;
scene.add(camera);

console.log(mesh.position.distanceTo(camera.position));

/**
 * Look at
 */
camera.lookAt(mesh.position);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
