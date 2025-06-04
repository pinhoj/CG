import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let house = new THREE.Object3D();
let tree = new THREE.Object3D();
let ovni = new THREE.Object3D();
let trees = [];
let cameras = [], camera, scene, renderer;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createMaterials() {

}

function createTree(trunkHeight = 12, trunkIncline = 0.2, branchInclines = [0.5, -0.5, 0], foliageCount = 2){
    const tree = new THREE.Group();

    // Tronco
    const trunkGeometry = new THREE.CylinderGeometry(1.2, 1.5, trunkHeight, 16);
    const trunk = new THREE.Mesh(trunkGeometry, materials.get("tree trunk"));
    trunk.position.y = trunkHeight / 2;
    tree.add(trunk);

    // Ramos
    for (let i = 0; i < 3; i++) {
        const branchGeometry = new THREE.CylinderGeometry(0.5, 0.7, trunkHeight * 0.5, 1);
        const branch = new THREE.Mesh(branchGeometry, trunkMaterial);
        branch.position.y = trunkHeight * 0.85;
        branch.position.x = Math.sin(branchInclines[i]) * 2.5;
        branch.position.z = Math.cos(branchInclines[i]) * 2.5;
        branch.position.z = branchInclines[i];
        tree.add(branch);
    }

    // Copa
    for (let i = 0; i < foliageCount; i++){
        const foliageGeometry = new THREE.SphereGeometry(3.5, 16, 16);
        const foliage = new THREE.Mesh(foliageGeometry, materials.get("tree foliage"));
        foliage.scale.set(1.2, 0.8 + Math.random() * 0.4, 1.2);
        foliage.position.y = trunkHeight + 1.5 + i * 2;
        foliage.position.x = (i - 2) * 2;
        tree.add(foliage);
    }

}


function createWalls(x, y, z) {
    
    const wall = new THREE.Group();

    // Front Wall

    let wallFront = new THREE.Group();

    let vertices = new Float32Array([
        2,0,13,     7,0,13,     7,9,13,     2,9,13
    ]);

    let indices = new Uint32Array([0, 1, 2, 0, 2, 3]);

    let g = new THREE.BufferGeometry();s
    g.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    g.setIndex(new THREE.BufferAttribute(indices, 1));
    g.computerVertexNormals();

    let seg1 = new THREE.Mesh(g, materials.get("house body"));
    
    vertices = new Float32Array([
        7,0,13,     13,0,13,    13,5,13,    7,5,13
    ]);

    g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    g.setIndex(new THREE.BufferAttribute(indices, 1));
    g.computeVertexNormals();

    let seg2 = new THREE.Mesh(g, materials.get("house body"));
    wallFront.add(seg2);

    vertices = new Float32Array([
        13,0,13,    20,0,13,    20,9,13,    13,9,13
    ]);
    
    g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    g.setIndex(new THREE.BufferAttribute(indices, 1));
    
    let seg3 = new THREE.Mesh(g, materials.get("house body"));
    wallFront.add(seg3);

    wallFront.position.set(0, 0, 0);
    wall.add(wallFront);

    // Back Wall
    let wallBack = new THREE.Group();
    
    vertices = new Float32Array([
        2, 0, 2,    20, 0, 2,   20, 9, 2,   2, 9, 2
    ]);

    g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    g.setIndex(new THREE.BufferAttribute(indices, 1));
    g.computeVertexNormals();

    let segBack = new THREE.Mesh(g, materials.get("house body"));
    wallBack.add(segBack);
    wallBack.position.set(0, 0, 0);
    wall.add(wallBack);

    // Left Wall
    let wallLeft = new THREE.Group();
    
    vertices = new Float32Array([
        2, 0, 2,    2, 0, 13,   2, 9, 13,   2, 9, 2
    ]);

    g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    g.setIndex(new THREE.BufferAttribute(indices, 1));
    g.computeVertexNormals();

    let segLeft = new THREE.Mesh(g, materials.get("house body"));
    wallLeft.add(segLeft);
    wallLeft.position.set(0,0,0);
    wall.add(wallLeft);

    // Right Wall

    let wallRight = new THREE.Group();

    vertices = new Float32Array([
        20, 0, 2,   20, 0, 6,   20, 3, 6,   20, 3, 2
    ]);

    g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    g.setIndex(new THREE.BufferAttribute(indices, 1));
    g.computeVertexNormals();

    let segRight1 = new THREE.Mesh(g, materials.get("house body"));
    wallRight.add(segRight1);

    vertices = new Float32Array([
        20, 3, 6,   20, 3, 10,  20, 6, 10,    20, 6, 6
    ]);

    g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    g.setIndex(new THREE.BufferAttribute(indices, 1));
    g.computeVertexNormals();

    let segRight2 = new THREE.Mesh(g, materials.get("house body"));
    wallRight.add(segRight2);

    vertices = new Float32Array([
        20, 6, 10,  20, 6, 13,  20, 9, 13,  20, 9, 10
    ]);

    g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(vertices,  3));
    g.setIndex(new THREE.BufferAttribute(indices, 1));
    g.computeVertexNormals();

    let segRight3 = new THREE.Mesh(g, materials.get("house body"));
    wallRight.add(segRight3);

    wallRight.position.set(0, 0, 0);
    wall.add(wallRight);
}

