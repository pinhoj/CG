import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let moon = new THREE.Object3D();
let moonlight;
let house = new THREE.Object3D();
let tree = new THREE.Object3D();
let pixelHeightMap;
let ovni;
let cameras = [], camera, scene, renderer;
var clock = new THREE.Clock();
var pressedKeys = {};
let skyDome;
let terrainMesh;

//materials
let materials = new Map();
let materialsLambert = new Map();
let materialsPhong = new Map();
let materialsToon = new Map();
let materialsBasic = new Map();

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#7F7F7F');
    scene.add(new THREE.AxesHelper(10));
    createGround();
    createSky();
    createLights();
    createMoon(120,250,-120);
    //createHouse(0,0,0);
    // createTrees();
    
}

function createGround() {
    const loader = new THREE.TextureLoader();
    loader.load('alentejoHeightmap.png', function (heightmap) {
        heightmap.minFilter = THREE.LinearFilter;
        heightmap.magFilter = THREE.LinearFilter;
        const groundMaterial = new THREE.MeshStandardMaterial({ displacementMap: heightmap, displacementScale: 100});
        
        const terrainGeometry = new THREE.PlaneGeometry(1024, 1024, 16, 16);
        terrainGeometry.rotateX(-Math.PI/2);
        terrainMesh = new THREE.Mesh(terrainGeometry, groundMaterial);
        updateGround();
        terrainMesh.position.set(0,0,0);
        scene.add(terrainMesh);
        createImage();
    });
}

function createImage() {
    fetch('displacement_map.json')
        .then(response => response.json())
        .then(data => {
            pixelHeightMap = data;
            console.log(pixelHeightMap);

            // POSICIONA A CASA SOBRE O TERRENO
            const casaX = 600;
            const casaZ = 400;
            const idx = casaZ * 1024 + casaX;
            const altura = pixelHeightMap[idx] * 100 / 255;
            createHouse(casaX - 512, altura, casaZ - 512);

            requestAnimationFrame(() => {
                createTrees();
            });
        })  
}

function updateGround() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;

    const ctx = canvas.getContext('2d');

    // Fill background green
    ctx.fillStyle = '#22BB22'; // forest green
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some random colored circles ("flowers")
    for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() + 2;

    // Random bright color
    ctx.fillStyle = flowerColor();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 64, 64 );

    terrainMesh.material.map = texture;
}


function flowerColor(){
  const colorRGBs = [
    'rgb(255, 255, 255)',  // white
    'rgb(255, 255, 0)',    // yellow
    'rgb(208, 140, 208)',  // lilac
    'rgb(61, 204, 251)'   // light blue
  ];

  const randomIndex = Math.floor(Math.random() * colorRGBs.length);
  return colorRGBs[randomIndex];
}

function createSky() {
    
    const skydomeMaterial = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
    });
    const skydomeGeometry = new THREE.SphereGeometry(300, 64, 64);
    
    // 7. Create the skydome mesh and add to scene
    skyDome = new THREE.Mesh(skydomeGeometry, skydomeMaterial);
    updateSky();
    scene.add(skyDome);
}

function updateSky() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // 2. Create vertical gradient from violet (top) to dark blue (bottom)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#390569');     // dark violet (sky)
    gradient.addColorStop(1, '#000022');     // Dark blue (space)
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 3. Draw random white dots (stars)
    const starCount = 500;
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * .1 + 0.1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
    }
    
    // 4. Create Three.js texture from canvas
    const skydomeTexture = new THREE.CanvasTexture(canvas);
    skydomeTexture.wrapS = THREE.RepeatWrapping;
    skydomeTexture.wrapT = THREE.RepeatWrapping;
    skydomeTexture.repeat.set( 4, 2 );
        
    // 6. Create a material with the texture, render inside faces
    const skydomeMaterial = new THREE.MeshBasicMaterial({
      map: skydomeTexture,
      side: THREE.BackSide,
    });
    skyDome.material = skydomeMaterial;
}


