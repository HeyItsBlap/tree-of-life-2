import "./main.css";
import {
  Clock,
  Scene,
  LoadingManager,
  WebGLRenderer,
  sRGBEncoding,
  Group,
  PerspectiveCamera,
  DirectionalLight,
  PointLight,
  MeshPhongMaterial,
} from "three";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Vector3 } from "three";

let subnodesData = {};
document.addEventListener("DOMContentLoaded", () => {
  subnodesData = fetchSubnodes();
  const currentTrees = [];

  //const currentTrees = extractSubnodes(subnodesData);
  
  var children = [];
  subnodesData.then((data) => {
    setBranches(data, children, currentTrees);
  });
});

function setBranches(data, children, currentTrees) {
  let name = data.arguson.taxon.name;
  let id = data.arguson.node_id;
  children = data.arguson.children;

  currentTrees.push({ name, id });
  children.forEach((element) => {
    console.log(element)
    let name = element.taxon.name;
    let id = element.node_id;
    currentTrees.push({ name, id });
  });
  const branchButtonPositions = calculateBranchPositions(currentTrees);

  loadSubnodeButtons(currentTrees, branchButtonPositions);
}

// Calculate the branch positions
function calculateBranchPositions(children) {
  // Always return early if there's nothing in the array
  if (!children || children.length === 0) return [];

  // 1) Root label (first item) at the bottom/center
  const rootPos = { x: 0, y: 1.8, z: 1.0 };
  const positions = [rootPos];

  // 2) Determine how many branch labels we have
  const branchCount = children.length - 1; // excluding the root
  if (branchCount <= 0) {
    // Only one item in the array, so just return the root position
    return positions;
  }

  // 3) Arc configuration
  //    - The labels will be distributed from startAngle to endAngle,
  //      forming a partial arc above the root.
  const startAngle = -Math.PI;
  const endAngle = Math.PI / 2;
  const radius = 2.0; // how far out horizontally from the root
  const baseHeight = rootPos.y + 0.8; // baseline for branch labels (slightly above the root)
  const verticalStep = 0.2; // how much each label moves upward from the previous

  // 4) Loop through each branch label
  for (let i = 0; i < branchCount; i++) {
    // t is a normalized value in [0..1] used to interpolate between angles
    const t = branchCount > 1 ? i / (branchCount - 1) : 0.5;
    const angle = startAngle + (endAngle - startAngle) * t;

    // 5) Convert polar coordinates to 3D (x, z) around the root
    //    so they fan out horizontally
    const x = rootPos.x + Math.cos(angle) * radius;
    const z = rootPos.z + Math.sin(angle) * radius;

    // 6) Increase the y position slightly for each label so they stack upward
    const y = baseHeight + i * verticalStep;

    positions.push({ x, y, z });
  }

  return positions;
}

const fetchSubnodes = async (nodeId = "ott93302") => {
  return await fetch("https://api.opentreeoflife.org/v3/tree_of_life/subtree", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      node_id: nodeId,
      format: "arguson",
      height_limit: 1,
    }),
  }).then((response) => response.json());
};

const ftsLoader = document.querySelector(".loader-roll");
const looadingCover = document.getElementById("loading-text-intro");
const loadingManager = new LoadingManager();

//buttons

// const branchButtonPositions = [
//   { x: 0, y: 1.8, z: 1.0 },
//   { x: -1, y: 3.0, z: -0.7 },
//   { x: 1, y: 3.0, z: -0.7 },
//   { x: 2, y: 2.5, z: -1 },

//   // Add more as needed
// ];

const branchButtons = [];

loadingManager.onLoad = function () {
  document.querySelector(".main-container").style.visibility = "visible";
  document.querySelector("body").style.overflow = "auto";

  const yPosition = { y: 0 };

  new TWEEN.Tween(yPosition)
    .to({ y: 100 }, 900)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()
    .onUpdate(function () {
      looadingCover.style.setProperty(
        "transform",
        `translate( 0, ${yPosition.y}%)`
      );
    })
    .onComplete(function () {
      looadingCover.parentNode.removeChild(
        document.getElementById("loading-text-intro")
      );
      TWEEN.remove(this);
    });

  introAnimation();
  ftsLoader.parentNode.removeChild(ftsLoader);

  window.scroll(0, 0);
};

// draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
dracoLoader.setDecoderConfig({ type: "js" });
const loader = new GLTFLoader(loadingManager);
loader.setDRACOLoader(dracoLoader);

const container = document.getElementById("canvas-container-hero");
const containerDetails = document.getElementById("canvas-container-goddesses");
const containerFooter = document.getElementById("canvas-container-euphre");

let oldMaterial;
let secondContainer = false;
let width = container.clientWidth;
let height = container.clientHeight;

// scene
const scene = new Scene();

// renderer
const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.autoClear = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
renderer.setSize(width, height);
renderer.outputEncoding = sRGBEncoding;
container.appendChild(renderer.domElement);