function createOVNILights(){
    const nLights = 6;
    let theta;
    ovni.ovniPointLights = [];

    for(let i = 0; i < nLights; i++){
        theta = i * (2 * Math.PI) / nLights;

        let pivot = new THREE.Object3D();
        pivot.rotation.y = theta;
        ovni.add(pivot);

        let geometry = new THREE.SphereGeometry(0.22, 12, 12, 0, 2 * Math.PI, 0, 0.6 * Math.PI);
        let mesh = new THREE.Mesh(geometry, materials.get("ovni light"));
        mesh.rotation.x = Math.PI;
        mesh.rotation.set(1.8, -0.3, 0);

        let pointLight = new THREE.PointLight(materials.get("point light"), 0.18, 30, 2.0);
        pointLight.position.set(0, 0, 0);

        pivot.add(mesh);
        pivot.add(pointLight);

        ovni.ovniPointLights.push(pointLight);
    }
}

function createDoorsAndWindows(house){

    let vertices = new Float32Array([
        9, 0, 13,    11, 0, 13,   11, 4, 13,   9, 4, 13
    ]);

    let indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    let door = new THREE.Mesh(g, materials.get("door"));
    house.add(door);

    vertices = new Float32Array([
        4, 6, 13,   6, 6, 13,    6, 8 , 13,     4, 8 , 13 
    ]);

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices,  3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    let window1 = new THREE.Mesh(geometry, materials.get("window"));
    house.add(window1);

    vertices = new Float32Array([
        14, 6, 13,  16, 6, 13,  16, 8, 13,  14, 8, 13
    ]);

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();
    let window2 = new THREE.Mesh(geometry, materials.get("window"));
    house.add(window2);

}

function createRoof(house){

    let vertices = new Float32Array([
        2, 9, 2,    20, 9, 2,   11, 13, 7.5,
        20, 9, 2,   20, 9, 13,  11, 13, 7.5,
        20, 9, 13,  2, 9, 13,   11, 13, 7.5,
        2, 9, 13,   2, 9, 2,    11, 13, 7.5
    ]);

    let indices = new Uint32Array([
        0, 1, 2,    3, 4, 5,    6, 7, 8,    9, 10, 11
    ]);

    let geometry = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(vertices,  3));
    g.setIndex(new THREE.BufferAttribute(indices,  1));
    g.computeVertexNormals();
    let roof = new THREE.Mesh(g, materials.get("roof"));
    house.add(roof);
}

function createHouse(x, y, z){

    house = new THREE.Object3D();

    createWalls(x, y, z);
    createDoorsAndWindows(x, y, z);
    createRoof(x, y, z);

    scene.add(house);
}



function createOVNI(x, y, z){

    ovni = new THREE.Object3D();

    // Body
    let geometry = new THREE.SphereGeometry(2.5, 25, 50);
    let mesh = new THREE.Mesh(geometry, materials.get("ovni"));
    mesh.position.set(0, 0, 0);
    mesh.scale.set(1.2, 0.22, 1.2);
    ovni.add(mesh);

    // Cockpit
    geometry = new THREE.SphereGeometry(1.1, 20, 30, 0, 2 * Math.PI, 0 , 0.5 * Math.PI);
    mesh = new THREE.Mesh(geometry, materials.get("cockpit"));
    mesh.position.set(0, 0.45, 0);
    ovni.add(mesh);

    // Disco Inferior
    geometry = new THREE.CylinderGeometry(1.3, 1.3, 0.18, 32);
    mesh = new THREE.Mesh(geometry, materials.get("beam"));
    mesh.position.set(0, -0.55, 0);
    ovni.add(mesh);

    // Spotlight
    let spotlight = new THREE.SpotLight(materials.get("spotlight"), 0.7, 30, Math.PI/7, 0.3);
    spotLight.position.set(0, -0.55, 0);
    spotLight.target.position.set(0, -10, 0);
    mesh.add(spotLight);
    mesh.add(spotLight.target);
    ovni.spolight = spotLight;

    // Luzes do ovni
    cretateOVNILights();

    ovni.poisition.set(x, y, z);
    scene.add(ovni);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {

}
////////////
/* UPDATE */
////////////
function update() {
    delta = clock.getDelta();

    
}
function checkTransformations() {

}

/////////////
/* DISPLAY */
/////////////
function render() {
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    clock.start()

    createMaterials();
    createScene();
    // createCameras();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {

    update();
    render();
    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    pressedKeys[e.key] = true;
    switch (e.key) {
        case "ArrowUp":
            break;
        case "ArrowDown":
            break;
        case "ArrowLeft":
            break;
        case "ArrowRight":
            break;
        case "1": // 1
            break;
        case "2": // 2
            break;
        case "3": // 3
            break;
        case "4": // 4
            break;
        case "7": // 7
            break;
        case "q": // q
            break;
        case "a": // a
            break;
        case "w": // w
            break;
        case "s": // s
            break;
        case "e": //e
            break;
        case "d": // d
            break;
        case "r": // r
            break;
        case "f": // f
            break;
    }
    // if (["q", "a", "w", "s", "e", "d", "r", "f", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        
    //     if (pressedKeys["q"] && pressedKeys["a"]) {
    //         rotateFeet = 0;
    //     }
        
    // }
}
///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    pressedKeys[e.key] = false;
    switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
            // if (pressedKeys["ArrowUp"] && !pressedKeys["ArrowDown"]) {
            //     trailerMove.z = 2;
            // } else if (!pressedKeys["ArrowUp"] && pressedKeys["ArrowDown"]) {
            //     trailerMove.z = -2;
            // } else {
            //     trailerMove.z = 0;
            // }
            break;
        case "ArrowLeft":
        case "ArrowRight":
            
            break;
        case "q":
        case "a":
            
            break;
        case "w":
        case "s":
            
            break;
        case "e":
        case "d":
            
            break;
        case "r":
        case "f":
            
            break;
    }
}

init();
animate();