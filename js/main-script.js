import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let robot = new THREE.Object3D();
let trailer = new THREE.Object3D();
let cameras = [], camera, scene, renderer;
let rotateHead = 0, rotateWaist = 0, rotateFeet = 0, moveArms = 0;
let LArm, RArm, Feet = new THREE.Group(), Legs = new THREE.Group(), Head;
let delta;
let trailerMove = {x: 0, y: 0};
let pressedKeys = {};
let trailerLocked = false;
let snapping = false;
let isRobot = true;
let snapTarget = new THREE.Vector3();
const clock = new THREE.Clock();
const materials = new Map();

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();

    scene.background = new THREE.Color('#ffeedd')
    scene.add(new THREE.AxesHelper(10));
    
    createRobot(0, -100, 0);
    createTrailer(-150, 35, 0);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    const positions = new Array(new Array(200, 0, 0), // frontal
                                new Array(0, 0, 200), // lateral
                                new Array(0, 200, 0), // topo
                                new Array(200, 150, 200), // perspetiva isométrica - projeção ortogonal
                                new Array(500, 500, 500)); // perspetiva isométrica - projeção perspetiva

    for (let i = 0; i < 5; i++) {
        if (i == 4) {
            camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        } else {
            camera = new THREE.OrthographicCamera(window.innerWidth / -5,
                                            window.innerWidth / 5,
                                            window.innerHeight / 5,
                                            window.innerHeight / -5,
                                            1,
                                            1000);
        }

        camera.position.set(positions[i][0], positions[i][1], positions[i][2]);
        camera.lookAt(scene.position);
        cameras.push(camera);
    }
    camera = cameras[1];
}
////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createMaterials() {
    materials.set("trailer", new THREE.MeshBasicMaterial({ color: 0x404040, wireframe: false }));
    materials.set("wheel", new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }));
    materials.set("torso", new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false }));
    materials.set("abdomen", new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false }));
    materials.set("waist", new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false }));
    materials.set("forearm", new THREE.MeshBasicMaterial({ color: 0xff4444, wireframe: false }));
    materials.set("arm", new THREE.MeshBasicMaterial({ color: 0xff3333, wireframe: false }));
    materials.set("leg", new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false }));
    materials.set("thigh", new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }));
    materials.set("head", new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }));
    materials.set("antenna", new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }));
    materials.set("eye", new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: false }));
    materials.set("foot", new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }));
    materials.set("pipe", new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: false }));
}
function addAntena(obj, x, y, z){
    const geometry = new THREE.ConeGeometry(4, 10, 4); 
    var mesh = new THREE.Mesh(geometry, materials.get("antenna"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addEye(obj, x, y, z){
    const geometry = new THREE.BoxGeometry(1, 5, 5); 
    var mesh = new THREE.Mesh(geometry, materials.get("eye"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotHead(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(20, 20, 30); 
    const mesh = new THREE.Mesh(geometry, materials.get("head"));
    mesh.position.set(x, y, z);
    addAntena(mesh, 0, 15, -10);
    addAntena(mesh, 0, 15, 10);
    addEye(mesh, 10, 0, -6);
    addEye(mesh, 10, 0, 6);
    obj.add(mesh);

}

function addWheel(obj, x, y, z) {
    const geometry = new THREE.CylinderGeometry(8, 8, 10);
    const mesh = new THREE.Mesh(geometry, materials.get("wheel"));
    mesh.rotateX(Math.PI/2);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotTorso(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(20, 40, 70); 
    const mesh = new THREE.Mesh(geometry, materials.get("torso"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotAbdomen(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(20, 20, 30); 
    const mesh = new THREE.Mesh(geometry, materials.get("abdomen"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotWaist(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(20, 20, 70); 
    const mesh = new THREE.Mesh(geometry, materials.get("waist"));
    mesh.position.set(x, y, z);
    addWheel(mesh, -5, -5, - 40);
    addWheel(mesh, -5, -5, + 40);
    
    obj.add(mesh);
}

function addThigh(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(10, 20, 20); 
    const mesh = new THREE.Mesh(geometry, materials.get("thigh"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addFoot(x, y, z) {
    const geometry = new THREE.BoxGeometry(10, 10, 30); 
    const mesh = new THREE.Mesh(geometry, materials.get("foot"));
    mesh.position.set(x, y, z);
    Feet.add(mesh);
    mesh.add(Feet);
}

function addExhaustPipe(obj, x, y, z){
    const geometry = new THREE.CylinderGeometry(2,2,40);
    const mesh = new THREE.Mesh(geometry, materials.get("pipe"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addForearm(obj, x, y, z){
    const geometry = new THREE.BoxGeometry(40,20,20);
    const mesh = new THREE.Mesh(geometry, materials.get("forearm"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRobotArm(obj, x, y, z, left) {
    
    const geometry = new THREE.BoxGeometry(20, 40, 20); 
    const mesh = new THREE.Mesh(geometry, materials.get("arm"));
    mesh.position.set(x, y, z);

    if (left){
        addExhaustPipe(mesh, -8, 10, 10); 
        addForearm(mesh, 10, -30, 0);
    }
    else{
        addExhaustPipe(mesh, -8, 10, -10); 
        addForearm(mesh, 10, -30, 0);
    }

    obj.add(mesh);
}


function addRobotLeg(obj, x, y, z, left){
    var geometry = new THREE.BoxGeometry(10, 80, 30); 
    var mesh = new THREE.Mesh(geometry, materials.get("leg"));
    mesh.position.set(x, y, z);

    addThigh(mesh, 0, 50, 0); 
    
    if (left){
        addFoot(10, 0, 20);
        addWheel(mesh, 0, -10, + 20);
        addWheel(mesh, 0, -30, + 20);
    }
    else{
        addFoot(10, 0, -20);
        addWheel(mesh, 0, -10, - 20);
        addWheel(mesh, 0, -30, - 20);
    }
    Legs.add(mesh);   

}

function createRobot(x, y, z){  
    Legs.position.set(x, y + 110, z); 
    Feet.position.set(x + 5, y + 5, z);

    addRobotLeg(robot, x + 5, y + 40, z + 20, true);
    addRobotLeg(robot, x + 5, y + 40, z - 20, false);
    Legs.add(Feet);
    robot.add(Legs);
    
    LArm = new THREE.Object3D();
    RArm = new THREE.Object3D();
    addRobotArm(LArm, x - 10, y + 160, z + 45, true);
    addRobotArm(RArm, x - 10, y + 160, z - 45, false);
    robot.add(LArm);
    robot.add(RArm);

    addRobotTorso(robot, x + 10, y + 160, z);
    addRobotAbdomen(robot, x + 10, y + 130, z);

    addRobotWaist(robot, x + 10, y + 110, z);
    Head = new THREE.Group();
    Head.position.set(x, y + 180, z);
    addRobotHead(Head, 10, 10, 0);
    robot.add(Head);
    scene.add(robot);
}

function createTrailer(x, y, z) {
    trailer = new THREE.Object3D();

    // Contentor principal (caixa grande)
    const boxGeometry = new THREE.BoxGeometry(170, 90, 70);
    const box = new THREE.Mesh(boxGeometry, materials.get("trailer"));
    box.position.set(0, 20, 0);
    trailer.add(box);

    // Rodas
    addWheel(trailer, -60, -30, -40);
    addWheel(trailer, -40, -30, -40);
    addWheel(trailer, -60, -30, 40);
    addWheel(trailer, -40, -30, 40);

    trailer.position.set(x, y, z);
    scene.add(trailer);

}

function getAABB(obj){
    let objmin = {x:1000, y:1000, z:1000},  objmax = {x:-1000, y:-1000, z:-1000};
    obj.traverse((child)=>{
        if (child.isMesh){
            let position = child.geometry.attributes.position;
            for (let i = 0; i < position.count; i++) {
                let vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(position,i);
                let pos = vertex.applyMatrix4(child.matrixWorld); // Convert to world space
                objmin.x = Math.min(objmin.x, pos.x);
                objmin.y = Math.min(objmin.y, pos.y);
                objmin.z = Math.min(objmin.z, pos.z);
                objmax.x = Math.max(objmax.x, pos.x);
                objmax.y = Math.max(objmax.y, pos.y);
                objmax.z = Math.max(objmax.z, pos.z);
            }
        }
    })
    let Box = {min : objmin, max : objmax};
    return Box;
}

function intersectsBox(A, B) {
    return  (A.max.x > B.min.x) &&
            (A.min.x < B.max.x) && 
            (A.max.y > B.min.y) &&
            (A.min.y < B.max.y) && 
            (A.max.z > B.min.z) &&
            (A.min.z < B.max.z)
}
//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
    if (trailerLocked || snapping || isRobot) return false;
    const robotBox = getAABB(robot);
    const trailerBox = getAABB(trailer);
    return intersectsBox(robotBox, trailerBox);
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {
    snapping = true;

    snapTarget.copy(robot.position);
    snapTarget.x = -120;
    snapTarget.y = 35;
    snapTarget.z = trailer.position.z;
}

////////////
/* UPDATE */
////////////
function update() {
    delta = clock.getDelta();
    checkTransformations();
    if (!trailerLocked && !snapping) {
        trailer.position.x += trailerMove.x;
        trailer.position.y += trailerMove.y;

        if (checkCollisions()) {
            handleCollisions();
        }
    }
    if (snapping) {
        trailer.position.lerp(snapTarget, 0.1);
        if (trailer.position.distanceTo(snapTarget) < 1) {
            trailer.position.copy(snapTarget);
            trailerLocked = true;
            snapping = false;
        }
    }

    
}
function checkTransformations() {
    if (rotateFeet != 0){
        Feet.rotation.z = THREE.MathUtils.clamp(Feet.rotation.z + Math.PI/32 * rotateFeet, -Math.PI / 2, 0);
    }
    if (rotateWaist != 0){
        Legs.rotation.z = THREE.MathUtils.clamp(Legs.rotation.z + Math.PI/32 * rotateWaist, -Math.PI / 2, 0);
    }
    if (moveArms != 0){
        let LVector = new THREE.Vector3(0, 0, moveArms);
        LArm.position.add(LVector);
        LArm.position.z = THREE.MathUtils.clamp(LArm.position.z, -20, 0);
        let RVector = new THREE.Vector3(0, 0, -moveArms);
        RArm.position.add(RVector);
        RArm.position.z = THREE.MathUtils.clamp(RArm.position.z, 0, 20);
    }
    if (rotateHead != 0){
        Head.rotation.z = THREE.MathUtils.clamp(Head.rotation.z - (Math.PI/32 * rotateHead), 0, Math.PI);
    }
    if (Feet.rotation.z == -Math.PI/2 && Legs.rotation.z == -Math.PI/2 && 
        Head.rotation.z == Math.PI && LArm.position.z == -20){
            isRobot = false;
    }
    else isRobot = true;
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
    createCameras();

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
            trailerMove.y = 2;
            break;
        case "ArrowDown":
            trailerMove.y = -2;
            break;
        case "ArrowLeft":
            trailerMove.x = -2;
            break;
        case "ArrowRight":
            trailerMove.x = 2;
            break;
        case "1": // q
            camera = cameras[0];
            break;
        case "2": // 
            camera = cameras[1];
            break;
        case "3": // 3
            camera = cameras[2];
            break;
        case "4": // 4
            camera = cameras[3];
            break;
        case "5": // 5
            camera = cameras[4];
            break;
        case "7": // 7
            materials.forEach(value => {value.wireframe = !value.wireframe});
            break;
        case "q": // q
            rotateFeet = 1;
            break;
        case "a": // a
            rotateFeet = -1;
            break;
        case "w": // w
            rotateWaist = 1;
            break;
        case "s": // s
            rotateWaist = -1;
            break;
        case "e": //e
            moveArms = 1;
            break;
        case "d": // d
            moveArms = -1;
            break;
        case "r": // r
            rotateHead = 1;
            break;
        case "f": // f
            rotateHead = -1;
            break;
    }
    if (["q", "a", "w", "s", "e", "d", "r", "f", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        
        if (pressedKeys["q"] && pressedKeys["a"]) {
            rotateFeet = 0;
        }
        if (pressedKeys["w"] && pressedKeys["s"]) {
            rotateWaist = 0;
        }
        if (pressedKeys["e"] && pressedKeys["d"]) {
            moveArms = 0;
        }
        if (pressedKeys["r"] && pressedKeys["f"]) {
            rotateHead = 0;
        }
        if (pressedKeys["ArrowUp"] && pressedKeys["ArrowDown"]) {
            trailerMove.y = 0;
        }
        if (pressedKeys["ArrowLeft"] && pressedKeys["ArrowRight"]) {
            trailerMove.x = 0;
        }
    }
}
///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    pressedKeys[e.key] = false;
    switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
            trailerMove.y = 0;
            break;
        case "ArrowLeft":
        case "ArrowRight":
            trailerMove.x = 0;
            break;
        case "q":
        case "a":
            if (pressedKeys["q"] && !pressedKeys["a"]) {
                rotateFeet = 1;
            } else if (!pressedKeys["q"] && pressedKeys["a"]) {
                rotateFeet = -1;
            } else {
                rotateFeet = 0;
            }
            break;
        case "w":
        case "s":
            if (pressedKeys["w"] && !pressedKeys["s"]) {
                rotateWaist = 1;
            } else if (!pressedKeys["w"] && pressedKeys["s"]) {
                rotateWaist = -1;
            } else {
                rotateWaist = 0;
            }
            break;
        case "e":
        case "d":
            if (pressedKeys["e"] && !pressedKeys["d"]) {
                moveArms = 1;
            } else if (!pressedKeys["e"] && pressedKeys["d"]) {
                moveArms = -1;
            } else {
                moveArms = 0;
            }
            break;
        case "r":
        case "f":
            if (pressedKeys["r"] && !pressedKeys["f"]) {
                rotateHead = 1;
            } else if (!pressedKeys["r"] && pressedKeys["f"]) {
                rotateHead = -1;
            } else {
                rotateHead = 0;
            }
            break;
    }
}

init();
animate();