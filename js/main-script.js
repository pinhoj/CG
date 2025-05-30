import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////


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



function addSnapPiece(trailer,x,y,z){
    const boxGeometry = new THREE.BoxGeometry(20, 10, 10);
    const mesh = new THREE.Mesh(boxGeometry, materials.get("pipe"));
    mesh.position.set(x,y,z);
    trailer.add(mesh);
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