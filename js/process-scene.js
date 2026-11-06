import * as THREE from "three";

const section = document.querySelector(".process-section");
const canvas = section?.querySelector(".process-canvas");
const steps = [...(section?.querySelectorAll(".process-step") || [])];

if (section && canvas && steps.length) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    renderer = null;
  }

  if (renderer) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
    camera.position.set(0, 0, 8.5);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x000000, 0);

    const world = new THREE.Group();
    scene.add(world);
    scene.add(new THREE.HemisphereLight(0xc8e6ff, 0x14151d, 1.35));

    const keyLight = new THREE.DirectionalLight(0xd5e9ff, 2.2);
    keyLight.position.set(-4, 5, 6);
    scene.add(keyLight);

    const warmLight = new THREE.PointLight(0xe4c98f, 15, 8);
    warmLight.position.set(1, 1, 3);
    scene.add(warmLight);

    const trackMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x568ca6,
      emissive: 0x153849,
      emissiveIntensity: 0.7,
      metalness: 0.56,
      roughness: 0.3,
      transparent: true,
      opacity: 0.76
    });
    const makeMaterial = (color, options = {}) => new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.36,
      roughness: 0.3,
      clearcoat: 0.7,
      ...options
    });
    const addMesh = (parent, geometry, material, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0]) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.rotation.set(...rotation);
      parent.add(mesh);
      return mesh;
    };
    const addTube = (parent, points, radius, material) => {
      const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
      return addMesh(parent, new THREE.TubeGeometry(curve, 32, radius, 8, false), material);
    };
    const buildArtifacts = [
      (group, color) => {
        const metal = makeMaterial(color, { metalness: 0.68, roughness: 0.22 });
        const lens = new THREE.Group();
        group.add(lens);
        addMesh(lens, new THREE.SphereGeometry(0.205, 32, 24), makeMaterial(0x91d9e8, { metalness: 0.12, roughness: 0.08, transparent: true, opacity: 0.58, clearcoat: 1 }), [0.04, 0.06, 0.035], [1, 1, 0.22]);
        addMesh(lens, new THREE.TorusGeometry(0.22, 0.035, 12, 48), metal, [0.04, 0.06, 0.05]);
        addTube(lens, [[-0.1, -0.1, 0], [-0.2, -0.22, 0], [-0.33, -0.36, 0]], 0.045, metal);
        addMesh(lens, new THREE.SphereGeometry(0.026, 12, 10), makeMaterial(0xf6e8bd, { emissive: 0xe9bd72, emissiveIntensity: 0.85 }), [0.13, 0.16, 0.09]);
        return { animate: (delta) => { if (!reducedMotion.matches) lens.rotation.z += delta * 0.16; } };
      },
      (group, color) => {
        const brass = makeMaterial(color, { metalness: 0.76, roughness: 0.2 });
        const face = makeMaterial(0x182533, { metalness: 0.52, roughness: 0.24 });
        addMesh(group, new THREE.CylinderGeometry(0.235, 0.235, 0.07, 48), brass, [0, 0, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
        addMesh(group, new THREE.CylinderGeometry(0.19, 0.19, 0.012, 48), face, [0, 0, 0.045], [1, 1, 1], [Math.PI / 2, 0, 0]);
        addMesh(group, new THREE.TorusGeometry(0.24, 0.022, 10, 48), brass, [0, 0, 0.05]);
        const needle = new THREE.Group();
        needle.position.z = 0.09;
        group.add(needle);
        addMesh(needle, new THREE.ConeGeometry(0.055, 0.29, 4), makeMaterial(0xf1d697, { emissive: 0x72531d, emissiveIntensity: 0.3 }), [0, 0.075, 0]);
        addMesh(needle, new THREE.ConeGeometry(0.045, 0.2, 4), makeMaterial(0x8eacc0, { metalness: 0.64 }), [0, -0.105, 0], [1, 1, 1], [0, 0, Math.PI]);
        addMesh(group, new THREE.SphereGeometry(0.045, 16, 12), brass, [0, 0, 0.105]);
        for (let tick = 0; tick < 8; tick++) {
          const angle = (tick / 8) * Math.PI * 2;
          addMesh(group, new THREE.BoxGeometry(0.012, 0.04, 0.012), brass, [Math.cos(angle) * 0.15, Math.sin(angle) * 0.15, 0.07], [1, 1, 1], [0, 0, angle]);
        }
        return { animate: (delta) => { if (!reducedMotion.matches) needle.rotation.z += delta * 0.34; } };
      },
      (group, color) => {
        const board = makeMaterial(0x22283a, { metalness: 0.42, roughness: 0.3 });
        const ink = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.45, roughness: 0.34 });
        addMesh(group, new THREE.BoxGeometry(0.48, 0.34, 0.055), board, [0, 0, 0]);
        addMesh(group, new THREE.BoxGeometry(0.42, 0.28, 0.012), makeMaterial(0x101722, { metalness: 0.2, roughness: 0.5 }), [0, 0, 0.034]);
        addMesh(group, new THREE.BoxGeometry(0.18, 0.018, 0.01), ink, [-0.08, 0.075, 0.046]);
        addMesh(group, new THREE.BoxGeometry(0.26, 0.012, 0.01), makeMaterial(0xc3ced8, { metalness: 0.1, roughness: 0.65 }), [0.03, 0.015, 0.046]);
        addMesh(group, new THREE.BoxGeometry(0.22, 0.012, 0.01), makeMaterial(0x86a2b3, { metalness: 0.12, roughness: 0.55 }), [-0.02, -0.04, 0.046]);
        const pen = new THREE.Group();
        pen.position.set(0.22, 0.07, 0.1);
        pen.rotation.z = -0.72;
        group.add(pen);
        addMesh(pen, new THREE.CylinderGeometry(0.025, 0.025, 0.34, 12), makeMaterial(0xe4c98f, { metalness: 0.78, roughness: 0.2 }));
        addMesh(pen, new THREE.ConeGeometry(0.025, 0.08, 12), ink, [0, -0.2, 0]);
        addTube(group, [[-0.18, -0.1, 0.06], [-0.1, -0.16, 0.06], [0, -0.12, 0.06], [0.1, -0.16, 0.06]], 0.008, ink);
        return { animate: (delta) => { if (!reducedMotion.matches) pen.rotation.z = -0.72 + Math.sin(performance.now() * 0.0007) * 0.045; } };
      },
      (group, color) => {
        const casing = makeMaterial(0x253142, { metalness: 0.58, roughness: 0.28 });
        const screen = makeMaterial(0x0d1521, { metalness: 0.2, roughness: 0.38 });
        const code = new THREE.Group();
        code.rotation.y = -0.08;
        group.add(code);
        addMesh(code, new THREE.BoxGeometry(0.5, 0.37, 0.06), casing);
        addMesh(code, new THREE.BoxGeometry(0.45, 0.31, 0.012), screen, [0, 0, 0.037]);
        [-0.17, -0.12, -0.07].forEach((x, index) => addMesh(code, new THREE.SphereGeometry(0.012, 10, 8), makeMaterial([0xeb8378, 0xe8c476, 0x83cea5][index]), [x, 0.13, 0.05]));
        const lineWidths = [0.2, 0.29, 0.16, 0.25, 0.12];
        lineWidths.forEach((width, index) => addMesh(code, new THREE.BoxGeometry(width, 0.012, 0.008), makeMaterial(index % 2 ? 0x8ba9bf : color, { emissive: color, emissiveIntensity: 0.12 }), [-0.1 + (index % 2) * 0.05, 0.065 - index * 0.052, 0.05]));
        const blocks = new THREE.Group();
        blocks.position.set(0.23, -0.2, -0.02);
        group.add(blocks);
        [[0, 0, 0], [0.08, 0.08, 0.035], [-0.07, 0.13, -0.03]].forEach((position, index) => {
          addMesh(blocks, new THREE.BoxGeometry(0.11, 0.11, 0.11), makeMaterial([color, 0x728da8, 0xc3a3d8][index], { metalness: 0.45, roughness: 0.26 }), position, [1, 1, 1], [0.18, 0.42, 0.12]);
        });
        return { animate: (delta) => { if (!reducedMotion.matches) code.rotation.y = -0.08 + Math.sin(performance.now() * 0.0006) * 0.035; } };
      },
      (group, color) => {
        const crystalMaterial = makeMaterial(color, { metalness: 0.36, roughness: 0.16, transparent: true, opacity: 0.88, emissive: color, emissiveIntensity: 0.28 });
        const crystal = addMesh(group, new THREE.DodecahedronGeometry(0.255, 1), crystalMaterial, [0, 0, 0], [0.85, 1, 0.72]);
        addMesh(group, new THREE.DodecahedronGeometry(0.265, 0), new THREE.MeshBasicMaterial({ color: 0xf2e5c4, wireframe: true, transparent: true, opacity: 0.46 }), [0, 0, 0], [0.85, 1, 0.72]);
        const orbit = addMesh(group, new THREE.TorusGeometry(0.34, 0.008, 8, 64), new THREE.MeshBasicMaterial({ color: 0x91d8b8, transparent: true, opacity: 0.75 }), [0, 0, 0], [1, 0.72, 1], [0.55, 0.2, 0.32]);
        const checkMaterial = new THREE.MeshStandardMaterial({ color: 0xa2e1b5, emissive: 0x326b46, emissiveIntensity: 0.7 });
        addTube(group, [[-0.1, -0.02, 0.23], [-0.025, -0.1, 0.24], [0.13, 0.1, 0.25]], 0.018, checkMaterial);
        return { animate: (delta) => { if (!reducedMotion.matches) { crystal.rotation.y += delta * 0.24; orbit.rotation.z += delta * 0.16; } } };
      },
      (group, color) => {
        const rocket = new THREE.Group();
        group.add(rocket);
        const body = makeMaterial(0xdce6ef, { metalness: 0.4, roughness: 0.24 });
        addMesh(rocket, new THREE.CylinderGeometry(0.085, 0.11, 0.32, 24), body, [0, 0, 0]);
        addMesh(rocket, new THREE.ConeGeometry(0.085, 0.19, 24), makeMaterial(color, { metalness: 0.5, roughness: 0.2 }), [0, 0.25, 0]);
        addMesh(rocket, new THREE.SphereGeometry(0.045, 18, 14), makeMaterial(0x7dc7dc, { metalness: 0.2, roughness: 0.12, emissive: 0x1d5262, emissiveIntensity: 0.4 }), [0, 0.04, 0.102], [1, 1, 0.35]);
        [-1, 1].forEach((side) => addMesh(rocket, new THREE.ConeGeometry(0.065, 0.17, 3), makeMaterial(color, { metalness: 0.4 }), [side * 0.115, -0.16, 0], [1, 1, 0.65], [0, 0, side * -0.55]));
        const flame = addMesh(rocket, new THREE.ConeGeometry(0.07, 0.26, 16), new THREE.MeshBasicMaterial({ color: 0xff9a62, transparent: true, opacity: 0.88 }), [0, -0.3, 0], [1, 1, 1], [0, 0, Math.PI]);
        addMesh(rocket, new THREE.ConeGeometry(0.035, 0.17, 12), new THREE.MeshBasicMaterial({ color: 0xffe6a3 }), [0, -0.29, 0.006], [1, 1, 1], [0, 0, Math.PI]);
        rocket.rotation.z = -0.18;
        return { animate: (delta, time) => { if (!reducedMotion.matches) flame.scale.setScalar(0.8 + (Math.sin(time * 0.009) + 1) * 0.16); } };
      },
      (group, color) => {
        const headset = new THREE.Group();
        group.add(headset);
        const band = makeMaterial(color, { metalness: 0.58, roughness: 0.24 });
        const cushion = makeMaterial(0x263344, { metalness: 0.24, roughness: 0.42 });
        addMesh(headset, new THREE.TorusGeometry(0.24, 0.038, 12, 48, Math.PI), band, [0, 0.04, 0]);
        [-1, 1].forEach((side) => {
          addMesh(headset, new THREE.SphereGeometry(0.105, 20, 16), band, [side * 0.23, -0.01, 0]);
          addMesh(headset, new THREE.SphereGeometry(0.078, 20, 16), cushion, [side * 0.245, -0.01, 0.055], [0.75, 1, 0.55]);
        });
        const mic = addTube(headset, [[0.27, -0.05, 0.03], [0.29, -0.17, 0.08], [0.19, -0.22, 0.1]], 0.015, band);
        addMesh(headset, new THREE.SphereGeometry(0.033, 14, 12), makeMaterial(0xe4c98f, { metalness: 0.42, emissive: 0x6a4d20, emissiveIntensity: 0.3 }), [0.19, -0.22, 0.1]);
        return { animate: (delta) => { if (!reducedMotion.matches) headset.rotation.y = Math.sin(performance.now() * 0.00055) * 0.12; }, mic };
      }
    ];
    const nodeData = steps.map((step, index) => {
      const group = new THREE.Group();
      const baseColor = [0x73c8df, 0xe8c479, 0xe59cc2, 0x8ec9aa, 0xf19474, 0x9caee8, 0xc1a2dc][index];
      const artifact = buildArtifacts[index](group, baseColor);
      world.add(group);
      return { step, group, baseColor, ...artifact };
    });

    const targetTilt = new THREE.Vector2();
    const depths = [0, 0.32, -0.24, 0.4, -0.34, 0.26, 0];
    let activeIndex = -1;
    let track = null;
    let active = false;
    let frameId = 0;
    let lastTime = 0;

    function setActiveStep(index) {
      activeIndex = index;
      nodeData.forEach(({ step }, stepIndex) => {
        const selected = stepIndex === index;
        step.classList.toggle("is-active", selected);
        if (selected) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
      if (index >= 0) section.dataset.activeStep = String(index + 1);
      else delete section.dataset.activeStep;
    }

    function layoutScene() {
      const bounds = section.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      camera.aspect = bounds.width / bounds.height;
      camera.updateProjectionMatrix();
      renderer.setSize(bounds.width, bounds.height, false);
      const compactLayout = window.matchMedia("(max-width: 760px)").matches;
      const artifactScale = compactLayout ? 0.14 : 1;

      const points = nodeData.map(({ step, group }, index) => {
        const marker = step.querySelector(".process-marker").getBoundingClientRect();
        const depth = depths[index];
        const visibleHeight = 2 * (camera.position.z - depth) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const visibleWidth = visibleHeight * camera.aspect;
        const x = (marker.left + marker.width / 2 - bounds.left) / bounds.width;
        const y = (marker.top + marker.height / 2 - bounds.top) / bounds.height;
        group.position.set((x - 0.5) * visibleWidth, (0.5 - y) * visibleHeight, depth);
        group.userData.artifactScale = artifactScale;
        return group.position.clone();
      });

      if (track) {
        world.remove(track);
        track.geometry.dispose();
      }
      const curve = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.45);
      track = new THREE.Mesh(new THREE.TubeGeometry(curve, 168, 0.018, 8, false), trackMaterial);
      world.add(track);
    }

    function updatePointer(event) {
      if (event.pointerType === "touch") return;
      const bounds = section.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      targetTilt.set(y * 0.08, -x * 0.12);
    }

    steps.forEach((step, index) => {
      step.addEventListener("pointerenter", () => setActiveStep(index));
      step.addEventListener("pointerleave", () => {
        if (!step.matches(":focus")) setActiveStep(-1);
      });
      step.addEventListener("focus", () => setActiveStep(index));
      step.addEventListener("blur", () => setActiveStep(-1));
    });
    section.addEventListener("pointermove", updatePointer, { passive: true });
    section.addEventListener("pointerleave", () => targetTilt.set(0, 0));

    function render(time) {
      frameId = 0;
      if (!active || document.hidden) return;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      world.rotation.x += (targetTilt.x - world.rotation.x) * 0.045;
      world.rotation.y += (targetTilt.y - world.rotation.y) * 0.045;
      nodeData.forEach(({ group, animate }, index) => {
        const selected = index === activeIndex;
        group.scale.setScalar(group.userData.artifactScale * (selected ? 1.16 : 1));
        if (animate) animate(delta, time, selected);
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    }

    function startRendering() {
      if (active && !document.hidden && !frameId) frameId = requestAnimationFrame(render);
    }

    new ResizeObserver(layoutScene).observe(section);
    layoutScene();
    document.fonts?.ready.then(layoutScene);
    new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) startRendering();
      else {
        cancelAnimationFrame(frameId);
        frameId = 0;
        lastTime = 0;
      }
    }, { threshold: 0.03 }).observe(section);
    document.addEventListener("visibilitychange", startRendering);
    section.classList.add("is-3d");
    startRendering();
  }
}