const renderer2 = new WebGLRenderer({ antialias: false });
renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1));
renderer2.setSize(width, height);
renderer2.outputEncoding = sRGBEncoding;
containerDetails.appendChild(renderer2.domElement);

const renderer3 = new WebGLRenderer({ antialias: false });
renderer3.setPixelRatio(Math.min(window.devicePixelRatio, 1));
renderer3.setSize(width, height);
renderer3.outputEncoding = sRGBEncoding;
containerFooter.appendChild(renderer3.domElement);

// camera config
const cameraGroup = new Group();
scene.add(cameraGroup);

const camera = new PerspectiveCamera(35, width / height, 1, 100);
camera.position.set(19, 1.54, -0.1);
cameraGroup.add(camera);

const camera2 = new PerspectiveCamera(
  35,
  containerDetails.clientWidth / containerDetails.clientHeight,
  1,
  100
);
camera2.position.set(1.9, 2.7, 2.7);
camera2.rotation.set(0, 1.1, 0);
scene.add(camera2);

const camera3 = new PerspectiveCamera(
  35,
  containerFooter.clientWidth / containerFooter.clientHeight,
  1,
  100
);
camera3.position.set(-2.2, 2.7, 1.9);
camera3.rotation.set(0, -0.8, 0);
scene.add(camera3);

// resize event listener
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  camera2.aspect = containerDetails.clientWidth / containerDetails.clientHeight;
  camera2.updateProjectionMatrix();

  camera3.aspect = containerFooter.clientWidth / containerFooter.clientHeight;
  camera3.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer2.setSize(
    containerDetails.clientWidth,
    containerDetails.clientHeight
  );
  renderer3.setSize(containerFooter.clientWidth, containerFooter.clientHeight);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
  renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1));
  renderer3.setPixelRatio(Math.min(window.devicePixelRatio, 1));
});

// lights
const sunLight = new DirectionalLight(0xabadaf, 0.05);
sunLight.position.set(-100, 0, -100);
scene.add(sunLight);

const fillLight = new PointLight(0xc3c3c3, 2, 3.2, 3);
fillLight.position.set(30, 3, 1.8);
scene.add(fillLight);

// load model
loader.load("models/gltf/treeSecond.glb", function (gltf) {
  gltf.scene.traverse((obj) => {
    if (obj.isMesh) {
      oldMaterial = obj.material;
      obj.material = new MeshPhongMaterial({
        color: 0x0a290a, // Dark green
        specular: 0x008080, // Teal highlight
        shininess: 60, // Controlled shininess
      });
    }
  });
  scene.add(gltf.scene);
  clearScene();
});

function clearScene() {
  oldMaterial.dispose();
  renderer.renderLists.dispose();
}

// intro animation
function introAnimation() {
  new TWEEN.Tween(camera.position.set(0, 4, 2.7))
    .to({ x: 0, y: 2.4, z: 8.8 }, 3500)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()
    .onComplete(function () {
      TWEEN.remove(this);
      document.querySelector(".header").classList.add("ended");
      document.querySelector(".hero>p").classList.add("ended");
    });
}

//get AI text element
const content = document.getElementById("content");
const currentClick = document.getElementById("aglaea");

//load buttons on load
const loadSubnodeButtons = (currentTrees, branchButtonPositions) => {
  console.log(currentTrees);
  branchButtonPositions.forEach((pos, index) => {
    const btn = document.createElement("button");
    btn.className = "branch-button";
    btn.innerText = currentTrees[index].name;
    btn.style.position = "absolute";
    btn.style.pointerEvents = "auto";
    document.body.appendChild(btn);

    // Initial position calculation
    const vector = new Vector3(pos.x, pos.y, pos.z).clone();
    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    btn.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    btn.setAttribute("tree-id", currentTrees[index].id)
    //click behavior
    btn.addEventListener("click", async (e) => {
          //click behavior
      //change currentClick
      currentClick.innerText = btn.innerText
      //clear current paragraph
      content.innerText = 'Loading...';
      const response = await fetch (`http://localhost:3000/${btn.innerText}`)
      const data = await response.json()
      console.log(data)
      content.innerText = data;


      // Add taxonomy logic here
      console.log(e.target)
      console.log(currentTrees[index]);
      let id = e.target.getAttribute('tree-id');
      subnodesData = fetchSubnodes(id);
      currentTrees = [];
      var children = [];
      subnodesData.then((data) => {
        setBranches(data, children, currentTrees);
      });
    });

    // Store for updates
    branchButtons.push({
      position: new Vector3(pos.x, pos.y, pos.z),
      element: btn,
    });
  });
};

