const canvas = document.querySelector("#hero-canvas");
const room = document.querySelector(".room-experience");
const fallback = document.querySelector(".room-fallback");
const roomLightToggle = document.querySelector(".room-light-toggle");
const zoomControls = document.querySelector(".room-zoom-controls");
const zoomLevel = document.querySelector(".room-zoom-level");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let changeRoomLighting = () => {};

function updateLightControl(isOn) {
  if (!roomLightToggle) return;
  roomLightToggle.setAttribute("aria-pressed", String(isOn));
  roomLightToggle.setAttribute("aria-label", isOn ? "Turn the room lights off" : "Turn the room lights on");
  roomLightToggle.querySelector(".light-label").textContent = isOn ? "LIGHTS OFF" : "LIGHTS ON";
}

roomLightToggle?.addEventListener("click", () => changeRoomLighting());

if (canvas && room) {
  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js");
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: window.devicePixelRatio < 2,
      powerPreference: "low-power"
    });
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a0c12");
    scene.fog = new THREE.Fog("#0a0c12", 13, 30);
    const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 45);
    const clock = new THREE.Clock();
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const baseFov = isMobile ? 84 : 54;
    const maxPixelRatio = isMobile ? 1.15 : 1.55;
    const targetLook = new THREE.Vector3();
    const cameraStart = new THREE.Vector3(3.5, 3.1, 12.2);
    const cameraSeat = new THREE.Vector3(1.45, 1.92, 6.3);
    const mobileCameraPositions = {
      studio: new THREE.Vector3(-0.53, 2.05, 8.9),
      about: new THREE.Vector3(-5.2, 1.92, 4.4),
      services: new THREE.Vector3(5.2, 1.92, 6.3),
      contact: new THREE.Vector3(-5.2, 1.92, 0)
    };
    const mobileWallLookTargets = {
      studio: new THREE.Vector3(-0.53, 4.1, -9.28),
      about: new THREE.Vector3(7.28, 4.2, 4.4),
      services: new THREE.Vector3(-7.28, 4.2, 6.3),
      contact: new THREE.Vector3(0.2, 2, 9.28)
    };
    const mobileWallAngles = Object.fromEntries(
      Object.entries(mobileWallLookTargets).map(([name, point]) => {
        const origin = mobileCameraPositions[name];
        return [name, Math.atan2(point.x - origin.x, -(point.z - origin.z))];
      })
    );
    const desktopWallAngles = {
      studio: Math.atan2(1.35 - cameraSeat.x, -(-9.28 - cameraSeat.z)),
      about: Math.atan2(7.28 - cameraSeat.x, -(4.4 - cameraSeat.z)),
      services: -Math.PI / 2,
      contact: -Math.PI + Math.atan2(1.25, 2.98)
    };
    const desktopWallLookHeights = { studio: 4.2, about: 4.2, services: 4.2, contact: 2 };
    const wallAngles = isMobile ? mobileWallAngles : desktopWallAngles;
    const selectedCameraPosition = cameraSeat.clone();
    const wallButtons = [...document.querySelectorAll("[data-room-wall]")];
    const announcement = document.querySelector("#room-announcement");
    let active = true;
    let frame = 0;
    let targetYaw = wallAngles.studio;
    let currentYaw = wallAngles.studio;
    let isDragging = false;
    let lastPointerX = 0;
    let arrivalStart = null;
    let arrivalPlayed = false;
    let lightsOn = false;
    let lightBlend = 0;
    let targetLightBlend = 0;
    let targetZoom = 1;
    let touchDistance = 0;
    const roomLighting = [];
    const darkRoomColor = new THREE.Color("#0a0c12");
    const brightRoomColor = new THREE.Color("#eee8f1");
    const minZoom = 1;
    const maxZoom = 2.4;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    renderer.shadowMap.enabled = !isMobile && !reducedMotion.matches;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    camera.position.copy(cameraStart);

    function registerRoomLight(light, brightIntensity = light.intensity * 1.5) {
      roomLighting.push({ light, darkIntensity: light.intensity, brightIntensity });
      return light;
    }

    const ambient = registerRoomLight(new THREE.HemisphereLight(0xd0d9ff, 0x24212a, 1.6), 3.2);
    scene.add(ambient);
    const keyLight = registerRoomLight(new THREE.DirectionalLight(0xffefd8, 2.8), 4.2);
    keyLight.position.set(-4, 8, 5);
    keyLight.castShadow = !isMobile && !reducedMotion.matches;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 12;
    keyLight.shadow.camera.bottom = -12;
    scene.add(keyLight);

    function addPointLight(color, intensity, distance, position) {
      const light = registerRoomLight(new THREE.PointLight(color, intensity, distance), intensity * 1.55);
      light.position.set(...position);
      scene.add(light);
      return light;
    }

    addPointLight(0x758aff, 28, 12, [0, 5.7, -6.5]);
    addPointLight(0xb18aff, 18, 11, [6.4, 4.7, 0]);
    addPointLight(0x739eff, 18, 11, [-6.4, 4.7, 0]);
    addPointLight(0xd0a6ff, 10, 9, [0, 5.4, 7.3]);
    addPointLight(0x6681ff, 8, 8, [-1, 3.2, 0.2]);
    addPointLight(0xa6b8ff, 13, 5, [-1.4, 2.8, 3.4]);

    const materials = {
      wall: new THREE.MeshStandardMaterial({ color: 0x191b25, roughness: 0.86, metalness: 0.08 }),
      sideWall: new THREE.MeshStandardMaterial({ color: 0x141720, roughness: 0.9, metalness: 0.06 }),
      floor: new THREE.MeshStandardMaterial({ color: 0x13151c, roughness: 0.57, metalness: 0.31 }),
      trim: new THREE.MeshStandardMaterial({ color: 0x34394d, roughness: 0.38, metalness: 0.62 }),
      darkMetal: new THREE.MeshStandardMaterial({ color: 0x222633, roughness: 0.3, metalness: 0.76 }),
      wood: new THREE.MeshStandardMaterial({ color: 0x28252c, roughness: 0.39, metalness: 0.24 }),
      upholstery: new THREE.MeshStandardMaterial({ color: 0x292d42, roughness: 0.81 }),
      jacket: new THREE.MeshStandardMaterial({ color: 0x465b91, roughness: 0.77 }),
      trousers: new THREE.MeshStandardMaterial({ color: 0x30374d, roughness: 0.84 }),
      skin: new THREE.MeshStandardMaterial({ color: 0x87523b, roughness: 0.82 }),
      hair: new THREE.MeshStandardMaterial({ color: 0x17151a, roughness: 0.92 }),
      beard: new THREE.MeshStandardMaterial({ color: 0x302126, roughness: 0.9 }),
      eyes: new THREE.MeshStandardMaterial({ color: 0xf4eee4, roughness: 0.32 }),
      iris: new THREE.MeshStandardMaterial({ color: 0x593b2b, roughness: 0.3 }),
      pupil: new THREE.MeshStandardMaterial({ color: 0x17151a, roughness: 0.22 }),
      lips: new THREE.MeshStandardMaterial({ color: 0x643a36, roughness: 0.72 }),
      shoe: new THREE.MeshStandardMaterial({ color: 0x13151b, roughness: 0.64 }),
      screenFrame: new THREE.MeshStandardMaterial({ color: 0x080a11, roughness: 0.34, metalness: 0.67 }),
      pictureGold: new THREE.MeshStandardMaterial({ color: 0x9b7854, roughness: 0.34, metalness: 0.74 }),
      ceramic: new THREE.MeshStandardMaterial({ color: 0xa584a5, roughness: 0.27, metalness: 0.08 }),
      foliage: new THREE.MeshStandardMaterial({ color: 0x3e7357, roughness: 0.72 }),
      foliageLight: new THREE.MeshStandardMaterial({ color: 0x78a76f, roughness: 0.68 }),
      flower: new THREE.MeshStandardMaterial({ color: 0xe9b8cb, roughness: 0.48 }),
      flowerWarm: new THREE.MeshStandardMaterial({ color: 0xf1d49a, roughness: 0.52 }),
      doorGlass: new THREE.MeshStandardMaterial({ color: 0x29304a, roughness: 0.24, metalness: 0.48, transparent: true, opacity: 0.6 })
    };
    const roomSurfaceColors = [
      { material: materials.wall, bright: 0xf3e9de },
      { material: materials.sideWall, bright: 0xe7def5 },
      { material: materials.floor, bright: 0xd8d2ce },
      { material: materials.trim, bright: 0xb879a5 },
      { material: materials.darkMetal, bright: 0x4c4561 },
      { material: materials.wood, bright: 0xb97e5a },
      { material: materials.upholstery, bright: 0xb49acb },
      { material: materials.jacket, bright: 0x397d91 },
      { material: materials.trousers, bright: 0x565473 },
      { material: materials.screenFrame, bright: 0xc59b63 },
      { material: materials.pictureGold, bright: 0xd4a96f },
      { material: materials.ceramic, bright: 0xc49bc8 },
      { material: materials.foliage, bright: 0x3e7357 },
      { material: materials.foliageLight, bright: 0x78a76f },
      { material: materials.flower, bright: 0xe9b8cb },
      { material: materials.flowerWarm, bright: 0xf1d49a },
      { material: materials.doorGlass, bright: 0x8bcbd9 }
    ].map(({ material, bright }) => ({
      material,
      dark: material.color.clone(),
      bright: new THREE.Color(bright)
    }));

    function box(parent, size, position, material, options = {}) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.position.set(...position);
      mesh.castShadow = options.castShadow ?? true;
      mesh.receiveShadow = options.receiveShadow ?? true;
      if (options.rotation) mesh.rotation.set(...options.rotation);
      parent.add(mesh);
      return mesh;
    }

    const roomShell = new THREE.Group();
    scene.add(roomShell);
    box(roomShell, [15, 0.22, 19], [0, -0.13, 0], materials.floor, { castShadow: false });
    box(roomShell, [15, 0.13, 19], [0, 7.35, 0], materials.sideWall, { castShadow: false, receiveShadow: false });
    box(roomShell, [15, 7.5, 0.24], [0, 3.6, -9.45], materials.wall);
    box(roomShell, [0.24, 7.5, 19], [-7.45, 3.6, 0], materials.sideWall);
    box(roomShell, [0.24, 7.5, 19], [7.45, 3.6, 0], materials.sideWall);

    const doorX = 3.5;
    box(roomShell, [7.0, 7.5, 0.24], [-4, 3.6, 9.45], materials.wall);
    box(roomShell, [2.92, 7.5, 0.24], [0.96, 3.6, 9.45], materials.wall);
    box(roomShell, [3.0, 7.5, 0.24], [6, 3.6, 9.45], materials.wall);
    box(roomShell, [3.0, 1.55, 0.24], [doorX, 6.72, 9.45], materials.wall);
    box(roomShell, [0.12, 5.9, 0.27], [doorX - 1.08, 3.53, 9.45], materials.trim);
    box(roomShell, [0.12, 5.9, 0.27], [doorX + 1.08, 3.53, 9.45], materials.trim);
    box(roomShell, [2.28, 0.12, 0.27], [doorX, 6.48, 9.45], materials.trim);
    const doorGroup = new THREE.Group();
    doorGroup.position.set(doorX - 1.02, 0, 9.42);
    roomShell.add(doorGroup);
    const openDoor = box(doorGroup, [2.02, 5.7, 0.12], [0.94, 3.0, 0], materials.doorGlass);
    openDoor.rotation.y = -0.8;
    box(roomShell, [0.9, 0.025, 18], [0, 0.005, 0], new THREE.MeshBasicMaterial({ color: 0x242837, transparent: true, opacity: 0.16 }), { castShadow: false });

    const screenArtworkSources = {
      about: "./assets/images/wall-skills.jpg",
      services: "./assets/images/wall-services.jpg",
      contact: "./assets/images/wall-contact.jpg",
      hello: ""
    };

    function drawScreenArtwork(context, key, x, y, width, height) {
      const palettes = {
        studio: ["#17284b", "#5687db", "#c5b5ff"],
        about: ["#242047", "#8c68c8", "#f0b2ca"],
        services: ["#102c3b", "#3689a7", "#a9c5ff"],
        contact: ["#332044", "#a265c7", "#f2b1d0"],
        hello: ["#17284b", "#5687db", "#c5b5ff"]
      };
      const [dark, mid, light] = palettes[key] || palettes.studio;
      const right = x + width;
      const bottom = y + height;
      const roundedRect = (left, top, rectWidth, rectHeight, radius) => {
        context.beginPath();
        context.roundRect(left, top, rectWidth, rectHeight, radius);
      };

      context.save();
      roundedRect(x, y, width, height, 20);
      context.clip();
      const background = context.createLinearGradient(x, y, right, bottom);
      background.addColorStop(0, dark);
      background.addColorStop(0.58, mid);
      background.addColorStop(1, "#101522");
      context.fillStyle = background;
      context.fillRect(x, y, width, height);

      const glow = context.createRadialGradient(x + width * 0.67, y + height * 0.28, 8, x + width * 0.67, y + height * 0.28, width * 0.7);
      glow.addColorStop(0, `${light}aa`);
      glow.addColorStop(1, "transparent");
      context.fillStyle = glow;
      context.fillRect(x, y, width, height);

      context.strokeStyle = "rgba(224,231,255,.13)";
      context.lineWidth = 1;
      for (let gridX = x + 24; gridX < right; gridX += 38) {
        context.beginPath();
        context.moveTo(gridX, y);
        context.lineTo(gridX, bottom);
        context.stroke();
      }
      for (let gridY = y + 24; gridY < bottom; gridY += 38) {
        context.beginPath();
        context.moveTo(x, gridY);
        context.lineTo(right, gridY);
        context.stroke();
      }

      if (key === "services") {
        for (let index = 0; index < 3; index += 1) {
          const cardX = x + 42 + index * 138;
          const cardY = y + 74 + (index % 2) * 30;
          roundedRect(cardX, cardY, 112, 220, 14);
          context.fillStyle = "rgba(10,15,28,.76)";
          context.fill();
          context.strokeStyle = "rgba(231,237,255,.3)";
          context.stroke();
          context.fillStyle = index === 1 ? light : "#b9c9f8";
          context.beginPath();
          context.arc(cardX + 56, cardY + 56, 27, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "rgba(235,239,255,.86)";
          context.fillRect(cardX + 20, cardY + 111, 72, 5);
          context.fillStyle = "rgba(211,220,255,.42)";
          context.fillRect(cardX + 20, cardY + 130, 58, 4);
          context.fillRect(cardX + 20, cardY + 145, 67, 4);
          roundedRect(cardX + 20, cardY + 174, 72, 22, 7);
          context.fillStyle = "rgba(142,166,255,.58)";
          context.fill();
        }
      } else {
        context.save();
        context.translate(x + width * 0.53, y + height * 0.18);
        context.rotate(-0.075);
        roundedRect(0, 0, width * 0.59, height * 0.72, 16);
        context.fillStyle = "rgba(7,11,22,.86)";
        context.fill();
        context.strokeStyle = "rgba(231,237,255,.34)";
        context.stroke();
        context.fillStyle = "rgba(220,229,255,.55)";
        context.beginPath();
        context.arc(24, 25, 4, 0, Math.PI * 2);
        context.arc(40, 25, 4, 0, Math.PI * 2);
        context.arc(56, 25, 4, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = light;
        context.font = "600 17px 'DM Mono', monospace";
        context.fillText(key === "about" ? "CREATIVE / TECH" : key === "contact" ? "LET'S BUILD" : "DIGITAL STUDIO", 22, 67);
        context.fillStyle = "rgba(231,237,255,.78)";
        context.fillRect(22, 88, width * 0.32, 3);
        context.fillStyle = "rgba(211,220,255,.36)";
        context.fillRect(22, 102, width * 0.25, 3);
        context.fillRect(22, 113, width * 0.29, 3);
        context.fillRect(22, 124, width * 0.21, 3);
        roundedRect(22, 148, width * 0.5, 116, 10);
        const cardGradient = context.createLinearGradient(22, 148, width * 0.5, 264);
        cardGradient.addColorStop(0, `${mid}dd`);
        cardGradient.addColorStop(1, `${dark}ee`);
        context.fillStyle = cardGradient;
        context.fill();
        context.restore();

        const orb = context.createRadialGradient(x + width * 0.76, y + height * 0.73, 4, x + width * 0.76, y + height * 0.73, width * 0.19);
        orb.addColorStop(0, "#ffffff");
        orb.addColorStop(0.12, light);
        orb.addColorStop(0.46, `${mid}cc`);
        orb.addColorStop(1, "rgba(120,130,255,0)");
        context.fillStyle = orb;
        context.beginPath();
        context.arc(x + width * 0.76, y + height * 0.73, width * 0.19, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "rgba(230,235,255,.54)";
        context.lineWidth = 2;
        context.beginPath();
        context.ellipse(x + width * 0.76, y + height * 0.73, width * 0.28, height * 0.1, -0.22, 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();
      context.strokeStyle = "rgba(231,237,255,.34)";
      context.lineWidth = 2;
      roundedRect(x, y, width, height, 20);
      context.stroke();
    }

    function makeWallTexture(key, title, kicker, lines, accent = "#a9bbff") {
      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = 1200;
      textureCanvas.height = 700;
      const context = textureCanvas.getContext("2d");
      const background = context.createLinearGradient(0, 0, 1200, 700);
      background.addColorStop(0, "#111522");
      background.addColorStop(0.58, "#0b0e16");
      background.addColorStop(1, "#171325");
      context.fillStyle = background;
      context.fillRect(0, 0, 1200, 700);
      context.strokeStyle = "rgba(172,187,255,.09)";
      context.lineWidth = 1;
      for (let x = 0; x < 1200; x += 42) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, 700);
        context.stroke();
      }
      for (let y = 0; y < 700; y += 42) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(1200, y);
        context.stroke();
      }
      const glow = context.createRadialGradient(960, 50, 20, 960, 50, 600);
      glow.addColorStop(0, `${accent}22`);
      glow.addColorStop(1, "transparent");
      context.fillStyle = glow;
      context.fillRect(0, 0, 1200, 700);
      drawScreenArtwork(context, key, 642, 145, 490, 430);
      context.fillStyle = accent;
      context.font = "500 18px 'DM Mono', monospace";
      context.fillText(`${key.toUpperCase()}  /  CHAMPIONJAY TECHNOLOGY`, 72, 76);
      context.fillStyle = "#717a95";
      context.font = "14px 'DM Mono', monospace";
      context.fillText(kicker.toUpperCase(), 74, 120);
      if (key === "contact") {
        context.fillStyle = "#f1f0ee";
        context.font = "700 56px 'Manrope', 'Segoe UI', sans-serif";
        context.fillText("LET'S CONNECT.", 72, 212);
        context.fillStyle = "#9ca4b9";
        context.font = "21px 'Manrope', 'Segoe UI', sans-serif";
        context.fillText("Tell me what you're building. Let's make it real.", 74, 258);

        const contactRows = [
          { label: "EMAIL", value: "championjaytech@gmail.com", y: 352, icon: "email" },
          { label: "CALL / WHATSAPP", value: "+234 913 837 0625", y: 458, icon: "phone" },
          { label: "SOCIALS", value: "@championjaytech", y: 564, icon: "social" }
        ];
        contactRows.forEach(({ label, value, y, icon }) => {
          context.strokeStyle = "rgba(208,168,255,.25)";
          context.lineWidth = 2;
          context.beginPath();
          context.arc(104, y - 9, 27, 0, Math.PI * 2);
          context.stroke();
          context.save();
          context.strokeStyle = accent;
          context.fillStyle = accent;
          context.lineWidth = 3;
          context.lineCap = "round";
          context.lineJoin = "round";
          if (icon === "email") {
            context.strokeRect(91, y - 19, 26, 19);
            context.beginPath();
            context.moveTo(92, y - 18);
            context.lineTo(104, y - 8);
            context.lineTo(116, y - 18);
            context.stroke();
          } else if (icon === "phone") {
            context.beginPath();
            context.moveTo(97, y - 21);
            context.bezierCurveTo(93, y - 18, 98, y - 7, 105, y);
            context.bezierCurveTo(112, y + 7, 121, y + 10, 124, y + 5);
            context.lineTo(117, y - 2);
            context.lineTo(112, y + 1);
            context.lineTo(102, y - 9);
            context.lineTo(105, y - 14);
            context.closePath();
            context.stroke();
          } else {
            context.font = "500 32px 'DM Mono', monospace";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("@", 104, y - 8);
          }
          context.restore();

          context.fillStyle = accent;
          context.font = "500 14px 'DM Mono', monospace";
          context.fillText(label, 154, y - 12);
          context.fillStyle = "#f1f0ee";
          context.font = `${icon === "email" ? "19" : "23"}px 'Manrope', 'Segoe UI', sans-serif`;
          context.fillText(value, 154, y + 17);
          if (y < 500) {
            context.fillStyle = "rgba(208,168,255,.18)";
            context.fillRect(154, y + 36, 410, 1);
          }
        });
      } else {
        context.fillStyle = "#f1f0ee";
        context.font = "600 59px 'Manrope', 'Segoe UI', sans-serif";
        const titleLines = title.split("\n");
        titleLines.forEach((line, index) => context.fillText(line, 72, 218 + index * 75));
        const lineStart = 248 + (titleLines.length - 1) * 75;
        context.fillStyle = "#9ca4b9";
        const lineFontSize = key === "studio" ? 25 : lines.length > 4 ? 18 : 22;
        const lineSpacing = key === "studio" ? 35 : lines.length > 4 ? 34 : 41;
        context.font = `${lineFontSize}px 'Manrope', 'Segoe UI', sans-serif`;
        lines.forEach((line, index) => {
          context.fillText(line, 74, lineStart + index * lineSpacing);
        });
      }
      context.fillStyle = accent;
      context.fillRect(74, 620, 86, 3);
      context.fillStyle = "#747b8e";
      context.font = "13px 'DM Mono', monospace";
      context.fillText("MOVE THROUGH THE ROOM TO EXPLORE", 178, 627);
      context.fillStyle = "rgba(221,226,255,.7)";
      context.font = "500 15px 'DM Mono', monospace";
      context.fillText(key.toUpperCase(), 1080, 650);

      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      if (screenArtworkSources[key]) {
        const image = new Image();
        image.onload = () => {
          context.save();
          context.beginPath();
          context.roundRect(642, 145, 490, 430, 20);
          context.clip();
          const imageRatio = image.width / image.height;
          const panelRatio = 490 / 430;
          const sourceWidth = imageRatio > panelRatio ? image.height * panelRatio : image.width;
          const sourceHeight = imageRatio > panelRatio ? image.height : image.width / panelRatio;
          context.drawImage(
            image,
            (image.width - sourceWidth) / 2,
            (image.height - sourceHeight) / 2,
            sourceWidth,
            sourceHeight,
            642,
            145,
            490,
            430
          );
          context.fillStyle = "rgba(10,14,25,.22)";
          context.fillRect(642, 145, 490, 430);
          context.restore();
          texture.needsUpdate = true;
          requestRender();
        };
        image.onerror = () => console.warn(`Could not load screen artwork: ${screenArtworkSources[key]}`);
        image.src = screenArtworkSources[key];
      }
      return texture;
    }

    let studioStoryProgress = reducedMotion.matches ? 1 : 0;

    function makeStudioWallCopy() {
      const muralCanvas = document.createElement("canvas");
      muralCanvas.width = 1400;
      muralCanvas.height = 900;
      const context = muralCanvas.getContext("2d");
      const texture = new THREE.CanvasTexture(muralCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      function draw(isLightOn, progress) {
        context.clearRect(0, 0, muralCanvas.width, muralCanvas.height);
        const ink = isLightOn ? "#292535" : "#f4f1f3";
        const body = isLightOn ? "#575264" : "#c2c2d0";
        const accent = isLightOn ? "#8757a2" : "#b3c2ff";
        const glow = context.createRadialGradient(320, 365, 18, 320, 365, 740);
        glow.addColorStop(0, isLightOn ? "rgba(187,151,202,.13)" : "rgba(130,152,255,.13)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = glow;
        context.fillRect(0, 0, muralCanvas.width, muralCanvas.height);

        const reveal = (start, duration) => {
          const amount = THREE.MathUtils.clamp((progress - start) / duration, 0, 1);
          return 1 - Math.pow(1 - amount, 3);
        };
        const revealText = (text, x, y, start, duration, color, font) => {
          const amount = reveal(start, duration);
          if (amount <= 0) return 0;
          context.save();
          context.font = font;
          context.fillStyle = color;
          context.globalAlpha = Math.min(1, amount * 2.4);
          context.shadowColor = accent;
          context.shadowBlur = amount < 1 ? 18 * (1 - amount) : 0;
          context.beginPath();
          context.rect(x - 2, y - 100, context.measureText(text).width * amount + 4, 116);
          context.clip();
          context.fillText(text, x, y);
          context.restore();
          return amount;
        };

        context.textAlign = "left";
        context.textBaseline = "alphabetic";
        const mono = "500 21px 'DM Mono', monospace";
        const heading = "700 84px 'Manrope', 'Segoe UI', sans-serif";
        const subheading = "400 34px 'Manrope', 'Segoe UI', sans-serif";
        revealText("CHAMPIONJAY TECHNOLOGY   /   DIGITAL PARTNER", 88, 104, 0.02, 0.14, accent, mono);
        const marker = reveal(0.12, 0.2);
        context.fillStyle = accent;
        context.globalAlpha = marker;
        context.fillRect(88, 142, 128 * marker, 4);
        context.globalAlpha = 1;

        revealText("YOUR NEXT BIG IDEA,", 84, 286, 0.18, 0.23, ink, heading);
        const purposeProgress = revealText("BUILT WITH PURPOSE.", 84, 390, 0.38, 0.24, accent, heading);
        context.save();
        context.globalAlpha = purposeProgress;
        context.shadowColor = accent;
        context.shadowBlur = 12 * (1 - purposeProgress);
        context.fillStyle = accent;
        context.fillRect(86, 416, 790 * purposeProgress, 3);
        context.restore();

        revealText("I turn business goals into thoughtful websites, apps and", 89, 500, 0.62, 0.13, body, subheading);
        revealText("custom software—built to earn trust, simplify work, and", 89, 549, 0.73, 0.13, body, subheading);
        revealText("move your business forward.", 89, 598, 0.84, 0.13, body, subheading);
        texture.needsUpdate = true;
      }

      draw(false, studioStoryProgress);
      const mural = new THREE.Mesh(
        new THREE.PlaneGeometry(7.25, 4.65),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false })
      );
      mural.position.set(2.48, 4.1, -9.255);
      roomShell.add(mural);
      return { draw: (isLightOn, progress = studioStoryProgress) => draw(isLightOn, progress), texture };
    }

    const wallTextureSpecs = {
      about: {
        title: "MISSION &\nVISION.",
        kicker: "02  /  PURPOSE, PROGRESS AND LASTING IMPACT",
        lines: [
          "MY MISSION",
          "Build meaningful digital products",
          "that empower businesses, improve",
          "lives and create opportunities",
          "without boundaries.",
          "MY VISION",
          "Become a leading force in technology",
          "and digital innovation, creating",
          "solutions with lasting global impact."
        ],
        accent: "#c5a8ff"
      },
      services: {
        title: "WHAT I DO.",
        kicker: "03  /  THE RIGHT EXPERTISE FOR YOUR NEXT MOVE",
        lines: [
          "Custom websites and web applications.",
          "Business software, SaaS and automation.",
          "E-commerce, WordPress and UI/UX design.",
          "Laravel, PHP, Python and Django.",
          "SEO, digital strategy and consulting.",
          "Business plans and project proposals.",
          "Thoughtful digital solutions, built for you."
        ],
        accent: "#9cbcff"
      },
      contact: {
        title: "LET'S\nCOLLABORATE.",
        kicker: "04  /  LET'S TURN YOUR NEXT IDEA INTO IMPACT",
        lines: [
          "Have a goal, a challenge, or an idea?",
          "Let's talk about what success looks like.",
          "Email: championjaytech@gmail.com",
          "Socials: @championjaytech",
          "Thoughtful design. Reliable technology.",
          "A digital solution built around you.",
          "Start a conversation today."
        ],
        accent: "#d0a8ff"
      }
    };
    const wallTextures = Object.fromEntries(
      Object.entries(wallTextureSpecs).map(([key, spec]) => [
        key,
        makeWallTexture(key, spec.title, spec.kicker, spec.lines, spec.accent)
      ])
    );
    const studioWallCopy = makeStudioWallCopy();
    let studioStoryStart = null;
    let studioStoryLastDraw = -Infinity;
    let serviceInscription = null;

    function makeDisplay(parent, key, width, height, position, rotationY = 0) {
      const frame = new THREE.Group();
      frame.position.set(...position);
      frame.rotation.y = rotationY;
      parent.add(frame);
      box(frame, [width + 0.26, height + 0.26, 0.2], [0, 0, -0.04], materials.screenFrame);
      const screenMaterial = new THREE.MeshBasicMaterial({ map: wallTextures[key], toneMapped: false });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(width, height), screenMaterial);
      screen.position.z = 0.073;
      frame.add(screen);
      box(frame, [width, 0.024, 0.015], [0, height / 2 - 0.012, 0.094], materials.pictureGold, { castShadow: false });
      box(frame, [width, 0.024, 0.015], [0, -height / 2 + 0.012, 0.094], materials.pictureGold, { castShadow: false });
      box(frame, [0.024, height, 0.015], [-width / 2 + 0.012, 0, 0.094], materials.pictureGold, { castShadow: false });
      box(frame, [0.024, height, 0.015], [width / 2 - 0.012, 0, 0.094], materials.pictureGold, { castShadow: false });
      const halo = new THREE.PointLight(key === "services" ? 0x7d91ff : 0x9ba5ff, 4.8, 7);
      registerRoomLight(halo, 9.2);
      halo.position.set(0, 0, 0.65);
      frame.add(halo);
      box(frame, [width + 0.26, 0.055, 0.24], [0, height / 2 + 0.13, 0.015], materials.trim);
      const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0xa5f0c1 });
      const status = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), indicatorMaterial);
      status.position.set(width / 2 - 0.1, height / 2 + 0.13, 0.15);
      frame.add(status);
      return frame;
    }

    makeDisplay(roomShell, "about", 5.8, 3.5, [7.28, 4.2, 6.3], -Math.PI / 2);
    makeDisplay(roomShell, "contact", 4.3, 2.6, [0.2, 2, 9.28], Math.PI);

    async function addServiceInscription() {
      try {
        const [{ FontLoader }, { TextGeometry }] = await Promise.all([
          import("three/addons/loaders/FontLoader.js"),
          import("three/addons/geometries/TextGeometry.js")
        ]);
        const font = await new FontLoader().loadAsync(
          "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/helvetiker_regular.typeface.json"
        );
        const wall = new THREE.Group();
        wall.position.set(-7.28, 4.2, 6.3);
        wall.rotation.y = Math.PI / 2;
        roomShell.add(wall);

        const ownedMaterials = [];
        const makeMaterial = (options) => {
          const material = new THREE.MeshStandardMaterial(options);
          ownedMaterials.push(material);
          return material;
        };
        const plaqueMaterial = makeMaterial({ color: 0x111522, roughness: 0.48, metalness: 0.38 });
        const tileMaterial = makeMaterial({ color: 0x191e2d, roughness: 0.42, metalness: 0.46 });
        const edgeMaterial = makeMaterial({
          color: 0x788eff,
          roughness: 0.3,
          metalness: 0.62,
          emissive: 0x18244a,
          emissiveIntensity: 0.35
        });
        const silverMaterial = makeMaterial({
          color: 0xe7e8f3,
          roughness: 0.46,
          metalness: 0.18,
          emissive: 0x383c5c,
          emissiveIntensity: 0.48
        });
        const pearlMaterial = makeMaterial({
          color: 0xd1ddff,
          roughness: 0.44,
          metalness: 0.16,
          emissive: 0x3e5085,
          emissiveIntensity: 0.52
        });
        const iconAccentMaterial = makeMaterial({
          color: 0xa9bbff,
          roughness: 0.38,
          metalness: 0.2,
          emissive: 0x303f83,
          emissiveIntensity: 0.58
        });

        const plaque = new THREE.Mesh(new THREE.BoxGeometry(6.08, 3.78, 0.12), plaqueMaterial);
        plaque.position.z = -0.01;
        plaque.castShadow = true;
        plaque.receiveShadow = true;
        wall.add(plaque);

        const frameBars = [
          [[5.86, 0.025, 0.025], [0, 1.81, 0.058]],
          [[5.86, 0.025, 0.025], [0, -1.81, 0.058]],
          [[0.025, 3.62, 0.025], [-2.92, 0, 0.058]],
          [[0.025, 3.62, 0.025], [2.92, 0, 0.058]]
        ];
        frameBars.forEach(([size, position]) => {
          const bar = new THREE.Mesh(new THREE.BoxGeometry(...size), edgeMaterial);
          bar.position.set(...position);
          wall.add(bar);
        });

        function addText(parent, text, y, size, material, z = 0.06) {
          const geometry = new TextGeometry(text, {
            font,
            size,
            depth: 0.022,
            curveSegments: 4,
            bevelEnabled: true,
            bevelThickness: 0.004,
            bevelSize: 0.003,
            bevelSegments: 2
          });
          geometry.computeBoundingBox();
          const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
          geometry.translate(-width / 2, 0, 0);
          const textMesh = new THREE.Mesh(geometry, material);
          textMesh.position.set(0, y, z);
          textMesh.castShadow = true;
          textMesh.receiveShadow = true;
          parent.add(textMesh);
          return textMesh;
        }

        addText(wall, "WHAT I DO", 1.48, 0.15, iconAccentMaterial);
        addText(wall, "DIGITAL SERVICES", 1.16, 0.27, silverMaterial);

        const serviceItems = [
          { lines: ["CUSTOM WEBSITE", "DEVELOPMENT"], icon: "website" },
          { lines: ["WEB APPS", "& SAAS"], icon: "apps" },
          { lines: ["CUSTOM SOFTWARE", "& SYSTEMS"], icon: "software" },
          { lines: ["E-COMMERCE", "DEVELOPMENT"], icon: "commerce" },
          { lines: ["WORDPRESS", "DEVELOPMENT"], icon: "wordpress" },
          { lines: ["UI/UX", "DESIGN"], icon: "design" },
          { lines: ["BUSINESS", "AUTOMATION"], icon: "automation" },
          { lines: ["SEO & WEBSITE", "OPTIMIZATION"], icon: "search" },
          { lines: ["BUSINESS PLANS", "& PROPOSALS"], icon: "planning" }
        ];
        const tileWidth = 1.78;
        const tileHeight = 0.78;
        const tileShape = new THREE.Shape();
        const radius = 0.09;
        tileShape.moveTo(-tileWidth / 2 + radius, -tileHeight / 2);
        tileShape.lineTo(tileWidth / 2 - radius, -tileHeight / 2);
        tileShape.quadraticCurveTo(tileWidth / 2, -tileHeight / 2, tileWidth / 2, -tileHeight / 2 + radius);
        tileShape.lineTo(tileWidth / 2, tileHeight / 2 - radius);
        tileShape.quadraticCurveTo(tileWidth / 2, tileHeight / 2, tileWidth / 2 - radius, tileHeight / 2);
        tileShape.lineTo(-tileWidth / 2 + radius, tileHeight / 2);
        tileShape.quadraticCurveTo(-tileWidth / 2, tileHeight / 2, -tileWidth / 2, tileHeight / 2 - radius);
        tileShape.lineTo(-tileWidth / 2, -tileHeight / 2 + radius);
        tileShape.quadraticCurveTo(-tileWidth / 2, -tileHeight / 2, -tileWidth / 2 + radius, -tileHeight / 2);

        function addIconPart(icon, geometry, material, position, rotation = [0, 0, 0]) {
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(...position);
          mesh.rotation.set(...rotation);
          mesh.castShadow = true;
          icon.add(mesh);
          return mesh;
        }

        function makeServiceIcon(kind, parent) {
          const icon = new THREE.Group();
          icon.position.set(0, 0.11, 0.17);
          icon.scale.setScalar(1.08);
          parent.add(icon);
          const boxIcon = (size, position, material = silverMaterial, rotation) =>
            addIconPart(icon, new THREE.BoxGeometry(...size), material, position, rotation);

          if (kind === "website") {
            boxIcon([0.38, 0.25, 0.045], [0, 0.055, 0], pearlMaterial);
            boxIcon([0.32, 0.19, 0.012], [0, 0.055, 0.027], plaqueMaterial);
            boxIcon([0.46, 0.035, 0.06], [0, -0.105, 0.01], iconAccentMaterial);
            boxIcon([0.05, 0.08, 0.035], [0, -0.06, 0], silverMaterial);
          } else if (kind === "apps") {
            boxIcon([0.3, 0.25, 0.04], [-0.055, 0.04, 0], pearlMaterial);
            boxIcon([0.27, 0.22, 0.045], [0.07, -0.04, 0.04], iconAccentMaterial);
            boxIcon([0.21, 0.13, 0.012], [0.07, -0.04, 0.067], plaqueMaterial);
            [-0.04, 0, 0.04].forEach((x) =>
              addIconPart(icon, new THREE.SphereGeometry(0.014, 8, 6), silverMaterial, [x, 0.118, 0.074])
            );
          } else if (kind === "software") {
            boxIcon([0.17, 0.17, 0.17], [-0.1, 0.01, 0], iconAccentMaterial, [0.25, 0.35, 0.12]);
            boxIcon([0.17, 0.17, 0.17], [0.1, 0.01, 0], pearlMaterial, [-0.2, 0.34, -0.12]);
            boxIcon([0.18, 0.18, 0.18], [0, 0.12, -0.045], silverMaterial, [0.15, -0.2, 0.1]);
          } else if (kind === "commerce") {
            boxIcon([0.32, 0.25, 0.075], [0, -0.015, 0], iconAccentMaterial);
            addIconPart(icon, new THREE.TorusGeometry(0.09, 0.018, 8, 20, Math.PI), silverMaterial, [0, 0.105, 0.015], [0, 0, Math.PI]);
            boxIcon([0.025, 0.11, 0.025], [-0.09, 0.05, 0.045], pearlMaterial);
            boxIcon([0.025, 0.11, 0.025], [0.09, 0.05, 0.045], pearlMaterial);
          } else if (kind === "wordpress") {
            addIconPart(icon, new THREE.CylinderGeometry(0.16, 0.16, 0.055, 32), iconAccentMaterial, [0, 0.015, 0], [Math.PI / 2, 0, 0]);
            addIconPart(icon, new THREE.TorusGeometry(0.155, 0.014, 8, 32), silverMaterial, [0, 0.015, 0.033]);
            const letter = new TextGeometry("W", { font, size: 0.205, depth: 0.025, curveSegments: 4 });
            letter.computeBoundingBox();
            const width = letter.boundingBox.max.x - letter.boundingBox.min.x;
            letter.translate(-width / 2, -0.07, 0);
            addIconPart(icon, letter, pearlMaterial, [0, 0.015, 0.04]);
          } else if (kind === "design") {
            const cursor = new THREE.Shape();
            cursor.moveTo(-0.09, 0.18);
            cursor.lineTo(0.12, 0.02);
            cursor.lineTo(0.025, -0.005);
            cursor.lineTo(0.085, -0.12);
            cursor.lineTo(0.035, -0.145);
            cursor.lineTo(-0.025, -0.03);
            cursor.lineTo(-0.09, -0.105);
            cursor.closePath();
            const cursorGeometry = new THREE.ExtrudeGeometry(cursor, { depth: 0.045, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 });
            addIconPart(icon, cursorGeometry, iconAccentMaterial, [0, 0, 0], [0, 0, -0.1]);
            addIconPart(icon, new THREE.SphereGeometry(0.045, 12, 8), pearlMaterial, [0.15, 0.12, -0.02]);
          } else if (kind === "automation") {
            addIconPart(icon, new THREE.TorusGeometry(0.105, 0.028, 8, 24), iconAccentMaterial, [0, 0.02, 0]);
            addIconPart(icon, new THREE.TorusGeometry(0.036, 0.014, 8, 16), pearlMaterial, [0, 0.02, 0.035]);
            for (let tooth = 0; tooth < 8; tooth += 1) {
              const angle = tooth * Math.PI / 4;
              boxIcon([0.045, 0.045, 0.045], [Math.cos(angle) * 0.13, 0.02 + Math.sin(angle) * 0.13, 0], silverMaterial, [0, 0, angle]);
            }
          } else if (kind === "search") {
            addIconPart(icon, new THREE.TorusGeometry(0.12, 0.026, 8, 24), iconAccentMaterial, [-0.035, 0.055, 0]);
            const handle = boxIcon([0.045, 0.17, 0.045], [0.095, -0.09, 0], silverMaterial);
            handle.rotation.z = -0.7;
            addIconPart(icon, new THREE.SphereGeometry(0.025, 10, 8), pearlMaterial, [-0.035, 0.055, 0.01]);
          } else {
            boxIcon([0.25, 0.32, 0.045], [0, 0.015, 0], pearlMaterial);
            for (let line = 0; line < 3; line += 1) {
              boxIcon([line === 1 ? 0.15 : 0.17, 0.018, 0.018], [-0.005, 0.09 - line * 0.075, 0.032], iconAccentMaterial);
            }
            addIconPart(icon, new THREE.TorusGeometry(0.048, 0.012, 8, 16), silverMaterial, [0.13, -0.105, 0.04]);
          }
          return icon;
        }

        serviceItems.forEach((service, index) => {
          const column = index % 3;
          const row = Math.floor(index / 3);
          const x = (column - 1) * 1.88;
          const y = 0.31 - row * 0.82;
          const tile = new THREE.Group();
          tile.position.set(x, y, 0);
          wall.add(tile);

          const shapeGeometry = new THREE.ExtrudeGeometry(tileShape, {
            depth: 0.045,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.018,
            bevelThickness: 0.012,
            curveSegments: 5
          });
          const tileMesh = new THREE.Mesh(shapeGeometry, tileMaterial);
          tileMesh.position.z = 0.045;
          tileMesh.castShadow = true;
          tileMesh.receiveShadow = true;
          tile.add(tileMesh);

          const topAccent = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.012, 0.018), edgeMaterial);
          topAccent.position.set(0, tileHeight / 2 - 0.035, 0.105);
          tile.add(topAccent);

          makeServiceIcon(service.icon, tile);
          service.lines.forEach((line, lineIndex) => {
            const geometry = new TextGeometry(line, {
              font,
              size: 0.132,
              depth: 0.014,
              curveSegments: 3,
              bevelEnabled: true,
              bevelThickness: 0.002,
              bevelSize: 0.0015,
              bevelSegments: 1
            });
            geometry.computeBoundingBox();
            const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
            geometry.translate(-width / 2, 0, 0);
            const label = new THREE.Mesh(geometry, lineIndex === 0 ? silverMaterial : pearlMaterial);
            label.position.set(0, -0.18 - lineIndex * 0.18, 0.11);
            label.castShadow = true;
            tile.add(label);
          });
        });

        const halo = registerRoomLight(new THREE.PointLight(0x7d91ff, 3.8, 6), 7);
        halo.position.set(0, 0.2, 0.72);
        wall.add(halo);
        serviceInscription = { wall, ownedMaterials };
        requestRender();
      } catch (error) {
        console.warn("Could not load 3D service lettering; using the illustrated wall display instead.", error);
        makeDisplay(roomShell, "services", 5.8, 3.5, [-7.28, 4.2, 6.3], Math.PI / 2);
        requestRender();
      }
    }

    void addServiceInscription();

    const photoTextures = [];
    const photoLoader = new THREE.TextureLoader();
    function addFramedPhoto(source, caption, position, width, height, rotationY = 0) {
      const frame = new THREE.Group();
      frame.position.set(...position);
      frame.rotation.y = rotationY;
      roomShell.add(frame);
      box(frame, [width + 0.24, height + 0.24, 0.2], [0, 0, -0.05], materials.screenFrame, { castShadow: false });
      box(frame, [width + 0.12, height + 0.12, 0.045], [0, 0, 0.052], materials.pictureGold, { castShadow: false });
      box(frame, [width + 0.035, height + 0.035, 0.035], [0, 0, 0.084], materials.trim, { castShadow: false });

      const texture = photoLoader.load(
        source,
        (loadedTexture) => {
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          loadedTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        },
        undefined,
        () => console.warn(`Could not load studio photo: ${source}`)
      );
      photoTextures.push(texture);
      const photograph = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
      );
      photograph.position.z = 0.106;
      frame.add(photograph);

      const captionCanvas = document.createElement("canvas");
      captionCanvas.width = 1024;
      captionCanvas.height = 112;
      const captionContext = captionCanvas.getContext("2d");
      captionContext.fillStyle = "#191725";
      captionContext.fillRect(0, 0, captionCanvas.width, captionCanvas.height);
      captionContext.fillStyle = "#f4e8d5";
      captionContext.font = "500 30px 'DM Mono', monospace";
      captionContext.textAlign = "center";
      captionContext.textBaseline = "middle";
      captionContext.fillText(caption, captionCanvas.width / 2, captionCanvas.height / 2);
      const captionTexture = new THREE.CanvasTexture(captionCanvas);
      captionTexture.colorSpace = THREE.SRGBColorSpace;
      photoTextures.push(captionTexture);
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(width + 0.24, 0.38),
        new THREE.MeshBasicMaterial({ map: captionTexture, toneMapped: false })
      );
      plaque.position.set(0, -height / 2 - 0.3, 0.11);
      frame.add(plaque);

      const portraitLight = registerRoomLight(new THREE.PointLight(0xffd49b, 3.2, 3.2), 5.5);
      portraitLight.position.set(0, 0, 0.72);
      frame.add(portraitLight);
      return frame;
    }

    addFramedPhoto("./assets/images/championjay-portrait.png", "CHAMPIONJAY · DEVELOPER & CREATOR", [-4.62, 3.85, -9.22], 4.85, 6.42);
    addFramedPhoto("./assets/images/studio-dog.png", "STUDIO COMPANION · BUILT WITH CURIOSITY", [7.28, 4.0, 1.5], 3.25, 4.34, -Math.PI / 2);

    const trimGlow = new THREE.MeshBasicMaterial({ color: 0x7388ff });
    roomSurfaceColors.push({
      material: trimGlow,
      dark: trimGlow.color.clone(),
      bright: new THREE.Color(0xe5a9bf)
    });
    box(roomShell, [0.025, 0.035, 18.5], [-7.29, 0.08, 0], trimGlow, { castShadow: false });
    box(roomShell, [0.025, 0.035, 18.5], [7.29, 0.08, 0], trimGlow, { castShadow: false });
    box(roomShell, [14.5, 0.035, 0.025], [0, 0.08, -9.28], trimGlow, { castShadow: false });
    box(roomShell, [14.5, 0.035, 0.025], [0, 0.08, 9.28], trimGlow, { castShadow: false });

    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 6.1),
      new THREE.MeshStandardMaterial({ color: 0x191b28, roughness: 0.97, metalness: 0 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, -0.005, 0.8);
    rug.receiveShadow = true;
    roomShell.add(rug);
    const rugBorder = new THREE.Mesh(
      new THREE.PlaneGeometry(7.75, 5.85),
      new THREE.MeshBasicMaterial({ color: 0x313650, wireframe: true, transparent: true, opacity: 0.23 })
    );
    rugBorder.rotation.x = -Math.PI / 2;
    rugBorder.position.set(0, 0.002, 0.8);
    roomShell.add(rugBorder);

    function addFlowerArrangement(position, scale = 1) {
      const arrangement = new THREE.Group();
      arrangement.position.set(...position);
      arrangement.scale.setScalar(scale);
      roomShell.add(arrangement);

      const vaseProfile = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.24, 0),
        new THREE.Vector2(0.31, 0.1),
        new THREE.Vector2(0.34, 0.42),
        new THREE.Vector2(0.25, 0.59),
        new THREE.Vector2(0.15, 0.66),
        new THREE.Vector2(0.14, 0.76)
      ];
      const vase = new THREE.Mesh(new THREE.LatheGeometry(vaseProfile, 24), materials.ceramic);
      vase.position.y = 0.04;
      vase.castShadow = true;
      vase.receiveShadow = true;
      arrangement.add(vase);

      for (let index = 0; index < 5; index += 1) {
        const angle = (index / 5) * Math.PI * 2 + 0.3;
        const sway = Math.sin(index * 2.3) * 0.14;
        const stemHeight = 1.22 + (index % 3) * 0.16;
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.014, 0.021, stemHeight, 7),
          materials.foliage
        );
        stem.position.set(Math.cos(angle) * 0.11 + sway * 0.35, 0.72 + stemHeight / 2, Math.sin(angle) * 0.11);
        stem.rotation.z = sway * 0.45;
        arrangement.add(stem);

        for (let leafIndex = 0; leafIndex < 2; leafIndex += 1) {
          const direction = leafIndex === 0 ? -1 : 1;
          const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(1, 10, 8),
            leafIndex === 0 ? materials.foliage : materials.foliageLight
          );
          leaf.position.set(
            stem.position.x + direction * 0.13,
            1.0 + stemHeight * (leafIndex === 0 ? 0.31 : 0.58),
            stem.position.z
          );
          leaf.scale.set(0.11, 0.24, 0.045);
          leaf.rotation.z = direction * -0.72;
          arrangement.add(leaf);
        }

        const flowerCenter = new THREE.Vector3(
          stem.position.x + sway * 0.45,
          0.72 + stemHeight,
          stem.position.z
        );
        const petals = index % 2 === 0 ? materials.flower : materials.flowerWarm;
        for (let petalIndex = 0; petalIndex < 5; petalIndex += 1) {
          const petalAngle = (petalIndex / 5) * Math.PI * 2;
          const petal = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), petals);
          petal.position.set(
            flowerCenter.x + Math.cos(petalAngle) * 0.09,
            flowerCenter.y + Math.sin(petalAngle) * 0.09,
            flowerCenter.z
          );
          petal.scale.set(0.72, 1.12, 0.65);
          arrangement.add(petal);
        }
        const center = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 8), materials.flowerWarm);
        center.position.copy(flowerCenter);
        arrangement.add(center);
      }
      return arrangement;
    }

    function addSideTable(position) {
      const table = new THREE.Group();
      table.position.set(...position);
      roomShell.add(table);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.1, 28), materials.darkMetal);
      base.position.y = 0.08;
      table.add(base);
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.88, 18), materials.pictureGold);
      pedestal.position.y = 0.57;
      table.add(pedestal);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.52, 0.13, 32), materials.wood);
      top.position.y = 1.04;
      top.castShadow = true;
      top.receiveShadow = true;
      table.add(top);
      const inlay = new THREE.Mesh(new THREE.CylinderGeometry(0.49, 0.49, 0.018, 32), materials.pictureGold);
      inlay.position.y = 1.116;
      table.add(inlay);
      const book = box(table, [0.43, 0.075, 0.31], [-0.08, 1.17, 0.02], materials.screenFrame, { castShadow: false });
      book.rotation.y = -0.18;
      return table;
    }

    addFlowerArrangement([-6.25, 0, 8], 0.82);
    addFlowerArrangement([6.25, 0, 8], 0.82);
    addSideTable([5.35, 0, 4]);
    addFlowerArrangement([5.35, 1.18, 4], 0.55);

    const desk = new THREE.Group();
    desk.position.set(1, 0, -0.22);
    scene.add(desk);
    box(desk, [6.35, 0.18, 1.72], [0, 1.75, 0], materials.wood);
    box(desk, [6.12, 0.035, 1.52], [0, 1.858, 0], materials.darkMetal);
    box(desk, [0.12, 1.68, 0.13], [-2.25, 0.84, -0.15], materials.darkMetal);
    box(desk, [0.12, 1.68, 0.13], [2.25, 0.84, -0.15], materials.darkMetal);
    box(desk, [0.12, 1.68, 0.13], [-2.25, 0.84, 0.55], materials.darkMetal);
    box(desk, [0.12, 1.68, 0.13], [2.25, 0.84, 0.55], materials.darkMetal);
    box(desk, [4.25, 0.045, 0.06], [0, 0.78, -0.15], materials.trim);

    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(1.5, 1.8, 0.42);
    monitorGroup.scale.setScalar(0.32);
    desk.add(monitorGroup);
    box(monitorGroup, [3.2, 1.88, 0.16], [0, 1.21, 0], materials.darkMetal);
    const monitorTexture = makeWallTexture(
      "hello",
      "DESIGN.\nBUILD.\nMAKE IT MATTER.",
      "A SMALL SCREEN. A BIG IDEA.",
      ["Thoughtful digital products,", "made to move your business forward."],
      "#a9bbff"
    );
    const monitorScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(3.02, 1.7),
      new THREE.MeshBasicMaterial({ map: monitorTexture, toneMapped: false })
    );
    monitorScreen.position.set(0, 1.21, 0.086);
    monitorGroup.add(monitorScreen);
    box(monitorGroup, [0.13, 0.54, 0.12], [0, 0.12, -0.03], materials.darkMetal);
    box(monitorGroup, [0.95, 0.08, 0.48], [0, -0.15, 0.03], materials.trim);
    const keyboard = box(desk, [1.9, 0.065, 0.53], [0, 1.94, 0.47], materials.darkMetal);
    keyboard.rotation.x = -0.04;
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 13; column += 1) {
        box(desk, [0.09, 0.012, 0.065], [-0.81 + column * 0.135, 1.98, 0.28 + row * 0.12], trimGlow, { castShadow: false, receiveShadow: false });
      }
    }
    const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 10), materials.darkMetal);
    mouse.scale.set(0.78, 0.48, 1.24);
    mouse.position.set(1.38, 1.96, 0.5);
    mouse.castShadow = true;
    desk.add(mouse);
    const deskLamp = new THREE.Group();
    deskLamp.position.set(-3.2, 1.9, 0.38);
    deskLamp.scale.setScalar(0.7);
    desk.add(deskLamp);
    box(deskLamp, [0.3, 0.08, 0.3], [0, 0, 0], materials.darkMetal);
    const lampStem = box(deskLamp, [0.045, 0.77, 0.045], [0, 0.38, 0], materials.trim);
    lampStem.rotation.z = -0.14;
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.37, 0.47, 20, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x30374c, roughness: 0.43, metalness: 0.48, side: THREE.DoubleSide })
    );
    shade.position.set(-0.02, 0.81, -0.12);
    shade.rotation.z = Math.PI;
    deskLamp.add(shade);
    const lampLight = new THREE.PointLight(0xbac7ff, 16, 5);
    registerRoomLight(lampLight, 28);
    lampLight.position.set(-0.02, 0.62, -0.12);
    deskLamp.add(lampLight);

    const chair = new THREE.Group();
    chair.position.set(0.7, 0, 1.84);
    scene.add(chair);
    const chairBase = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.41, 0.09, 24), materials.darkMetal);
    chairBase.position.y = 0.21;
    chairBase.castShadow = true;
    chair.add(chairBase);
    const chairPost = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.75, 16), materials.trim);
    chairPost.position.y = 0.59;
    chair.add(chairPost);
    const chairSeat = box(chair, [0.96, 0.24, 0.9], [0, 0.97, 0], materials.upholstery);
    chairSeat.material = materials.upholstery;
    box(chair, [0.96, 0.78, 0.2], [0, 1.45, 0.38], materials.upholstery);
    const chairMessageCanvas = document.createElement("canvas");
    chairMessageCanvas.width = 768;
    chairMessageCanvas.height = 320;
    const chairMessageContext = chairMessageCanvas.getContext("2d");
    chairMessageContext.textAlign = "center";
    chairMessageContext.textBaseline = "middle";
    chairMessageContext.fillStyle = "#b5ecc9";
    chairMessageContext.fillRect(184, 49, 400, 4);
    chairMessageContext.fillStyle = "#f4f1f3";
    chairMessageContext.font = "700 68px 'Manrope', 'Segoe UI', sans-serif";
    chairMessageContext.fillText("OPEN TO WORK", 384, 139);
    chairMessageContext.fillStyle = "#b3c2ff";
    chairMessageContext.font = "700 66px 'Manrope', 'Segoe UI', sans-serif";
    chairMessageContext.fillText("WITH YOU", 384, 224);
    const chairMessageTexture = new THREE.CanvasTexture(chairMessageCanvas);
    chairMessageTexture.colorSpace = THREE.SRGBColorSpace;
    chairMessageTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    photoTextures.push(chairMessageTexture);
    const chairMessage = new THREE.Mesh(
      new THREE.PlaneGeometry(0.82, 0.34),
      new THREE.MeshBasicMaterial({ map: chairMessageTexture, transparent: true, toneMapped: false, depthWrite: false })
    );
    chairMessage.position.set(0, 1.48, 0.486);
    chairMessage.renderOrder = 2;
    chair.add(chairMessage);
    box(chair, [0.12, 0.58, 0.11], [-0.4, 1.25, 0], materials.trim);
    box(chair, [0.12, 0.58, 0.11], [0.4, 1.25, 0], materials.trim);
    const chairFeet = new THREE.Group();
    chair.add(chairFeet);
    for (let index = 0; index < 5; index += 1) {
      const angle = (index / 5) * Math.PI * 2;
      const leg = box(chairFeet, [0.57, 0.065, 0.09], [Math.cos(angle) * 0.31, 0.16, Math.sin(angle) * 0.31], materials.darkMetal);
      leg.rotation.y = angle;
      const caster = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), materials.darkMetal);
      caster.position.set(Math.cos(angle) * 0.58, 0.1, Math.sin(angle) * 0.58);
      chairFeet.add(caster);
    }

    function makeSegment(parent, radius, material) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.82, radius, 1, 12), material);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    }

    function setSegment(mesh, start, end) {
      const from = new THREE.Vector3(...start);
      const to = new THREE.Vector3(...end);
      const direction = new THREE.Vector3().subVectors(to, from);
      mesh.position.copy(from).add(to).multiplyScalar(0.5);
      mesh.scale.set(1, direction.length(), 1);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    }

    const person = new THREE.Group();
    person.position.set(3.5, 0, 9.9);
    scene.add(person);
    const body = new THREE.Group();
    person.add(body);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.68, 5, 12), materials.jacket);
    torso.position.set(0, 1.34, 0);
    torso.castShadow = true;
    body.add(torso);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 18), materials.trim);
    collar.position.set(0, 1.74, 0);
    body.add(collar);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 12), materials.skin);
    neck.position.set(0, 1.82, 0);
    body.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 16), materials.skin);
    head.position.set(0, 2.05, 0);
    head.scale.set(0.86, 1.05, 0.9);
    head.castShadow = true;
    body.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.252, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.56), materials.hair);
    hair.position.set(0, 2.11, -0.012);
    hair.scale.set(0.9, 1.05, 0.94);
    body.add(hair);
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), materials.skin);
      ear.position.set(side * 0.224, 2.01, -0.005);
      ear.scale.set(0.62, 1.18, 0.58);
      body.add(ear);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.039, 12, 10), materials.eyes);
      eye.position.set(side * 0.082, 2.085, -0.207);
      eye.scale.set(1, 0.72, 0.52);
      body.add(eye);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 8), materials.iris);
      iris.position.set(side * 0.082, 2.083, -0.229);
      body.add(iris);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), materials.pupil);
      pupil.position.set(side * 0.082, 2.083, -0.244);
      body.add(pupil);

      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.066, 3, 6), materials.beard);
      brow.position.set(side * 0.082, 2.143, -0.214);
      brow.rotation.z = side * -0.12;
      body.add(brow);
    }
    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), materials.beard);
    beard.position.set(0, 1.88, -0.154);
    beard.scale.set(0.94, 0.38, 0.44);
    body.add(beard);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), materials.skin);
    nose.position.set(0, 2.01, -0.233);
    nose.scale.set(0.72, 1.18, 0.78);
    body.add(nose);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.084, 0.014, 0.018), materials.lips);
    mouth.position.set(0, 1.934, -0.221);
    body.add(mouth);
    for (let curlIndex = 0; curlIndex < 5; curlIndex += 1) {
      const curl = new THREE.Mesh(new THREE.SphereGeometry(0.064, 10, 8), materials.hair);
      curl.position.set((curlIndex - 2) * 0.084, 2.25 + (curlIndex % 2) * 0.018, -0.075);
      curl.scale.set(1, 0.78, 0.78);
      body.add(curl);
    }
    const shoulderAccent = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.045, 0.37), materials.trim);
    shoulderAccent.position.set(0, 1.58, 0.015);
    body.add(shoulderAccent);
    const upperArms = [-1, 1].map(() => makeSegment(body, 0.115, materials.jacket));
    const lowerArms = [-1, 1].map(() => makeSegment(body, 0.085, materials.skin));
    const hands = [-1, 1].map(() => {
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 10), materials.skin);
      body.add(hand);
      return hand;
    });
    const thighs = [-1, 1].map(() => makeSegment(person, 0.15, materials.trousers));
    const calves = [-1, 1].map(() => makeSegment(person, 0.115, materials.trousers));
    const shoes = [-1, 1].map(() => {
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.13, 0.39), materials.shoe);
      shoe.castShadow = true;
      person.add(shoe);
      return shoe;
    });

    function posePerson(progress, seated, sitAmount = seated ? 1 : 0) {
      const walkPhase = progress * Math.PI * 7;
      const walk = Math.sin(walkPhase) * (1 - smoothstep(0.55, 0.72, progress)) * (1 - sitAmount);
      const bob = Math.abs(Math.sin(walkPhase)) * 0.045 * (1 - sitAmount);
      body.position.y = bob - 0.07 * sitAmount;
      body.rotation.x = -0.06 * sitAmount;
      body.rotation.y = 0;

      for (let side = 0; side < 2; side += 1) {
        const sign = side === 0 ? -1 : 1;
        const hipX = sign * 0.17;
        const shoulder = [sign * 0.29, 1.55, 0];
        const walkingElbow = [sign * 0.43, 1.12 + walk * sign * 0.09, walk * sign * 0.13];
        const sittingElbow = [sign * 0.42, 1.5, -0.82];
        const elbow = walkingElbow.map((value, index) => THREE.MathUtils.lerp(value, sittingElbow[index], sitAmount));
        const walkingWrist = [sign * 0.48, 0.82 - walk * sign * 0.08, walk * -sign * 0.17];
        const sittingWrist = [sign * 0.46, 1.86, -1.48];
        const wrist = walkingWrist.map((value, index) => THREE.MathUtils.lerp(value, sittingWrist[index], sitAmount));
        setSegment(upperArms[side], shoulder, elbow);
        setSegment(lowerArms[side], elbow, wrist);
        hands[side].position.set(...wrist);

        const hip = [hipX, 0.95, 0];
        const walkingKnee = [hipX, 0.48, walk * sign * -0.32];
        const sittingKnee = [hipX, 0.88, -0.53];
        const knee = walkingKnee.map((value, index) => THREE.MathUtils.lerp(value, sittingKnee[index], sitAmount));
        const walkingAnkle = [hipX, 0.12 + Math.max(0, walk * sign) * 0.25, walk * sign * 0.38];
        const sittingAnkle = [hipX, 0.34, -0.4];
        const ankle = walkingAnkle.map((value, index) => THREE.MathUtils.lerp(value, sittingAnkle[index], sitAmount));
        setSegment(thighs[side], hip, knee);
        setSegment(calves[side], knee, ankle);
        shoes[side].position.set(hipX, ankle[1] - 0.02, ankle[2] - 0.105);
      }
    }

    function smoothstep(edge0, edge1, value) {
      const amount = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
      return amount * amount * (3 - 2 * amount);
    }

    function setWall(name, announce = true) {
      const angle = wallAngles[name];
      if (angle === undefined) return;
      const difference = THREE.MathUtils.euclideanModulo(angle - targetYaw + Math.PI, Math.PI * 2) - Math.PI;
      targetYaw += difference;
      if (isMobile) selectedCameraPosition.copy(mobileCameraPositions[name]);
      wallButtons.forEach((button) => {
        const selected = button.dataset.roomWall === name;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      if (announce && announcement) {
        const button = wallButtons.find((item) => item.dataset.roomWall === name);
        announcement.textContent = `Looking toward the ${button?.textContent.trim() || name} wall.`;
      }
      requestRender();
    }
    wallButtons.forEach((button) => {
      button.addEventListener("click", () => setWall(button.dataset.roomWall));
    });
    function setZoom(value) {
      targetZoom = THREE.MathUtils.clamp(value, minZoom, maxZoom);
      if (zoomLevel) zoomLevel.value = `${Math.round(targetZoom * 100)}%`;
      const zoomInButton = zoomControls?.querySelector('[data-zoom="in"]');
      const zoomOutButton = zoomControls?.querySelector('[data-zoom="out"]');
      const resetButton = zoomControls?.querySelector('[data-zoom="reset"]');
      if (zoomInButton) zoomInButton.disabled = targetZoom >= maxZoom;
      if (zoomOutButton) zoomOutButton.disabled = targetZoom <= minZoom;
      if (resetButton) resetButton.disabled = targetZoom === minZoom;
      requestRender();
    }
    zoomControls?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-zoom]");
      if (!button) return;
      if (button.dataset.zoom === "in") setZoom(targetZoom + 0.2);
      else if (button.dataset.zoom === "out") setZoom(targetZoom - 0.2);
      else setZoom(1);
    });
    changeRoomLighting = () => {
      lightsOn = !lightsOn;
      targetLightBlend = lightsOn ? 1 : 0;
      studioWallCopy.draw(lightsOn);
      room.classList.toggle("is-light-on", lightsOn);
      document.body.classList.toggle("studio-lights-on", lightsOn);
      updateLightControl(lightsOn);
      if (announcement) announcement.textContent = `Studio lights turned ${lightsOn ? "on" : "off"}.`;
      requestRender();
    };
    document.querySelector(".room-replay")?.addEventListener("click", () => {
      if (reducedMotion.matches) {
        camera.position.copy(cameraSeat);
        if (isMobile) selectedCameraPosition.copy(mobileCameraPositions.studio);
        person.position.set(0.7, 0, 1.84);
        posePerson(1, true);
        studioStoryStart = null;
        studioStoryProgress = 1;
        studioWallCopy.draw(lightsOn, studioStoryProgress);
        requestRender();
        return;
      }
      arrivalStart = clock.elapsedTime;
      arrivalPlayed = true;
      studioStoryStart = null;
      studioStoryProgress = 0;
      studioWallCopy.draw(lightsOn, studioStoryProgress);
      room.classList.remove("is-seated");
      person.position.set(3.5, 0, 9.9);
      camera.position.copy(cameraStart);
      selectedCameraPosition.copy(cameraSeat);
      setWall("studio", false);
      person.rotation.y = 0;
      posePerson(0, false);
      requestRender();
    });

    function nearestWall(yaw) {
      let nearest = "studio";
      let smallestDifference = Infinity;
      Object.entries(wallAngles).forEach(([name, angle]) => {
        const difference = Math.abs(THREE.MathUtils.euclideanModulo(yaw - angle + Math.PI, Math.PI * 2) - Math.PI);
        if (difference < smallestDifference) {
          nearest = name;
          smallestDifference = difference;
        }
      });
      return nearest;
    }

    let previousWall = "studio";
    function updateWallControl() {
      const nextWall = nearestWall(targetYaw);
      if (nextWall === previousWall) return;
      previousWall = nextWall;
      if (isMobile) selectedCameraPosition.copy(mobileCameraPositions[nextWall]);
      wallButtons.forEach((button) => {
        const selected = button.dataset.roomWall === nextWall;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    }

    room.addEventListener("pointermove", (event) => {
      if (event.target !== canvas) return;
      if (event.pointerType === "touch") return;
      if (isDragging) {
        targetYaw -= (event.clientX - lastPointerX) * 0.008;
        lastPointerX = event.clientX;
      } else {
        targetYaw = ((event.clientX / window.innerWidth) - 0.5) * Math.PI * 2;
      }
      requestRender();
    }, { passive: true });

    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      setZoom(targetZoom * Math.exp(-event.deltaY * 0.001));
    }, { passive: false });

    room.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".room-bottom, .site-header") || event.pointerType === "touch") return;
      isDragging = true;
      lastPointerX = event.clientX;
      room.classList.add("is-turning");
    });
    window.addEventListener("pointerup", () => {
      isDragging = false;
      room.classList.remove("is-turning");
    });
    room.addEventListener("pointerleave", () => {
      isDragging = false;
      room.classList.remove("is-turning");
    });

    room.addEventListener("touchstart", (event) => {
      if (event.target.closest(".room-bottom")) return;
      if (event.touches.length > 1) {
        touchDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY
        );
      } else {
        touchDistance = 0;
        lastPointerX = event.touches[0].clientX;
      }
    }, { passive: true });
    room.addEventListener("touchmove", (event) => {
      if (!event.touches.length || event.target.closest(".room-bottom")) return;
      if (event.touches.length > 1) {
        const nextDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY
        );
        if (touchDistance > 0) setZoom(targetZoom * (nextDistance / touchDistance));
        touchDistance = nextDistance;
        return;
      }
      const nextX = event.touches[0].clientX;
      targetYaw -= (nextX - lastPointerX) * 0.009;
      lastPointerX = nextX;
      requestRender();
    }, { passive: true });
    room.addEventListener("touchend", (event) => {
      if (event.touches.length < 2) touchDistance = 0;
      if (event.touches.length === 1) lastPointerX = event.touches[0].clientX;
    }, { passive: true });

    document.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (!active || event.target.matches("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        targetYaw += Math.PI / 2;
        requestRender();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        targetYaw -= Math.PI / 2;
        requestRender();
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom(targetZoom + 0.2);
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        setZoom(targetZoom - 0.2);
      } else if (event.key === "0") {
        setZoom(1);
      }
    });

    function resize() {
      const bounds = room.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      renderer.setSize(bounds.width, bounds.height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
      camera.aspect = bounds.width / bounds.height;
      camera.fov = baseFov / targetZoom;
      camera.updateProjectionMatrix();
      requestRender();
    }

    function renderFrame() {
      frame = 0;
      if (!active || document.hidden) return;
      const elapsed = clock.getElapsedTime();
      if (arrivalStart === null && !arrivalPlayed && !reducedMotion.matches) {
        arrivalStart = elapsed;
        arrivalPlayed = true;
      }
      if (arrivalStart !== null && !reducedMotion.matches) {
        const arrival = THREE.MathUtils.clamp((elapsed - arrivalStart) / 5.2, 0, 1);
        const walk = smoothstep(0, 0.76, arrival);
        const sit = smoothstep(0.78, 1, arrival);
        camera.position.lerpVectors(cameraStart, cameraSeat, smoothstep(0, 0.78, arrival));
        person.position.x = THREE.MathUtils.lerp(3.5, 0.7, walk);
        person.position.z = THREE.MathUtils.lerp(9.9, 1.84, walk);
        person.rotation.y = 0;
        posePerson(walk, false, sit);
        person.position.y = -0.02 * sit;
        if (arrival >= 1) {
          arrivalStart = null;
          person.position.set(0.7, 0, 1.84);
          person.rotation.y = 0;
          posePerson(1, true);
          if (isMobile) selectedCameraPosition.copy(mobileCameraPositions[nearestWall(targetYaw)]);
          room.classList.add("is-seated");
          studioStoryProgress = 0;
          studioStoryStart = elapsed;
          studioStoryLastDraw = -Infinity;
          studioWallCopy.draw(lightsOn, studioStoryProgress);
          announcement.textContent = "You are seated in the studio. Move your pointer horizontally to look around, or choose a wall.";
        }
      }
      if (studioStoryStart !== null) {
        studioStoryProgress = THREE.MathUtils.clamp((elapsed - studioStoryStart) / 4.8, 0, 1);
        if (elapsed - studioStoryLastDraw >= 1 / 30 || studioStoryProgress === 1) {
          studioWallCopy.draw(lightsOn, studioStoryProgress);
          studioStoryLastDraw = elapsed;
        }
        if (studioStoryProgress === 1) studioStoryStart = null;
      }
      if (reducedMotion.matches && !arrivalPlayed) {
        camera.position.copy(cameraSeat);
        if (isMobile) selectedCameraPosition.copy(mobileCameraPositions[nearestWall(targetYaw)]);
        person.position.set(0.7, 0, 1.84);
        person.rotation.y = 0;
        posePerson(1, true);
        arrivalPlayed = true;
      }

      if (isMobile) {
        targetLook.lerp(mobileWallLookTargets[nearestWall(currentYaw)], 0.12);
      } else {
        const targetX = cameraSeat.x + Math.sin(currentYaw) * 11;
        const targetZ = cameraSeat.z - Math.cos(currentYaw) * 11;
        const wall = nearestWall(currentYaw);
        targetLook.set(targetX, targetLook.y, targetZ);
        targetLook.y += (desktopWallLookHeights[wall] - targetLook.y) * 0.12;
      }
      const arrivalInProgress = arrivalStart !== null;
      if (!arrivalInProgress && isMobile) camera.position.lerp(selectedCameraPosition, 0.055);
      const lightingEase = reducedMotion.matches ? 1 : 0.055;
      lightBlend += (targetLightBlend - lightBlend) * lightingEase;
      roomLighting.forEach(({ light, darkIntensity, brightIntensity }) => {
        light.intensity = THREE.MathUtils.lerp(darkIntensity, brightIntensity, lightBlend);
      });
      roomSurfaceColors.forEach(({ material, dark, bright }) => {
        material.color.copy(dark).lerp(bright, lightBlend);
      });
      scene.background.copy(darkRoomColor).lerp(brightRoomColor, lightBlend);
      scene.fog.color.copy(darkRoomColor).lerp(brightRoomColor, lightBlend);
      const targetFov = baseFov / targetZoom;
      if (Math.abs(camera.fov - targetFov) > 0.01) {
        camera.fov = reducedMotion.matches ? targetFov : THREE.MathUtils.lerp(camera.fov, targetFov, 0.16);
        camera.updateProjectionMatrix();
      }
      camera.lookAt(targetLook);
      const angleDifference = THREE.MathUtils.euclideanModulo(targetYaw - currentYaw + Math.PI, Math.PI * 2) - Math.PI;
      if (reducedMotion.matches) currentYaw = targetYaw;
      else currentYaw += angleDifference * 0.055;
      updateWallControl();
      renderer.render(scene, camera);

      const lookingInProgress = Math.abs(angleDifference) > 0.002;
      const cameraMoving = camera.position.distanceToSquared(selectedCameraPosition) > 0.002;
      const wallLookHeight = desktopWallLookHeights[nearestWall(currentYaw)];
      const lookHeightMoving = !isMobile && Math.abs(targetLook.y - wallLookHeight) > 0.01;
      const lightingInProgress = Math.abs(targetLightBlend - lightBlend) > 0.005;
      const zoomMoving = Math.abs(camera.fov - targetFov) > 0.01;
      if (arrivalInProgress || studioStoryStart !== null || lookingInProgress || cameraMoving || lookHeightMoving || lightingInProgress || zoomMoving) frame = requestAnimationFrame(renderFrame);
    }

    function requestRender() {
      if (!frame && active && !document.hidden) frame = requestAnimationFrame(renderFrame);
    }

    if (reducedMotion.matches) {
      camera.position.copy(cameraSeat);
      if (isMobile) selectedCameraPosition.copy(mobileCameraPositions.studio);
      person.position.set(0.7, 0, 1.84);
      person.rotation.y = 0;
      posePerson(1, true);
      arrivalPlayed = true;
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(room);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) requestRender();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { threshold: 0.01 });
    visibilityObserver.observe(room);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        requestRender();
      }
    });
    reducedMotion.addEventListener("change", () => {
      if (reducedMotion.matches) {
        arrivalStart = null;
        camera.position.copy(cameraSeat);
        person.position.set(0.7, 0, 1.84);
        person.rotation.y = Math.PI;
        posePerson(1, true);
        studioStoryStart = null;
        studioStoryProgress = 1;
        studioWallCopy.draw(lightsOn, studioStoryProgress);
      } else if (!arrivalPlayed) {
        arrivalStart = clock.getElapsedTime();
      }
      requestRender();
    });
    window.addEventListener("beforeunload", () => {
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      renderer.dispose();
      Object.values(wallTextures).forEach((texture) => texture.dispose());
      studioWallCopy.texture.dispose();
      if (serviceInscription) {
        serviceInscription.wall.traverse((object) => {
          if (object.isMesh) object.geometry.dispose();
        });
        serviceInscription.ownedMaterials.forEach((material) => material.dispose());
      }
      monitorTexture.dispose();
      photoTextures.forEach((texture) => texture.dispose());
    }, { once: true });

    resize();
    requestRender();
    fallback?.remove();
  } catch (error) {
    console.warn("The 3D portfolio room could not be initialized. Showing the lightweight room fallback instead.", error);
    canvas.hidden = true;
    fallback?.classList.add("is-visible");
    changeRoomLighting = () => {
      const isOn = room.classList.toggle("is-light-on");
      document.body.classList.toggle("studio-lights-on", isOn);
      updateLightControl(isOn);
      if (announcement) announcement.textContent = `Studio lights turned ${isOn ? "on" : "off"}.`;
    };
    const destinations = { studio: "#work", about: "#about", services: "#services", contact: "#contact" };
    document.querySelectorAll("[data-room-wall]").forEach((button) => {
      button.addEventListener("click", () => {
        const destination = document.querySelector(destinations[button.dataset.roomWall]);
        destination?.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
      });
    });
  }
}
