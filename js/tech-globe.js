import * as THREE from "three";

const stage = document.querySelector(".tech-orbit");

if (stage) {
  const canvas = stage.querySelector(".tech-globe-canvas");
  const selection = document.querySelector(".tech-selection");
  const buttons = [...stage.querySelectorAll(".tech-skill")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    renderer = null;
  }

  if (renderer) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 30);
    camera.position.set(0, 0, 6.4);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const globe = new THREE.Group();
    scene.add(globe);

    scene.add(new THREE.HemisphereLight(0xc6e8ff, 0x101520, 1.65));
    const keyLight = new THREE.DirectionalLight(0xffdfb1, 2.5);
    keyLight.position.set(-3.5, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x56b6d2, 14, 8);
    rimLight.position.set(3, -1.5, -2);
    scene.add(rimLight);

    const skull = new THREE.Group();
    globe.add(skull);
    const boneMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd9c7a6, metalness: 0.12, roughness: 0.38 });
    const shellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe7d8bd,
      metalness: 0.12,
      roughness: 0.3,
      transparent: true,
      opacity: 0.23,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const socketMaterial = new THREE.MeshStandardMaterial({ color: 0x080d15, roughness: 0.9 });
    const addEllipsoid = (parent, position, scale, material, geometry = new THREE.SphereGeometry(1, 32, 24)) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      parent.add(mesh);
      return mesh;
    };
    const addBoneCurve = (points, radius = 0.035, material = boneMaterial) => {
      const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, radius, 8, false), material);
      skull.add(mesh);
      return mesh;
    };

    const brain = new THREE.Group();
    skull.add(brain);
    const brainMaterial = new THREE.MeshPhysicalMaterial({ color: 0xc47d98, emissive: 0x351523, emissiveIntensity: 0.48, roughness: 0.38, clearcoat: 0.48 });
    const foldMaterial = new THREE.MeshStandardMaterial({ color: 0x874c67, emissive: 0x26121c, emissiveIntensity: 0.3, roughness: 0.46 });
    [-1, 1].forEach((side) => {
      addEllipsoid(brain, [side * 0.155, 0.22, 0.12], [0.29, 0.37, 0.3], brainMaterial);
      for (let foldIndex = 0; foldIndex < 5; foldIndex++) {
        const height = 0.04 + foldIndex * 0.075;
        const points = Array.from({ length: 17 }, (_, pointIndex) => {
          const progress = pointIndex / 16;
          const localX = (progress - 0.5) * 0.4;
          const localY = height + Math.sin(progress * Math.PI * 3 + foldIndex * 0.72) * 0.024;
          const dx = localX / 0.3;
          const dy = (localY - 0.22) / 0.38;
          const frontZ = 0.12 + 0.302 * Math.sqrt(Math.max(0.12, 1 - dx * dx - dy * dy));
          return [side * 0.155 + localX, localY, frontZ];
        });
        addBoneCurve(points, 0.009, foldMaterial);
      }
    });
    addEllipsoid(skull, [0, -0.27, 0.1], [0.105, 0.23, 0.11], brainMaterial);

    const domeGeometry = new THREE.SphereGeometry(0.65, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.78);
    addEllipsoid(skull, [0, 0.13, -0.02], [1, 1.08, 0.84], shellMaterial, domeGeometry);
    const rimMaterial = new THREE.MeshPhysicalMaterial({ color: 0xead8b8, metalness: 0.16, roughness: 0.32 });
    const socketRimGeometry = new THREE.TorusGeometry(0.17, 0.03, 10, 36);
    [-1, 1].forEach((side) => {
      const socketX = side * 0.24;
      addEllipsoid(skull, [socketX, -0.15, 0.53], [0.16, 0.19, 0.055], socketMaterial);
      const socketRim = new THREE.Mesh(socketRimGeometry, rimMaterial);
      socketRim.position.set(socketX, -0.15, 0.56);
      socketRim.scale.set(0.92, 1.14, 0.78);
      skull.add(socketRim);
    });

    const noseGeometry = new THREE.BufferGeometry();
    noseGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
      0, 0.1, 0,
      -0.085, -0.065, 0,
      0.085, -0.065, 0
    ], 3));
    noseGeometry.setIndex([0, 2, 1]);
    noseGeometry.computeVertexNormals();
    const nose = new THREE.Mesh(noseGeometry, socketMaterial);
    nose.position.set(0, -0.36, 0.575);
    skull.add(nose);

    addBoneCurve([[-0.06, -0.32, 0.52], [-0.19, -0.31, 0.49], [-0.38, -0.22, 0.4], [-0.43, -0.13, 0.34]], 0.045, rimMaterial);
    addBoneCurve([[0.06, -0.32, 0.52], [0.19, -0.31, 0.49], [0.38, -0.22, 0.4], [0.43, -0.13, 0.34]], 0.045, rimMaterial);
    addBoneCurve([[-0.42, -0.2, 0.35], [-0.4, -0.43, 0.4], [0, -0.58, 0.48], [0.4, -0.43, 0.4], [0.42, -0.2, 0.35]], 0.047, rimMaterial);
    for (let toothIndex = -3; toothIndex <= 3; toothIndex++) {
      const x = toothIndex * 0.085;
      const y = -0.43 - (1 - Math.abs(toothIndex) / 4) * 0.08;
      addEllipsoid(skull, [x, y, 0.49 - Math.abs(toothIndex) * 0.018], [0.034, 0.055, 0.032], boneMaterial);
    }

    const radius = 1.34;
    const sphereGeometry = new THREE.SphereGeometry(radius, 48, 36);
    const sphere = new THREE.Mesh(sphereGeometry, new THREE.MeshPhysicalMaterial({
      color: 0x12354a,
      metalness: 0.42,
      roughness: 0.4,
      clearcoat: 0.65,
      clearcoatRoughness: 0.38,
      transparent: true,
      opacity: 0.1,
      depthWrite: false
    }));
    globe.add(sphere);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.075, 40, 32),
      new THREE.MeshBasicMaterial({ color: 0x58b8d5, side: THREE.BackSide, transparent: true, opacity: 0.12 })
    );
    globe.add(atmosphere);

    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x91cadd, transparent: true, opacity: 0.34 });
    const addLine = (points, material = gridMaterial, closed = false) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = closed ? new THREE.LineLoop(geometry, material) : new THREE.Line(geometry, material);
      globe.add(line);
      return line;
    };

    for (let latitude = -60; latitude <= 60; latitude += 30) {
      const angle = THREE.MathUtils.degToRad(latitude);
      const ringRadius = radius * Math.cos(angle);
      const height = radius * Math.sin(angle);
      const points = Array.from({ length: 97 }, (_, step) => {
        const longitude = (step / 96) * Math.PI * 2;
        return new THREE.Vector3(ringRadius * Math.sin(longitude), height, ringRadius * Math.cos(longitude));
      });
      addLine(points, gridMaterial, true);
    }

    for (let longitude = 0; longitude < 180; longitude += 30) {
      const angle = THREE.MathUtils.degToRad(longitude);
      const points = Array.from({ length: 65 }, (_, step) => {
        const latitude = (step / 64 - 0.5) * Math.PI;
        return new THREE.Vector3(
          radius * Math.cos(latitude) * Math.sin(angle),
          radius * Math.sin(latitude),
          radius * Math.cos(latitude) * Math.cos(angle)
        );
      });
      addLine(points);
    }

    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xd1b986, transparent: true, opacity: 0.28 });
    const orbitOne = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.42, 0.006, 6, 160), orbitMaterial);
    orbitOne.rotation.set(1.05, 0.2, -0.3);
    globe.add(orbitOne);
    const orbitTwo = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 1.58, 0.004, 6, 160),
      new THREE.MeshBasicMaterial({ color: 0x7bbdd0, transparent: true, opacity: 0.16 })
    );
    orbitTwo.rotation.set(0.55, -0.8, 0.7);
    globe.add(orbitTwo);

    const skillVectors = buttons.map((_, index) => {
      const vertical = 1 - 2 * ((index + 0.5) / buttons.length);
      const horizontalRadius = Math.sqrt(1 - vertical * vertical);
      const longitude = index * Math.PI * (3 - Math.sqrt(5));
      return new THREE.Vector3(
        Math.cos(longitude) * horizontalRadius,
        vertical,
        Math.sin(longitude) * horizontalRadius
      );
    });
    const skillLinks = [];
    const skillSprites = [];

    function createSkillTexture(label, isActive) {
      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = 360;
      textureCanvas.height = 100;
      const context = textureCanvas.getContext("2d");
      const inset = 4;
      const corner = 24;
      context.beginPath();
      context.moveTo(inset + corner, inset);
      context.lineTo(textureCanvas.width - inset - corner, inset);
      context.quadraticCurveTo(textureCanvas.width - inset, inset, textureCanvas.width - inset, inset + corner);
      context.lineTo(textureCanvas.width - inset, textureCanvas.height - inset - corner);
      context.quadraticCurveTo(textureCanvas.width - inset, textureCanvas.height - inset, textureCanvas.width - inset - corner, textureCanvas.height - inset);
      context.lineTo(inset + corner, textureCanvas.height - inset);
      context.quadraticCurveTo(inset, textureCanvas.height - inset, inset, textureCanvas.height - inset - corner);
      context.lineTo(inset, inset + corner);
      context.quadraticCurveTo(inset, inset, inset + corner, inset);
      context.closePath();
      context.fillStyle = isActive ? "rgba(224,195,139,.98)" : "rgba(9,19,29,.94)";
      context.fill();
      context.strokeStyle = isActive ? "#fff0c8" : "rgba(142,198,219,.7)";
      context.lineWidth = 3;
      context.stroke();
      context.fillStyle = isActive ? "#1c2028" : "#e4edf1";
      context.font = "500 32px 'DM Mono', monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(label, textureCanvas.width / 2, textureCanvas.height / 2 + 1, textureCanvas.width - 44);
      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    const skillNodes = skillVectors.map((direction, index) => {
      const brainSurface = direction.clone().multiplyScalar(0.49);
      const labelPosition = direction.clone().multiplyScalar(1.82);
      const linkMaterial = new THREE.LineBasicMaterial({ color: 0x8dbfd0, transparent: true, opacity: 0.74 });
      addLine([brainSurface, labelPosition], linkMaterial);
      skillLinks.push({ material: linkMaterial, brainSurface });
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.047, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0x91cadd, emissive: 0x16394a, emissiveIntensity: 0.8, roughness: 0.28 })
      );
      node.position.copy(brainSurface);
      globe.add(node);
      const label = buttons[index].textContent.trim();
      const baseTexture = createSkillTexture(label, false);
      const activeTexture = createSkillTexture(label, true);
      const labelMaterial = new THREE.SpriteMaterial({ map: baseTexture, transparent: true, depthTest: true, depthWrite: false });
      const sprite = new THREE.Sprite(labelMaterial);
      const labelWidth = 0.54 + label.length * 0.04;
      sprite.position.copy(labelPosition);
      sprite.scale.set(labelWidth, 0.27, 1);
      globe.add(sprite);
      skillSprites.push({ sprite, material: labelMaterial, baseTexture, activeTexture, labelWidth });
      return node;
    });

    const targetOrientation = new THREE.Quaternion();
    const activeDirection = new THREE.Vector3(0, 0, 1);
    const pointerEuler = new THREE.Euler(0, 0, 0, "YXZ");
    const pointerPosition = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let activeIndex = -1;
    let pointerActive = false;
    let inView = false;
    let frameId = 0;
    let lastTime = 0;

    function setActiveSkill(index, orient = true) {
      activeIndex = index;
      buttons.forEach((button, buttonIndex) => button.classList.toggle("is-active", buttonIndex === index));
      skillLinks.forEach(({ material }, linkIndex) => material.color.set(linkIndex === index ? 0xf0d7a0 : 0x8dbfd0));
      skillSprites.forEach(({ sprite, material, baseTexture, activeTexture, labelWidth }, spriteIndex) => {
        const selected = spriteIndex === index;
        material.map = selected ? activeTexture : baseTexture;
        material.needsUpdate = true;
        sprite.scale.set(labelWidth * (selected ? 1.12 : 1), selected ? 0.31 : 0.27, 1);
      });
      if (selection) selection.value = index < 0 ? "Technology toolkit" : buttons[index].textContent.trim();
      if (index >= 0 && orient) {
        targetOrientation.setFromUnitVectors(skillVectors[index], activeDirection);
      } else if (index < 0 && orient && !pointerActive) {
        targetOrientation.identity();
      }
    }

    function getSkillAtPointer(event) {
      const bounds = canvas.getBoundingClientRect();
      pointerPosition.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      );
      raycaster.setFromCamera(pointerPosition, camera);
      const intersections = raycaster.intersectObjects(skillSprites.map(({ sprite }) => sprite), false);
      const hit = intersections.find((intersection) => intersection.object.position.clone().applyQuaternion(globe.quaternion).z > 0);
      return hit ? skillSprites.findIndex(({ sprite }) => sprite === hit.object) : -1;
    }

    function updatePointerOrientation(event) {
      if (event.pointerType === "touch") return;
      const hoveredSkill = getSkillAtPointer(event);
      if (hoveredSkill >= 0) {
        canvas.style.cursor = "pointer";
        pointerActive = true;
        setActiveSkill(hoveredSkill, false);
        return;
      }
      canvas.style.cursor = "grab";
      if (activeIndex >= 0 && !buttons.some((button) => button.matches(":focus"))) setActiveSkill(-1, false);
      const bounds = stage.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      pointerEuler.set(-y * 0.62, x * 0.92, 0);
      targetOrientation.setFromEuler(pointerEuler);
      pointerActive = true;
    }

    canvas.addEventListener("pointermove", updatePointerOrientation, { passive: true });
    canvas.addEventListener("pointerdown", (event) => {
      const skillIndex = getSkillAtPointer(event);
      if (skillIndex < 0) return;
      setActiveSkill(skillIndex);
      buttons[skillIndex].focus({ preventScroll: true });
    });
    canvas.addEventListener("pointerleave", () => {
      pointerActive = false;
      if (!buttons.some((button) => button.matches(":focus"))) setActiveSkill(-1);
    });

    buttons.forEach((button, index) => {
      button.addEventListener("focus", () => setActiveSkill(index));
      button.addEventListener("blur", () => {
        if (!button.matches(":hover")) setActiveSkill(-1);
      });
      button.addEventListener("click", () => setActiveSkill(index));
    });

    function resize() {
      const bounds = stage.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      camera.aspect = bounds.width / bounds.height;
      camera.updateProjectionMatrix();
      renderer.setSize(bounds.width, bounds.height, false);
    }

    function render(time) {
      frameId = 0;
      if (!inView || document.hidden) return;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      if (activeIndex < 0 && !pointerActive && !reducedMotion.matches) {
        targetOrientation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), time * 0.000085);
      }
      globe.quaternion.slerp(targetOrientation, reducedMotion.matches ? 0.1 : 0.055);
      if (!reducedMotion.matches) {
        orbitOne.rotation.z += delta * 0.035;
        orbitTwo.rotation.y -= delta * 0.025;
      }
      skillNodes.forEach((node, index) => {
        const selected = index === activeIndex;
        node.scale.setScalar(selected ? 1.65 : 1);
        node.material.color.set(selected ? 0xf0d7a0 : 0x91cadd);
        node.material.emissive.set(selected ? 0x795b26 : 0x16394a);
        const depth = node.position.clone().applyQuaternion(globe.quaternion).z;
        skillLinks[index].material.opacity = depth > 0 ? 0.78 : 0.12;
        skillSprites[index].material.opacity = depth > 0 ? 1 : 0.3;
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    }

    function startRendering() {
      if (inView && !document.hidden && !frameId) frameId = requestAnimationFrame(render);
    }

    new ResizeObserver(resize).observe(stage);
    resize();
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) startRendering();
      else {
        cancelAnimationFrame(frameId);
        frameId = 0;
        lastTime = 0;
      }
    }, { threshold: 0.08 }).observe(stage);
    document.addEventListener("visibilitychange", startRendering);
    stage.classList.add("is-3d");
    startRendering();
  }
}