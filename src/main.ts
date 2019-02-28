import {vec3, vec4, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import {readTextFile} from './globals';
import Mesh from './geometry/Mesh';
import LSystem from './lsystem/LSystem';

// Note: auto-indent is CMD+K, CMD+F

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  axiom: "F",
  iterations: 1,
  rotation_angle: Math.PI / 6.0,
};

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;

let obj0: string = readTextFile('../objs/dodecahedron.obj'); // TODO: create an obj file
let mesh: Mesh;


let branchT: mat4[] = [];
let leafT: mat4[] = [];
let lSystem: LSystem = new LSystem(controls.axiom, controls.iterations, 
                                   controls.rotation_angle, branchT, leafT);
lSystem.expandGrammar(); // This should print out the expanded grammar
lSystem.draw(); // This updates branchT and leafT

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  mesh = new Mesh(obj0, vec3.fromValues(0.0, 0.0, 0.0));
  mesh.create();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU

  let offsetsArray = [];
  let colorsArray = [];
  let n: number = 100.0;
  let transform1Array = [];
  let transform2Array = [];
  let transform3Array = [];
  let transform4Array = [];

  // We will no longer need offsets (handled in the transformation array)
  for (let i = 0; i < branchT.length; i++) {
    let T = branchT[i];
    console.log("T[i]" + T);

    // Dummy - todo, get rid of offsets
    offsetsArray.push(0);
    offsetsArray.push(0);
    offsetsArray.push(0);

    // Column 1
    transform1Array.push(T[0]);
    transform1Array.push(T[1]);
    transform1Array.push(T[2]);
    transform1Array.push(T[3]);

    // Column 2
    transform2Array.push(T[4]);
    transform2Array.push(T[5]);
    transform2Array.push(T[6]);
    transform2Array.push(T[7]);

    // Column 3
    transform3Array.push(T[8]);
    transform3Array.push(T[9]);
    transform3Array.push(T[10]);
    transform3Array.push(T[11]);

    // Column 4
    transform4Array.push(T[12]);
    transform4Array.push(T[13]);
    transform4Array.push(T[14]);
    transform4Array.push(T[15]);

    // Color (red for now)
    colorsArray.push(1.0);
    colorsArray.push(0.0);
    colorsArray.push(0.0);
    colorsArray.push(1.0);

  }

  // for(let i = 0; i < n; i++) {
  //   for(let j = 0; j < n; j++) {
  //     offsetsArray.push(i);
  //     offsetsArray.push(j);
  //     offsetsArray.push(0);

  //     transform1Array.push(0.5);
  //     transform1Array.push(0.0);
  //     transform1Array.push(0.0);
  //     transform1Array.push(0.0);

  //     transform2Array.push(0.0);
  //     transform2Array.push(1.0);
  //     transform2Array.push(0.0);
  //     transform2Array.push(0.0);

  //     transform3Array.push(0.0);
  //     transform3Array.push(0.0);
  //     transform3Array.push(1.0);
  //     transform3Array.push(0.0);

  //     transform4Array.push(0.0);
  //     transform4Array.push(0.0);
  //     transform4Array.push(0.0);
  //     transform4Array.push(1.0);

  //     colorsArray.push(i / n);
  //     colorsArray.push(j / n);
  //     colorsArray.push(1.0);
  //     colorsArray.push(1.0); // Alpha channel
  //   }
  // }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  let transform1: Float32Array = new Float32Array(transform1Array);
  let transform2: Float32Array = new Float32Array(transform2Array);
  let transform3: Float32Array = new Float32Array(transform3Array);
  let transform4: Float32Array = new Float32Array(transform4Array);

  // square.setInstanceVBOs(offsets, colors, transform1, transform2, 
  //                        transform3, transform4);
  // square.setNumInstances(branchT.length);

  mesh.setInstanceVBOs(offsets, colors, transform1, transform2, transform3, transform4);
  mesh.setNumInstances(branchT.length);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  // Camera is looking at the origin
  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      mesh,
    ]);
    // renderer.render(camera, flat, [mesh]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
