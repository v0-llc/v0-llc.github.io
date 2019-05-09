var dim = 90; // Make divisible by three?
var matrixX = dim,
    matrixY = dim;

var noiseDensity = 0.012;

var t = 0;
var tx = 0,
    ty = 0,
    tz = 0;

var simplexX, simplexY, simplexZ;
var scene, camera, renderer;

var params = {
    exposure: 1.5,
    bloomStrength: 1.8,
    bloomThreshold: 0,
    bloomRadius: 0.5
};

var canvasSizeX = window.innerHeight * 3;
var canvasSizeY = window.innerHeight * 3;

function initNoise() {
    // Seed the simplex noise generators
    simplexX = new SimplexNoise();
    simplexY = new SimplexNoise();
    simplexZ = new SimplexNoise();
}

function initialize() {
    initNoise();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvasSizeX / canvasSizeY, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        autoClear: false,
    });

    renderer.setSize(canvasSizeX, canvasSizeY);
    document.getElementById('circle-nav').appendChild(renderer.domElement);
}

function initVertices() {
    for (var x = 0; x < matrixX; x++) {
        for (var y = 0; y < matrixY; y++) {
            for (var z = 0; z < 3; z++) {
                vertArray.push(0);
                colors.push(1, 1, 1);
            }
        }
    }
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
                simplexX.noise3D(x * noiseDensity, y * noiseDensity, t) * 1,
                simplexY.noise3D(x * noiseDensity, y * noiseDensity, t) * 0.13,
                simplexZ.noise3D(x * noiseDensity, y * noiseDensity, t) * 1
            );
        }
    }
    t += 0.002;
    tx += 0.0004;
    ty -= 0.0005;
    tz += 0.0006;

    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.attributes.color.needsUpdate = true;
}

var vertArray = [];
var colors = [];

initialize();

initVertices();

var vertices = new Float32Array(vertArray);

var geometry = new THREE.BufferGeometry();
geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
geometry.dynamic = true;

var material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.VertexColors,
    linewidth: 5,

    wireframe: true
});

var mesh = new THREE.Line(geometry, material);
scene.add(mesh);

camera.position.z = 3;
camera.position.x = 1.5;

var renderScene = new THREE.RenderPass(scene, camera);

var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(canvasSizeX, canvasSizeY), 1.5, 0.4, 0.85);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

composer = new THREE.EffectComposer(renderer);

composer.setSize(canvasSizeX, canvasSizeY);


fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);

var pixelRatio = renderer.getPixelRatio();
fxaaPass.material.uniforms['resolution'].value.x = 1 / (canvasSizeX * pixelRatio);
fxaaPass.material.uniforms['resolution'].value.y = 1 / (canvasSizeY * pixelRatio);

composer.addPass(renderScene);
afterimagePass = new THREE.AfterimagePass();
afterimagePass.uniforms["damp"].value = 0.75;
composer.addPass(afterimagePass);
composer.addPass(bloomPass);
composer.addPass(fxaaPass); // Not much of a difference?


function animate() {
    requestAnimationFrame(animate);

    updateVerts();



    composer.render(scene, camera);
}

animate();