function createLights() {
    const light = new THREE.DirectionalLight(0xffffff, 0.1);
    light.position.set(25, 80, 25);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 1));
}
//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera(){
    const fov = 45; // degrees
    const aspect = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);

    // Calculate distance so plane height fits exactly in camera view
    const vFOV = THREE.MathUtils.degToRad(fov);
    const distance = 50 / Math.tan(vFOV / 2);

    // Position camera above center of plane, looking down
    camera.position.set(-35, distance , 340);
    camera.lookAt(50, 80, -50);


}
////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createMaterials() {
    materials.set("moon", new THREE.MeshLambertMaterial({ color: 0xfcba03, wireframe: false, emissive: 0xfcba03}));
    materials.set("ovni", new THREE.MeshLambertMaterial({ color: 0x707070, wireframe: false, side: THREE.DoubleSide}));
    materials.set("cockpit", new THREE.MeshLambertMaterial({ color: 0x66ccff, wireframe: false, side: THREE.DoubleSide}));
    materials.set("beam", new THREE.MeshLambertMaterial({ color: 0xe8d6a2, wireframe: false, side: THREE.DoubleSide}));
    materials.set("ovni light", new THREE.MeshLambertMaterial({ color: 0x00ffe6, wireframe: false, side: THREE.DoubleSide}));
    materials.set("house body", new THREE.MeshLambertMaterial({  color: 0xff0000 }));
    materials.set("window", new THREE.MeshLambertMaterial({ color: 0x87ceeb, wireframe: false, side: THREE.FrontSide}));
    materials.set("roof", new THREE.MeshLambertMaterial({ color: 0xb22222, wireframe: false, side: THREE.FrontSide}));
    materials.set("tree trunk", new THREE.MeshLambertMaterial({ color: 0x8b4513, wireframe: false, side: THREE.DoubleSide}));
    materials.set("tree foliage", new THREE.MeshLambertMaterial({ color: 0x228b22, wireframe: false, side: THREE.DoubleSide}));

    createLambertMaterials();
    createPhongMaterials();
    createToonMaterials();
    createBasicMaterials();
}

function createLambertMaterials(){
    materialsLambert.set("moon", new THREE.MeshLambertMaterial({ color: 0xfcba03, wireframe: false, emissive: 0xfcba03}));
    materialsLambert.set("ovni", new THREE.MeshLambertMaterial({ color: 0x707070, wireframe: false, side: THREE.DoubleSide}));
    materialsLambert.set("cockpit", new THREE.MeshLambertMaterial({ color: 0x66ccff, wireframe: false, side: THREE.DoubleSide}));
    materialsLambert.set("beam", new THREE.MeshLambertMaterial({ color: 0xe8d6a2, wireframe: false, side: THREE.DoubleSide}));
    materialsLambert.set("ovni light", new THREE.MeshLambertMaterial({ color: 0x00ffe6, wireframe: false, side: THREE.DoubleSide}));
    materialsLambert.set("house body", new THREE.MeshLambertMaterial({ color: 0xf5f5dc, wireframe: false, side: THREE.FrontSide}));
    materialsLambert.set("window", new THREE.MeshLambertMaterial({ color: 0x87ceeb, wireframe: false, side: THREE.FrontSide}));
    materialsLambert.set("roof", new THREE.MeshLambertMaterial({ color: 0xb22222, wireframe: false, side: THREE.FrontSide}));
    materialsLambert.set("tree trunk", new THREE.MeshLambertMaterial({ color: 0x8b4513, wireframe: false, side: THREE.DoubleSide}));
    materialsLambert.set("tree foliage", new THREE.MeshLambertMaterial({ color: 0x228b22, wireframe: false, side: THREE.DoubleSide}));
}

function createToonMaterials(){
    materialsToon.set("moon", new THREE.MeshToonMaterial({ color: 0xfcba03, wireframe: false, emissive: 0xfcba03, emissiveIntensity: 1.2}));
    materialsToon.set("ovni", new THREE.MeshToonMaterial({ color: 0x707070, wireframe: false, side: THREE.DoubleSide}));
    materialsToon.set("cockpit", new THREE.MeshToonMaterial({ color: 0x66ccff, wireframe: false, side: THREE.DoubleSide}));
    materialsToon.set("beam", new THREE.MeshToonMaterial({ color: 0xe8d6a2, wireframe: false, side: THREE.DoubleSide}));
    materialsToon.set("ovni light", new THREE.MeshToonMaterial({ color: 0x00ffe6, wireframe: false, side: THREE.DoubleSide}));
    materialsToon.set("house body", new THREE.MeshToonMaterial({ color: 0xf5f5dc, wireframe: false, side: THREE.FrontSide}));
    materialsToon.set("window", new THREE.MeshToonMaterial({ color: 0x87ceeb, wireframe: false, side: THREE.FrontSide}));
    materialsToon.set("roof", new THREE.MeshToonMaterial({ color: 0xb22222, wireframe: false, side: THREE.FrontSide}));
    materialsToon.set("tree trunk", new THREE.MeshToonMaterial({ color: 0x8b4513, wireframe: false, side: THREE.DoubleSide}));
    materialsToon.set("tree foliage", new THREE.MeshToonMaterial({ color: 0x228b22, wireframe: false, side: THREE.DoubleSide}));
}

