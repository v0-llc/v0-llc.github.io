/** Variables **/

var tx = 0,
    ty = 0,
    tz = 0;

var canvasSizeX = window.innerWidth;
var canvasSizeY = window.innerHeight;

var simplexX, simplexY, simplexZ;
var scene, camera, renderer, renderScene;
var geometry, material, mesh;

var vertArray = [], colors = [];
var vertices;

/** Settings **/

var dim = 69; // Make divisible by three
var matrixX = dim,
    matrixY = dim;

var noiseDensity = 0.015;

// Bloom

var params = {
    exposure: 1,
    bloomStrength: 1.6,
    bloomThreshold: 0,
    bloomRadius: 0.3
};

var afterImageDamping = 0.8; // Higher means more afterimage effect

/** Subroutines **/

function _initScene(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvasSizeX / canvasSizeY, 0.1, 1000);
    
    camera.position.z = 1.2;
    camera.position.x = 0;
    
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        autoClear: false,
    });

    renderer.setSize(canvasSizeX, canvasSizeY);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    renderScene = new THREE.RenderPass(scene, camera);
}

function _initNoise() {
    // Seed the simplex noise generators
    simplexX = new SimplexNoise();
    simplexY = new SimplexNoise();
    simplexZ = new SimplexNoise();
}

function _initVertices() {
    for (var x = 0; x < matrixX; x++) {
        for (var y = 0; y < matrixY; y++) {
            for (var z = 0; z < 3; z++) {
                vertArray.push(0);
                colors.push(1, 1, 1);
            }
        }
    }
    
    vertices = new Float32Array(vertArray);
}

function _initMesh(){
    geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.dynamic = true;

    material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        vertexColors: THREE.VertexColors,
    });
    
    mesh = new THREE.Line(geometry, material);
    scene.add(mesh);
}

function _postProcessSetup(){
    composer = new THREE.EffectComposer(renderer);
    composer.setSize(canvasSizeX, canvasSizeY);
    
    var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(canvasSizeX, canvasSizeY), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;
    
    fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);

    var pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (canvasSizeX * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (canvasSizeY * pixelRatio);

    composer.addPass(renderScene);
    afterimagePass = new THREE.AfterimagePass();
    afterimagePass.uniforms["damp"].value = afterImageDamping;
    
    composer.addPass(afterimagePass);
    composer.addPass(bloomPass);  
    composer.addPass(fxaaPass);      
}

function onWindowResize(){
    canvasSizeX = window.innerWidth;
    canvasSizeY = window.innerHeight;
    
    camera.aspect = canvasSizeX / canvasSizeY;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasSizeX, canvasSizeY);
    composer.setSize(canvasSizeX, canvasSizeY);
}

function initialize() {
    _initScene();
    _initNoise();    
    _initVertices();
    _initMesh();
    _postProcessSetup();
    
    window.addEventListener( 'resize', onWindowResize, false );
}

function updateVerts() {
    var positions = mesh.geometry.attributes.position.array;
    var colors = mesh.geometry.attributes.color;

    for (var x = 0; x < matrixX; x++) {
        for (var y = 0; y < matrixY; y++) {
            var posX = simplexX.noise2D(x * noiseDensity + tx, y * noiseDensity + tx);
            var posY = simplexY.noise2D(x * noiseDensity + ty, y * noiseDensity + ty);
            var posZ = simplexZ.noise2D(x * noiseDensity + tz, y * noiseDensity + tz);

            positions[(x + y * matrixX) * 3 + 0] = posX;
            positions[(x + y * matrixX) * 3 + 1] = posY;
            positions[(x + y * matrixX) * 3 + 2] = posZ;

            colors.setXYZ(
                x + y * matrixX,
                simplexX.noise3D(x * noiseDensity, y * noiseDensity, tx) * 0.6 + 0.1,
                simplexY.noise3D(x * noiseDensity, y * noiseDensity, ty) * 0.3,
                simplexZ.noise3D(x * noiseDensity, y * noiseDensity, tz) * 0.6 + 0.1
            );
        }
    }
    tx += 0.0003;
    ty -= 0.0004;
    tz += 0.0005;

    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.attributes.color.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);
    updateVerts();
    composer.render(scene, camera);
}

initialize();
animate();