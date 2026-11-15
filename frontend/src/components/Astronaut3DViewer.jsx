import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Layers,
  Sparkles,
  Heart,
  Wind,
  Shield,
  Compass,
  Play,
  Pause,
  HelpCircle,
  Volume2,
} from 'lucide-react';

export default function Astronaut3DViewer({
  currentSample = {},
  selectedOrganId = 'heart',
  onSelectOrgan,
  viewMode = 'xray', // 'suit', 'xray', 'organs'
  onChangeViewMode,
  isScanning = false,
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const astronautGroupRef = useRef(null);
  const organsRef = useRef({});
  const markersRef = useRef([]);
  const requestRef = useRef(null);

  const [isRotating, setIsRotating] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Frecuencias para animaciones en tiempo real
  const heartRate = currentSample.heart_rate || 75;
  const respiratoryRate = currentSample.respiratory_rate || 15;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. ESCENA
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. CÁMARA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.2);
    cameraRef.current = camera;

    // 3. RENDERIZADOR
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. ILUMINACIÓN ESPACIAL REALISTA
    const ambientLight = new THREE.AmbientLight(0x0e1c36, 1.8);
    scene.add(ambientLight);

    // Luz principal (Sol en órbita / Key Light blanco cálido)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(4, 5, 4);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Luz de contorno azul cian espacial (Rim Light / Tierra azulada)
    const earthRimLight = new THREE.DirectionalLight(0x22d3ee, 2.0);
    earthRimLight.position.set(-4, -2, -3);
    scene.add(earthRimLight);

    // Luz cenital suave de cabina
    const cabinFill = new THREE.PointLight(0x38bdf8, 1.2, 10);
    cabinFill.position.set(0, 2, 2);
    scene.add(cabinFill);

    // 5. GRUPO PRINCIPAL DEL ASTRONAUTA
    const astronautGroup = new THREE.Group();
    scene.add(astronautGroup);
    astronautGroupRef.current = astronautGroup;

    // ==========================================
    // MATERIALES FOTORREALISTAS DE ESCAFANDRA (EMU)
    // ==========================================
    // Traje blanco multicapa térmico
    const suitMaterial = new THREE.MeshStandardMaterial({
      color: 0xedf2f7,
      roughness: 0.55,
      metalness: 0.1,
      transparent: viewMode !== 'suit',
      opacity: viewMode === 'suit' ? 1.0 : viewMode === 'xray' ? 0.22 : 0.05,
      depthWrite: viewMode === 'suit',
    });

    // Visor dorado reflectante (protección solar de 24 quilates)
    const visorMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.12,
      transparent: viewMode === 'organs',
      opacity: viewMode === 'organs' ? 0.1 : 0.88,
    });

    // Mochila PLSS y partes metálicas
    const plssMaterial = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.4,
      roughness: 0.35,
      transparent: viewMode !== 'suit',
      opacity: viewMode === 'suit' ? 1.0 : 0.15,
    });

    // Anillos y sellos de presurización anodizados en cian
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.8,
      roughness: 0.2,
      transparent: viewMode !== 'suit',
      opacity: viewMode === 'suit' ? 1.0 : 0.25,
    });

    // Guantes y botas con banda de agarre gris oscuro
    const gripMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.1,
      transparent: viewMode !== 'suit',
      opacity: viewMode === 'suit' ? 1.0 : 0.15,
    });

    // Guardar referencias de materiales para cambiar modo dinámicamente
    astronautGroup.userData = { suitMaterial, visorMaterial, plssMaterial, ringMaterial, gripMaterial };

    // ==========================================
    // CONSTRUCCIÓN GEOMÉTRICA DE LA ESCAFANDRA
    // ==========================================
    // Casco
    const helmetGeo = new THREE.SphereGeometry(0.34, 32, 28);
    const helmet = new THREE.Mesh(helmetGeo, suitMaterial);
    helmet.position.set(0, 1.35, 0);
    astronautGroup.add(helmet);

    // Visor esférico curvo frontal
    const visorGeo = new THREE.SphereGeometry(0.29, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const visor = new THREE.Mesh(visorGeo, visorMaterial);
    visor.position.set(0, 1.35, 0.08);
    visor.rotation.x = Math.PI * 0.45;
    astronautGroup.add(visor);

    // Luces auxiliares laterales del casco
    const lightGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.08, 16);
    const lightMeshL = new THREE.Mesh(lightGeo, ringMaterial);
    lightMeshL.rotation.z = Math.PI / 2;
    lightMeshL.position.set(-0.35, 1.38, 0.05);
    astronautGroup.add(lightMeshL);

    const lightMeshR = lightMeshL.clone();
    lightMeshR.position.x = 0.35;
    astronautGroup.add(lightMeshR);

    // Anillo del cuello
    const neckRingGeo = new THREE.TorusGeometry(0.28, 0.04, 16, 32);
    const neckRing = new THREE.Mesh(neckRingGeo, ringMaterial);
    neckRing.rotation.x = Math.PI / 2;
    neckRing.position.set(0, 1.12, 0);
    astronautGroup.add(neckRing);

    // Torso (HUT - Hard Upper Torso)
    const torsoGeo = new THREE.CylinderGeometry(0.42, 0.36, 0.88, 24);
    const torso = new THREE.Mesh(torsoGeo, suitMaterial);
    torso.position.set(0, 0.65, 0);
    astronautGroup.add(torso);

    // Módulo DCM (Pantalla y controles en el pecho del astronauta)
    const dcmGeo = new THREE.BoxGeometry(0.32, 0.28, 0.12);
    const dcmMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.5 });
    const dcm = new THREE.Mesh(dcmGeo, dcmMat);
    dcm.position.set(0, 0.72, 0.38);
    astronautGroup.add(dcm);

    // Mini pantalla DCM con luz cian emitida
    const screenGeo = new THREE.PlaneGeometry(0.24, 0.14);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.76, 0.445);
    astronautGroup.add(screenMesh);

    // Mochila de Soporte Vital (PLSS Backpack en la espalda)
    const plssGeo = new THREE.BoxGeometry(0.64, 0.95, 0.32);
    const plss = new THREE.Mesh(plssGeo, plssMaterial);
    plss.position.set(0, 0.68, -0.42);
    astronautGroup.add(plss);

    // Tanques de oxígeno gemelos en la mochila
    const tankGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.82, 18);
    const tankL = new THREE.Mesh(tankGeo, ringMaterial);
    tankL.position.set(-0.2, 0.68, -0.6);
    astronautGroup.add(tankL);

    const tankR = tankL.clone();
    tankR.position.x = 0.2;
    astronautGroup.add(tankR);

    // Cinturón / Rodamiento de cintura
    const waistRingGeo = new THREE.TorusGeometry(0.38, 0.05, 16, 32);
    const waistRing = new THREE.Mesh(waistRingGeo, ringMaterial);
    waistRing.rotation.x = Math.PI / 2;
    waistRing.position.set(0, 0.22, 0);
    astronautGroup.add(waistRing);

    // Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(0.35, 0.3, 0.35, 20);
    const pelvis = new THREE.Mesh(pelvisGeo, suitMaterial);
    pelvis.position.set(0, 0.05, 0);
    astronautGroup.add(pelvis);

    // Piernas (Muslos y Pantorrillas presurizadas)
    const thighGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.68, 18);
    const thighL = new THREE.Mesh(thighGeo, suitMaterial);
    thighL.position.set(-0.2, -0.42, 0);
    astronautGroup.add(thighL);

    const thighR = thighL.clone();
    thighR.position.x = 0.2;
    astronautGroup.add(thighR);

    // Rodilleras
    const kneeGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const kneeL = new THREE.Mesh(kneeGeo, ringMaterial);
    kneeL.position.set(-0.2, -0.78, 0.02);
    astronautGroup.add(kneeL);

    const kneeR = kneeL.clone();
    kneeR.position.x = 0.2;
    astronautGroup.add(kneeR);

    // Pantorrillas
    const calfGeo = new THREE.CylinderGeometry(0.14, 0.17, 0.68, 18);
    const calfL = new THREE.Mesh(calfGeo, suitMaterial);
    calfL.position.set(-0.2, -1.14, 0);
    astronautGroup.add(calfL);

    const calfR = calfL.clone();
    calfR.position.x = 0.2;
    astronautGroup.add(calfR);

    // Botas lunares/marcianas
    const bootGeo = new THREE.BoxGeometry(0.24, 0.22, 0.44);
    const bootL = new THREE.Mesh(bootGeo, gripMaterial);
    bootL.position.set(-0.2, -1.54, 0.08);
    astronautGroup.add(bootL);

    const bootR = bootL.clone();
    bootR.position.x = 0.2;
    astronautGroup.add(bootR);

    // Brazos articulados
    const shoulderGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const shoulderL = new THREE.Mesh(shoulderGeo, ringMaterial);
    shoulderL.position.set(-0.52, 0.95, 0);
    astronautGroup.add(shoulderL);

    const shoulderR = shoulderL.clone();
    shoulderR.position.x = 0.52;
    astronautGroup.add(shoulderR);

    const armGeo = new THREE.CylinderGeometry(0.12, 0.11, 0.58, 16);
    const armL = new THREE.Mesh(armGeo, suitMaterial);
    armL.position.set(-0.62, 0.68, 0.08);
    armL.rotation.z = Math.PI * 0.12;
    armL.rotation.x = -Math.PI * 0.1;
    astronautGroup.add(armL);

    const armR = armL.clone();
    armR.position.x = 0.62;
    armR.rotation.z = -Math.PI * 0.12;
    astronautGroup.add(armR);

    // Guantes
    const gloveGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const gloveL = new THREE.Mesh(gloveGeo, gripMaterial);
    gloveL.position.set(-0.76, 0.35, 0.2);
    astronautGroup.add(gloveL);

    const gloveR = gloveL.clone();
    gloveR.position.x = 0.76;
    astronautGroup.add(gloveR);

    // ==========================================
    // ÓRGANOS ANATÓMICOS INTERNOS EN 3D
    // ==========================================
    const organs = {};

    // 1. CEREBRO Y SISTEMA NERVIOSO
    const brainGeo = new THREE.SphereGeometry(0.14, 20, 20);
    const brainMat = new THREE.MeshStandardMaterial({
      color: 0xa78bfa,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const brain = new THREE.Mesh(brainGeo, brainMat);
    brain.position.set(0, 1.4, 0);
    brain.scale.set(1.1, 0.9, 1.2);
    astronautGroup.add(brain);
    organs.brain = brain;

    // 2. OJOS & SANS (Vaina del nervio óptico)
    const eyeGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8,
    });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.08, 1.38, 0.22);
    astronautGroup.add(eyeL);

    const eyeR = eyeL.clone();
    eyeR.position.x = 0.08;
    astronautGroup.add(eyeR);
    organs.eyes = eyeL;

    // 3. CORAZÓN (Latido en tiempo real en 3D)
    const heartGeo = new THREE.DodecahedronGeometry(0.09, 2);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      emissive: 0xe11d48,
      emissiveIntensity: 0.8,
      roughness: 0.25,
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.position.set(-0.06, 0.72, 0.08);
    astronautGroup.add(heartMesh);
    organs.heart = heartMesh;

    // 4. PULMONES (Respiración en tiempo real en 3D)
    const lungGeo = new THREE.CapsuleGeometry(0.09, 0.24, 16, 16);
    const lungMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    const lungL = new THREE.Mesh(lungGeo, lungMat);
    lungL.position.set(-0.14, 0.72, 0.02);
    lungL.rotation.z = Math.PI * 0.05;
    astronautGroup.add(lungL);

    const lungR = lungL.clone();
    lungR.position.x = 0.14;
    lungR.rotation.z = -Math.PI * 0.05;
    astronautGroup.add(lungR);
    organs.lungs = lungL;
    organs.lungR = lungR;

    // 5. METABOLISMO / ESTÓMAGO & GLUCOSA
    const stomachGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const stomachMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
    });
    const stomach = new THREE.Mesh(stomachGeo, stomachMat);
    stomach.position.set(0.04, 0.42, 0.06);
    stomach.scale.set(1.2, 0.8, 0.9);
    astronautGroup.add(stomach);
    organs.metabolism = stomach;

    // 6. COLUMNA VERTEBRAL Y HUESOS (Osteopenia en microgravedad)
    const spineGroup = new THREE.Group();
    const vertebraGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.04, 12);
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xdb2777,
      emissiveIntensity: 0.5,
    });
    for (let i = 0; i < 9; i++) {
      const v = new THREE.Mesh(vertebraGeo, boneMat);
      v.position.set(0, 0.32 + i * 0.08, -0.06);
      spineGroup.add(v);
    }
    astronautGroup.add(spineGroup);
    organs.skeleton = spineGroup;

    // 7. SISTEMA INMUNITARIO (Ganglios linfáticos y timo)
    const lymphGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const lymphMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.7,
    });
    const lymph = new THREE.Mesh(lymphGeo, lymphMat);
    lymph.position.set(0.02, 0.88, 0.1);
    astronautGroup.add(lymph);
    organs.immune = lymph;

    organsRef.current = organs;

    // ==========================================
    // ANILLOS INDICADORES DE NODOS 3D FLOTANTES
    // ==========================================
    const markerNodes = [
      { id: 'brain', pos: new THREE.Vector3(0, 1.45, 0.4), color: 0xa78bfa, label: 'Cerebro' },
      { id: 'eyes', pos: new THREE.Vector3(0, 1.35, 0.45), color: 0x22d3ee, label: 'Ojos/SANS' },
      { id: 'heart', pos: new THREE.Vector3(-0.15, 0.72, 0.45), color: 0xfb7185, label: 'Corazón' },
      { id: 'lungs', pos: new THREE.Vector3(0.18, 0.72, 0.45), color: 0x38bdf8, label: 'Pulmones' },
      { id: 'metabolism', pos: new THREE.Vector3(0, 0.42, 0.45), color: 0xfbbf24, label: 'Glucosa' },
      { id: 'skeleton', pos: new THREE.Vector3(-0.2, -0.42, 0.3), color: 0xf472b6, label: 'Huesos' },
      { id: 'immune', pos: new THREE.Vector3(0, 0.9, 0.45), color: 0x34d399, label: 'Inmune' },
    ];

    const markers = [];
    markerNodes.forEach((node) => {
      const ringGeo = new THREE.RingGeometry(0.045, 0.06, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: node.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const markerMesh = new THREE.Mesh(ringGeo, ringMat);
      markerMesh.position.copy(node.pos);
      markerMesh.userData = { id: node.id, label: node.label };
      astronautGroup.add(markerMesh);
      markers.push(markerMesh);
    });
    markersRef.current = markers;

    // Partículas de polvo cósmico flotante alrededor
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 75;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.025,
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ==========================================
    // INTERACCIÓN CON RATÓN / TOUCH (RAYCASTER)
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markers, true);
      if (intersects.length > 0) {
        const clickedId = intersects[0].object.userData.id;
        if (clickedId && onSelectOrgan) {
          onSelectOrgan(clickedId);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // Manejo de arrastre para rotar manualmente
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      astronautGroup.rotation.y += deltaX * 0.008;
      astronautGroup.rotation.x = Math.max(-0.5, Math.min(0.5, astronautGroup.rotation.x + deltaY * 0.005));

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Soporte táctil en móviles
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;

      astronautGroup.rotation.y += deltaX * 0.008;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = () => { isDragging = false; };

    renderer.domElement.addEventListener('touchstart', handleTouchStart);
    renderer.domElement.addEventListener('touchmove', handleTouchMove);
    renderer.domElement.addEventListener('touchend', handleTouchEnd);

    // ==========================================
    // BUCLE DE RENDERIZADO Y ANIMACIÓN
    // ==========================================
    let clock = new THREE.Clock();

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Levitation suave en microgravedad (0g)
      astronautGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.04;
      astronautGroup.rotation.z = Math.sin(elapsedTime * 0.8) * 0.015;

      // Rotación automática si está activa y no está siendo arrastrado
      if (isRotating && !isDragging) {
        astronautGroup.rotation.y += 0.004;
      }

      // Animación fisiológica: LATIDO DEL CORAZÓN en tiempo real
      if (organs.heart) {
        const heartPulseRate = (heartRate / 60) * Math.PI * 2;
        const heartScale = 1.0 + Math.sin(elapsedTime * heartPulseRate) * 0.12;
        organs.heart.scale.set(heartScale, heartScale, heartScale);
      }

      // Animación fisiológica: RESPIRACIÓN DE PULMONES en tiempo real
      if (organs.lungs && organs.lungR) {
        const respPulseRate = (respiratoryRate / 60) * Math.PI * 2;
        const lungScale = 1.0 + Math.sin(elapsedTime * respPulseRate) * 0.08;
        organs.lungs.scale.set(lungScale, lungScale, lungScale);
        organs.lungR.scale.set(lungScale, lungScale, lungScale);
      }

      // Los marcadores 3D miran siempre hacia la cámara (billboarding)
      markers.forEach((m) => {
        m.lookAt(camera.position);
        const pulse = 1.0 + Math.sin(elapsedTime * 4 + m.position.y * 3) * 0.15;
        m.scale.set(pulse, pulse, pulse);
      });

      // Partículas giran suavemente
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
    };
  }, [heartRate, respiratoryRate, isRotating]);

  // Actualizar modo de visualización dinámicamente en los materiales de Three.js
  useEffect(() => {
    if (!astronautGroupRef.current) return;
    const { suitMaterial, visorMaterial, plssMaterial, ringMaterial, gripMaterial } = astronautGroupRef.current.userData || {};
    if (!suitMaterial) return;

    if (viewMode === 'suit') {
      suitMaterial.transparent = false;
      suitMaterial.opacity = 1.0;
      suitMaterial.depthWrite = true;
      visorMaterial.transparent = false;
      visorMaterial.opacity = 0.95;
      plssMaterial.transparent = false;
      plssMaterial.opacity = 1.0;
      ringMaterial.opacity = 1.0;
      gripMaterial.opacity = 1.0;
    } else if (viewMode === 'xray') {
      suitMaterial.transparent = true;
      suitMaterial.opacity = 0.22;
      suitMaterial.depthWrite = false;
      visorMaterial.transparent = true;
      visorMaterial.opacity = 0.45;
      plssMaterial.transparent = true;
      plssMaterial.opacity = 0.15;
      ringMaterial.opacity = 0.4;
      gripMaterial.opacity = 0.3;
    } else { // 'organs'
      suitMaterial.transparent = true;
      suitMaterial.opacity = 0.06;
      suitMaterial.depthWrite = false;
      visorMaterial.transparent = true;
      visorMaterial.opacity = 0.15;
      plssMaterial.transparent = true;
      plssMaterial.opacity = 0.05;
      ringMaterial.opacity = 0.15;
      gripMaterial.opacity = 0.1;
    }
  }, [viewMode]);

  // Manejo de Zoom
  const handleZoom = (delta) => {
    if (!cameraRef.current) return;
    const newZ = Math.max(2.2, Math.min(6.0, cameraRef.current.position.z + delta));
    cameraRef.current.position.z = newZ;
    setZoomLevel(Number((4.2 / newZ).toFixed(1)));
  };

  // Resetear Vista
  const handleResetView = () => {
    if (!cameraRef.current || !astronautGroupRef.current) return;
    cameraRef.current.position.set(0, 0.4, 4.2);
    astronautGroupRef.current.rotation.set(0, 0, 0);
  };

  return (
    <div className="relative flex h-[520px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-space-800 bg-gradient-to-b from-space-950 via-[#070e1c] to-space-950 shadow-2xl">
      {/* Fondo de rejilla espacial y resplandor HUD */}
      <div className="pointer-events-none absolute inset-0 bg-console-grid opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient opacity-40" />

      {/* Contenedor del Canvas WebGL Three.js */}
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Barra de Controles Superiores del Visor 3D */}
      <div className="absolute left-3.5 right-3.5 top-3.5 flex flex-col items-start gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-cyan-300 bg-space-950/80 px-2 py-0.5 rounded border border-cyan-500/30 backdrop-blur-md">
            REAL-TIME 3D ASTRONAUT
          </span>
        </div>

        {/* Selector de Modos de Visión (Traje / Rayos X / Órganos) */}
        <div className="flex flex-wrap items-center gap-0.5 rounded-xl border border-space-700 bg-space-900/90 p-1 backdrop-blur-md pointer-events-auto">
          <button
            type="button"
            onClick={() => onChangeViewMode('suit')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 py-1 text-[11px] font-semibold transition ${
              viewMode === 'suit'
                ? 'bg-cyan-500 text-white shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Escafandra</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('xray')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 py-1 text-[11px] font-semibold transition ${
              viewMode === 'xray'
                ? 'bg-cyan-500 text-white shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Rayos X</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('organs')}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 py-1 text-[11px] font-semibold transition ${
              viewMode === 'organs'
                ? 'bg-cyan-500 text-white shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="h-3.5 w-3.5 text-rose-300" />
            <span>Órganos</span>
          </button>
        </div>
      </div>

      {/* Indicador de Latido y Respiración en Tiempo Real en la Esquina */}
      <div className="absolute left-3.5 bottom-3.5 flex flex-col gap-1 font-mono text-[10px] pointer-events-none">
        <div className="flex items-center gap-1.5 rounded-lg bg-black/70 px-2 py-1 border border-space-800 backdrop-blur-md text-rose-300">
          <Heart className="h-3 w-3 animate-pulse" />
          <span>LATIDO {heartRate} bpm</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-black/70 px-2 py-1 border border-space-800 backdrop-blur-md text-cyan-300">
          <Wind className="h-3 w-3 animate-pulse" />
          <span>RESP {respiratoryRate} rpm</span>
        </div>
      </div>

      {/* Controles Flotantes Inferiores (Girar, Zoom, Resetear) */}
      <div className="absolute right-3.5 bottom-3.5 flex items-center gap-0.5 rounded-xl border border-space-700 bg-space-900/90 p-1 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          title={isRotating ? 'Pausar rotación automática' : 'Reanudar rotación'}
          className={`rounded-lg p-1 transition ${
            isRotating ? 'text-cyan-300 bg-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isRotating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => handleZoom(-0.5)}
          title="Acercar cámara"
          className="rounded-lg p-1 text-slate-400 hover:bg-space-800 hover:text-white transition"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom(0.5)}
          title="Alejar cámara"
          className="rounded-lg p-1 text-slate-400 hover:bg-space-800 hover:text-white transition"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetView}
          title="Centrar vista frontal"
          className="rounded-lg p-1 text-slate-400 hover:bg-space-800 hover:text-white transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