function createPhongMaterials(){
    materialsPhong.set("moon", new THREE.MeshPhongMaterial({ color: 0xfcba03, wireframe: false, emissive: 0xfcba03, specular: 0xede0c2, shininess: 100}));
    materialsPhong.set("ovni", new THREE.MeshPhongMaterial({ color: 0x707070, wireframe: false, side: THREE.DoubleSide}));
    materialsPhong.set("cockpit", new THREE.MeshPhongMaterial({ color: 0x66ccff, wireframe: false, side: THREE.DoubleSide}));
    materialsPhong.set("beam", new THREE.MeshPhongMaterial({ color: 0xe8d6a2, wireframe: false, side: THREE.DoubleSide}));
    materialsPhong.set("ovni light", new THREE.MeshPhongMaterial({ color: 0x00ffe6, wireframe: false, side: THREE.DoubleSide}));
    materialsPhong.set("house body", new THREE.MeshPhongMaterial({ color: 0xf5f5dc, wireframe: false, side: THREE.FrontSide}));
    materialsPhong.set("window", new THREE.MeshPhongMaterial({ color: 0x87ceeb, wireframe: false, side: THREE.FrontSide}));
    materialsPhong.set("roof", new THREE.MeshPhongMaterial({ color: 0xb22222, wireframe: false, side: THREE.FrontSide}));
    materialsPhong.set("tree trunk", new THREE.MeshPhongMaterial({ color: 0x8b4513, wireframe: false, side: THREE.DoubleSide}));
    materialsPhong.set("tree foliage", new THREE.MeshPhongMaterial({ color: 0x228b22, wireframe: false, side: THREE.DoubleSide}));

}

function createBasicMaterials(){
    materialsBasic.set("moon", new THREE.MeshBasicMaterial({ color: 0xfcba03, wireframe: false}));
    materialsBasic.set("ovni", new THREE.MeshBasicMaterial({ color: 0x707070, wireframe: false, side: THREE.DoubleSide})); 
    materialsBasic.set("cockpit", new THREE.MeshBasicMaterial({ color: 0x66ccff, wireframe: false, side: THREE.DoubleSide}));
    materialsBasic.set("beam", new THREE.MeshBasicMaterial({ color: 0xe8d6a2, wireframe: false, side: THREE.DoubleSide}));
    materialsBasic.set("ovni light", new THREE.MeshBasicMaterial({ color: 0x00ffe6, wireframe: false, side: THREE.DoubleSide}));
    materialsBasic.set("house body", new THREE.MeshBasicMaterial({ color: 0xf5f5dc, wireframe: false, side: THREE.FrontSide}));
    materialsBasic.set("window", new THREE.MeshBasicMaterial({ color: 0x87ceeb, wireframe: false, side: THREE.FrontSide}));
    materialsBasic.set("roof", new THREE.MeshBasicMaterial({ color: 0xb22222, wireframe: false, side: THREE.FrontSide}));
    materialsBasic.set("tree trunk", new THREE.MeshBasicMaterial({ color: 0x8b4513, wireframe: false, side: THREE.DoubleSide}));
    materialsBasic.set("tree foliage", new THREE.MeshBasicMaterial({ color: 0x228b22, wireframe: false, side: THREE.DoubleSide})); 
}

function updateMaterials(){

}

function createTrees() {
    console.log("creating trees");
    const gridSize = 16; // 10x10 grid = 100 trees
    const squareSize = 64;
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const baseX = col * squareSize;
            const baseZ = row * squareSize;
            
            // Random offset within the square
            const x = baseX + Math.floor(Math.random() * squareSize);
            const z = baseZ + Math.floor(Math.random() * squareSize);
            const height = 10 + Math.random() * 10;
            const pixelidx = z * 1024 + x;
            console.log(pixelidx);
            const y = pixelHeightMap[pixelidx]* 100 / 255 - height/2;
            console.log("tree", x - 512, y, z - 512, height);
            createTree(x - 512, y, z - 512, height);
        }
    }
    // createTree(-25,60,125, 10 + Math.random() * 10);

}