// click event listeners
document.getElementById("aglaea").addEventListener("click", () => {
  document.getElementById("aglaea").classList.add("active");
  document.getElementById("euphre").classList.remove("active");
  document.getElementById("thalia").classList.remove("active");
  document.getElementById("content").innerHTML =
    "She was venerated as the goddess of beauty, splendor, glory, magnificence, and adornment. She is the youngest of the Charites according to Hesiod. Aglaea is one of three daughters of Zeus and either the Oceanid Eurynome, or of Eunomia, the goddess of good order and lawful conduct.";
  animateCamera({ x: 1.9, y: 2.7, z: 2.7 }, { y: 1.1 });
});

document.getElementById("thalia").addEventListener("click", () => {
  document.getElementById("thalia").classList.add("active");
  document.getElementById("aglaea").classList.remove("active");
  document.getElementById("euphre").classList.remove("active");
  document.getElementById("content").innerHTML =
    "Thalia, in Greek religion, one of the nine Muses, patron of comedy; also, according to the Greek poet Hesiod, a Grace (one of a group of goddesses of fertility). She is the mother of the Corybantes, celebrants of the Great Mother of the Gods, Cybele, the father being Apollo, a god related to music and dance. In her hands she carried the comic mask and the shepherd’s staff.";
  animateCamera({ x: -0.9, y: 3.1, z: 2.6 }, { y: -0.1 });
});

document.getElementById("euphre").addEventListener("click", () => {
  document.getElementById("euphre").classList.add("active");
  document.getElementById("aglaea").classList.remove("active");
  document.getElementById("thalia").classList.remove("active");
  document.getElementById("content").innerHTML =
    'Euphrosyne is a Goddess of Good Cheer, Joy and Mirth. Her name is the female version of a Greek word euphrosynos, which means "merriment". The Greek poet Pindar states that these goddesses were created to fill the world with pleasant moments and good will. Usually the Charites attended the goddess of beauty Aphrodite.';
  animateCamera({ x: -0.4, y: 2.7, z: 1.9 }, { y: -0.6 });
});

// camera animation function
function animateCamera(position, rotation) {
  new TWEEN.Tween(camera2.position)
    .to(position, 1800)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()
    .onComplete(function () {
      TWEEN.remove(this);
    });
  new TWEEN.Tween(camera2.rotation)
    .to(rotation, 1800)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start()
    .onComplete(function () {
      TWEEN.remove(this);
    });
}

// parallax config
const cursor = { x: 0, y: 0 };
const clock = new Clock();
let previousTime = 0;

// render loop function
function renderLoop() {
  TWEEN.update();

  //buttons
  branchButtons.forEach(({ position, element }) => {
    const pos = position.clone();
    pos.project(camera); // project 3D to 2D

    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;

    element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
  });

  if (secondContainer) {
    renderer2.render(scene, camera2);
  } else {
    renderer.render(scene, camera);
  }
  renderer3.render(scene, camera3);

  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  const parallaxY = cursor.y;
  fillLight.position.y -=
    (parallaxY * 9 + fillLight.position.y - 2) * deltaTime;

  const parallaxX = cursor.x;
  fillLight.position.x +=
    (parallaxX * 8 - fillLight.position.x) * 2 * deltaTime;

  cameraGroup.position.z -=
    (parallaxY / 3 + cameraGroup.position.z) * 2 * deltaTime;
  cameraGroup.position.x +=
    (parallaxX / 3 - cameraGroup.position.x) * 2 * deltaTime;

  requestAnimationFrame(renderLoop);
}

renderLoop();

// mouse move event listener
document.addEventListener(
  "mousemove",
  (event) => {
    event.preventDefault();

    cursor.x = event.clientX / window.innerWidth - 0.5;
    cursor.y = event.clientY / window.innerHeight - 0.5;

    handleCursor(event);
  },
  false
);

// intersection observer
const watchedSection = document.querySelector(".goddesses");

function obCallback(payload) {
  if (payload[0].intersectionRatio > 0.05) {
    secondContainer = true;
  } else {
    secondContainer = false;
  }
}

const ob = new IntersectionObserver(obCallback, {
  threshold: 0.05,
});

ob.observe(watchedSection);

// magnet effect
const btn = document.querySelectorAll("nav > .a");
const customCursor = document.querySelector(".cursor");

function update(e) {
  const span = this.querySelector("span");

  if (e.type === "mouseleave") {
    span.style.cssText = "";
  } else {
    const { offsetX: x, offsetY: y } = e,
      { offsetWidth: width, offsetHeight: height } = this,
      walk = 20,
      xWalk = (x / width) * (walk * 2) - walk,
      yWalk = (y / height) * (walk * 2) - walk;
    span.style.cssText = `transform: translate(${xWalk}px, ${yWalk}px);`;
  }
}

const handleCursor = (e) => {
  const x = e.clientX;
  const y = e.clientY;
  customCursor.style.cssText = `left: ${x}px; top: ${y}px;`;
};

btn.forEach((b) => b.addEventListener("mousemove", update));
btn.forEach((b) => b.addEventListener("mouseleave", update));