function createTree(x, y, z, trunkHeight = 12){
    const tree = new THREE.Group();

    // Tronco
    const trunkGeometry = new THREE.CylinderGeometry(1.2, 1.5, trunkHeight, 16);
    const trunk = new THREE.Mesh(trunkGeometry, materials.get("tree trunk"));
    trunk.position.y = trunkHeight / 2;
    
    // Ramos
    for (let i = 0; i < 2; i++) {
        const branchGeometry = new THREE.CylinderGeometry(1, 1, trunkHeight);
        const branch = new THREE.Mesh(branchGeometry, materials.get("tree trunk"));
        const branchHolder = new THREE.Object3D();

        // Posição de origem no topo do tronco
        branch.position.y = trunkHeight / 2;
        //copa
        const foliageGeometry = new THREE.SphereGeometry(3.5, 16, 16);
        const foliage = new THREE.Mesh(foliageGeometry, materials.get("tree foliage"));
        foliage.scale.set(1.4, 0.8 , 1.2);
        foliage.position.y = trunkHeight;
        branchHolder.add(foliage);
        branchHolder.add(branch);
        branchHolder.position.y = trunkHeight * (0.5 * Math.random()); 
        
        

        if (i == 1) { //create subbranch
            const subbranch = new THREE.Mesh(branchGeometry, materials.get("tree trunk"));
            subbranch.scale.set(0.5,0.5,0.5);
            const subbranchHolder = new THREE.Object3D();

            // Posição de origem no topo do tronco
            subbranch.position.y = trunkHeight / 4;
            //copa
            const subfoliageGeometry = new THREE.SphereGeometry(3.5, 16, 16);
            const subfoliage = new THREE.Mesh(subfoliageGeometry, materials.get("tree foliage"));
            subfoliage.scale.set(1, 0.6 , 0.8);
            subfoliage.position.y = trunkHeight/2   ;
            subbranchHolder.add(subfoliage);
            subbranchHolder.add(subbranch);
            subbranchHolder.position.y = trunkHeight * (0.5 * Math.random()); 
            
            const angleH = (Math.random()) * Math.PI * 2; // horizontal (em torno de y)
            const angleV = Math.random() * Math.PI / 4; // vertical (para cima)
            subbranchHolder.rotation.y = angleH;
            subbranchHolder.rotation.z = -angleV;


            branchHolder.add(subbranchHolder); 
        }
        const angleH = (Math.random()) * Math.PI; // horizontal (em torno de y)
        const angleV = Math.random() * Math.PI / 4; // vertical (para cima)
        branchHolder.rotation.y = angleH;
        branchHolder.rotation.z = -angleV;


        trunk.add(branchHolder);
    }
    tree.add(trunk);

    tree.position.set(x, y + trunkHeight / 2, z);
    scene.add(tree);

}

function createMoon(x, y ,z){

    const moonGeometry = new THREE.SphereGeometry(50, 32, 32);
    moon = new THREE.Mesh(moonGeometry, materials.get("moon"));
    moon.position.set(x, y, z);

    scene.add(moon);
}


function createWalls(house) {
    
    // Front Wall

    let wallFront = new THREE.Group();

    let vertices = new Float32Array([
        2,0,13,     7,0,13,     7,9,13,     2,9,13
    ]);

    let indices = new Uint32Array([0, 1, 2, 0, 2, 3]);

    let g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    g.setIndex(new THREE.BufferAttribute(indices, 1));
    g.computeVertexNormals();

    let seg1 = new THREE.Mesh(g, materials.get("house body"));
    wallFront.add(seg1);
    
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
    g.computeVertexNormals();
    
    let seg3 = new THREE.Mesh(g, materials.get("house body"));
    wallFront.add(seg3);

    wallFront.position.set(0, 0, 0);
    house.add(wallFront);

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
    house.add(wallBack);

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
    house.add(wallLeft);

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
    house.add(wallRight);
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

    let door = new THREE.Mesh(geometry, materials.get("window"));
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
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices,  3));
    geometry.setIndex(new THREE.BufferAttribute(indices,  1));
    geometry.computeVertexNormals();
    let roof = new THREE.Mesh(geometry, materials.get("roof"));
    house.add(roof);
}

function createHouse(x, y, z){

    house = new THREE.Object3D();

    createWalls(house);
    createDoorsAndWindows(house);
    createRoof(house);

    house.add(new THREE.AxesHelper(20));
    house.position.set(x - 11, y, z - 7.5);
    house.scale.set(3, 3, 3);

    scene.add(house);
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
    let spotLight = new THREE.SpotLight(materials.get("spotlight"), 0.7, 30, Math.PI/7, 0.3);
    spotLight.position.set(0, -0.55, 0);
    spotLight.target.position.set(0, -10, 0);
    mesh.add(spotLight);
    mesh.add(spotLight.target);
    ovni.spolight = spotLight;

    // Luzes do ovni
    createOVNILights();

    ovni.position.set(x, y, z);
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
    // delta = clock.getDelta();

    
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
    createCamera();
    createScene();

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
            camera.position.z -= 5;
            break;
        case "ArrowDown":
            camera.position.z += 5;
            break;
        case "ArrowLeft":
            camera.position.x -= 5;
            break;
        case "ArrowRight":
            camera.position.x += 5;
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
    console.log(camera.position);
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