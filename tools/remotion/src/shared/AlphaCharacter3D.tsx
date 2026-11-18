import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";

export interface Alpha3DProps {
  expression?: "happy" | "shock" | "smug" | "neutral" | "wink" | "tense";
  pose?: "idle" | "wave" | "thumbs_up" | "point" | "shock" | "gesture_left" | "gesture_right" | "think";
  cameraAngle?: number;
  cameraPitch?: number;
  turntable?: boolean;
  scale?: number;
  showPedestal?: boolean;
  rimLightColor?: number | string;
  bgColor?: string;
  mouthOpen?: number;
  activeWord?: string;
}

export const createAlpha3DModel = (
  expression: string = "happy",
  pose: string = "idle",
  time: number = 0,
  mouthOpen: number = 0
): THREE.Group => {
  const root = new THREE.Group();
  const isShock = expression === "shock" || expression === "tense";

  // ==========================================
  // MATERIALS
  // ==========================================
  const skinMat = new THREE.MeshPhysicalMaterial({
    color: isShock ? 0xffdfc8 : 0xffd2a5,
    roughness: 0.38,
    metalness: 0.0,
    clearcoat: 0.15,
    clearcoatRoughness: 0.25,
  });

  const beanieMat = new THREE.MeshStandardMaterial({
    color: 0x222226,
    roughness: 0.9,
    metalness: 0.02,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x18181c,
    roughness: 0.8,
    metalness: 0.05,
  });

  const hoodieMat = new THREE.MeshStandardMaterial({
    color: isShock ? 0x4f46e5 : 0x5b5fe8,
    roughness: 0.62,
    metalness: 0.02,
  });

  const hoodieDarkMat = new THREE.MeshStandardMaterial({
    color: 0x3d3f9e,
    roughness: 0.68,
    metalness: 0.02,
  });

  const stringMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
  });

  const agletMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.9,
    roughness: 0.15,
  });

  const scleraMat = new THREE.MeshPhysicalMaterial({
    color: isShock ? 0xfff5f5 : 0xffffff,
    roughness: 0.02,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });

  const irisMat = new THREE.MeshStandardMaterial({
    color: isShock ? 0x2563eb : 0x3b82f6,
    roughness: 0.1,
  });

  const pupilMat = new THREE.MeshBasicMaterial({
    color: 0x050811,
  });

  const highlightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x161622,
    roughness: 0.75,
  });

  const shoeUpperMat = new THREE.MeshStandardMaterial({
    color: 0x4f46e5,
    roughness: 0.45,
  });

  const shoeSoleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
  });

  // ==========================================
  // 1. HEAD & FACE GROUP
  // ==========================================
  const headGroup = new THREE.Group();
  headGroup.position.y = 2.15;

  // Head Base
  const headGeo = new THREE.SphereGeometry(0.72, 40, 40);
  headGeo.scale(1.03, 0.96, 0.95);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Beanie (Dome covers the top and back)
  const beanieGeo = new THREE.SphereGeometry(0.745, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
  const beanieMesh = new THREE.Mesh(beanieGeo, beanieMat);
  beanieMesh.position.set(0, 0.10, -0.04);
  beanieMesh.rotation.x = -0.18;
  headGroup.add(beanieMesh);

  // Beanie Ribbed Folded Brim (clean torus hugging the forehead line at y=0.18)
  const brimGeo = new THREE.TorusGeometry(0.72, 0.08, 18, 48);
  const brimMesh = new THREE.Mesh(brimGeo, beanieMat);
  brimMesh.position.set(0, 0.18, 0.08);
  brimMesh.rotation.x = Math.PI / 2 - 0.20;
  headGroup.add(brimMesh);

  // Stylized Hair Bangs (Emerging from UNDER the beanie brim between y=0.12 and y=0.18)
  const createHairTuft = (
    x: number,
    y: number,
    z: number,
    rx: number,
    ry: number,
    rz: number,
    sx: number,
    sy: number,
    sz: number
  ) => {
    const tuftGeo = new THREE.SphereGeometry(0.10, 16, 16);
    tuftGeo.scale(sx, sy, sz);
    const tuft = new THREE.Mesh(tuftGeo, hairMat);
    tuft.position.set(x, y, z);
    tuft.rotation.set(rx, ry, rz);
    return tuft;
  };

  // 4 flowing front hair locks emerging under the brim:
  headGroup.add(createHairTuft(-0.28, 0.14, 0.63, 0.1, 0.1, -0.35, 1.2, 1.8, 0.7));
  headGroup.add(createHairTuft(-0.10, 0.16, 0.65, 0.05, 0.0, -0.12, 1.3, 1.9, 0.75));
  headGroup.add(createHairTuft(0.10, 0.15, 0.65, 0.05, -0.1, 0.18, 1.25, 1.85, 0.72));
  headGroup.add(createHairTuft(0.26, 0.13, 0.63, 0.1, -0.2, 0.38, 1.15, 1.7, 0.68));

  // Ears
  const earGeo = new THREE.SphereGeometry(0.16, 20, 20);
  earGeo.scale(0.45, 0.9, 0.65);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.73, 0.0, 0.0);
  leftEar.rotation.y = -0.3;
  headGroup.add(leftEar);

  const rightEar = leftEar.clone();
  rightEar.position.x = 0.73;
  rightEar.rotation.y = 0.3;
  headGroup.add(rightEar);

  // Blush Cheeks (Hidden during shock mode for horrified pale look)
  if (!isShock) {
    const blushMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.42,
    });
    const blushGeo = new THREE.CircleGeometry(0.11, 24);

    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.38, -0.14, 0.60);
    leftBlush.rotation.y = -0.42;
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.38, -0.14, 0.60);
    rightBlush.rotation.y = 0.42;
    headGroup.add(rightBlush);
  }

  // ==========================================
  // EYES (Fully Expression Aware + Never Clipped)
  // ==========================================
  const buildEye = (isLeft: boolean) => {
    const eye = new THREE.Group();
    const sign = isLeft ? -1 : 1;

    // Sclera Sphere
    const eyeRadius = isShock ? 0.20 : 0.175;
    const eyeWhite = new THREE.Mesh(
      new THREE.SphereGeometry(eyeRadius, 32, 32),
      scleraMat
    );
    eyeWhite.scale.set(1.0, 1.12, 0.85);
    eye.add(eyeWhite);

    // Front surface Z is at approx eyeRadius * 0.85 = 0.15 to 0.17
    const frontZ = eyeRadius * 0.82;

    if (isShock) {
      // SHOCKED PINPRICK EYE: Tiny iris and microscopic pupil!
      const iris = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 20, 16),
        irisMat
      );
      iris.scale.set(1.0, 1.0, 0.2);
      iris.position.set(0, 0, frontZ + 0.02);
      eye.add(iris);

      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 16, 16),
        pupilMat
      );
      pupil.scale.set(1.0, 1.0, 0.2);
      pupil.position.set(0, 0, frontZ + 0.032);
      eye.add(pupil);

      // Distressed High-Arched Terror Brow
      const browCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(sign * -0.12, 0.18, 0.10),
        new THREE.Vector3(sign * -0.02, 0.24, 0.12),
        new THREE.Vector3(sign * 0.06, 0.30, 0.12),
        new THREE.Vector3(sign * 0.14, 0.33, 0.10)
      );
      const browGeo = new THREE.TubeGeometry(browCurve, 16, 0.024, 8, false);
      const brow = new THREE.Mesh(browGeo, hairMat);
      eye.add(brow);
    } else {
      // HAPPY / HERO EYE: Sparkling anime gaze!
      const irisOuter = new THREE.Mesh(
        new THREE.SphereGeometry(0.112, 24, 16),
        new THREE.MeshBasicMaterial({ color: 0x1d4ed8 })
      );
      irisOuter.scale.set(1.0, 1.0, 0.2);
      irisOuter.position.set(0, 0, frontZ + 0.015);
      eye.add(irisOuter);

      const iris = new THREE.Mesh(
        new THREE.SphereGeometry(0.098, 24, 16),
        irisMat
      );
      iris.scale.set(1.0, 1.0, 0.2);
      iris.position.set(0, 0, frontZ + 0.022);
      eye.add(iris);

      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.054, 20, 16),
        pupilMat
      );
      pupil.scale.set(1.0, 1.0, 0.2);
      pupil.position.set(0, 0, frontZ + 0.028);
      eye.add(pupil);

      // Two Glossy Catchlights
      const hl1 = new THREE.Mesh(new THREE.SphereGeometry(0.028, 14, 14), highlightMat);
      hl1.position.set(sign * 0.035, 0.038, frontZ + 0.034);
      eye.add(hl1);

      const hl2 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), highlightMat);
      hl2.position.set(sign * -0.025, -0.025, frontZ + 0.034);
      eye.add(hl2);

      // Eyelid Upper Contour
      const lidCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.16, 0.11, 0.12),
        new THREE.Vector3(-0.06, 0.17, 0.14),
        new THREE.Vector3(0.06, 0.17, 0.14),
        new THREE.Vector3(0.16, 0.11, 0.12)
      );
      const lidGeo = new THREE.TubeGeometry(lidCurve, 20, 0.018, 8, false);
      const lid = new THREE.Mesh(lidGeo, hairMat);
      eye.add(lid);

      // Brow
      const browCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.14, 0.22, 0.08),
        new THREE.Vector3(-0.05, 0.27, 0.10),
        new THREE.Vector3(0.05, 0.27, 0.10),
        new THREE.Vector3(0.14, 0.22, 0.08)
      );
      const browGeo = new THREE.TubeGeometry(browCurve, 16, 0.022, 8, false);
      const brow = new THREE.Mesh(browGeo, hairMat);
      eye.add(brow);
    }

    return eye;
  };

  const leftEye = buildEye(true);
  leftEye.position.set(-0.25, 0.04, 0.58);
  leftEye.rotation.y = -0.20;
  headGroup.add(leftEye);

  const rightEye = buildEye(false);
  rightEye.position.set(0.25, 0.04, 0.58);
  rightEye.rotation.y = 0.20;
  headGroup.add(rightEye);

  // ==========================================
  // MOUTH
  // ==========================================
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.22, 0.64);

  if (mouthOpen >= 0.08) {
    // Dynamic acoustic lip-sync mouth!
    const openY = 0.45 + mouthOpen * 1.5;
    const mouthRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.024, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x3b070c, roughness: 0.3 })
    );
    mouthRim.scale.set(0.9, openY, 1.0);
    mouthGroup.add(mouthRim);

    const mouthBack = new THREE.Mesh(
      new THREE.CircleGeometry(0.105, 24),
      new THREE.MeshBasicMaterial({ color: 0x120204 })
    );
    mouthBack.scale.set(0.9, openY);
    mouthBack.position.z = -0.015;
    mouthGroup.add(mouthBack);

    // Deep tongue inside
    const tongue = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.3 })
    );
    tongue.position.set(0, -0.06 * Math.min(1.2, openY), 0.01);
    mouthGroup.add(tongue);
  } else if (isShock) {
    // SHOCK: Gaping Jaw-Drop Scream "O"
    const mouthRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.026, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x3b070c, roughness: 0.3 })
    );
    mouthRim.scale.set(0.85, 1.85, 1.0);
    mouthGroup.add(mouthRim);

    const mouthBack = new THREE.Mesh(
      new THREE.CircleGeometry(0.115, 24),
      new THREE.MeshBasicMaterial({ color: 0x120204 })
    );
    mouthBack.scale.set(0.85, 1.85);
    mouthBack.position.z = -0.015;
    mouthGroup.add(mouthBack);

    // Deep tongue inside
    const tongue = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.3 })
    );
    tongue.position.set(0, -0.11, 0.01);
    mouthGroup.add(tongue);
  } else if (expression === "smug") {
    // Smug smirk
    const smirkCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.10, -0.02, 0),
      new THREE.Vector3(-0.02, -0.06, 0),
      new THREE.Vector3(0.08, -0.02, 0),
      new THREE.Vector3(0.14, 0.06, 0)
    );
    const smirkGeo = new THREE.TubeGeometry(smirkCurve, 20, 0.018, 8, false);
    const smirk = new THREE.Mesh(smirkGeo, new THREE.MeshStandardMaterial({ color: 0x2d1515 }));
    mouthGroup.add(smirk);
  } else {
    // Happy smile
    const smileCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.14, 0.02, 0),
      new THREE.Vector3(-0.07, -0.10, 0),
      new THREE.Vector3(0.07, -0.10, 0),
      new THREE.Vector3(0.14, 0.02, 0)
    );
    const smileGeo = new THREE.TubeGeometry(smileCurve, 24, 0.02, 8, false);
    const smile = new THREE.Mesh(smileGeo, new THREE.MeshStandardMaterial({ color: 0x3b0f14 }));
    mouthGroup.add(smile);

    // Cute pink tongue
    const tongue = new THREE.Mesh(
      new THREE.SphereGeometry(0.040, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 })
    );
    tongue.position.set(0, -0.05, 0.0);
    mouthGroup.add(tongue);
  }
  headGroup.add(mouthGroup);

  headGroup.rotation.y = Math.sin(time * 1.5) * 0.04;
  headGroup.rotation.z = Math.cos(time * 1.2) * 0.02;
  root.add(headGroup);

  // ==========================================
  // 2. HOODIE TORSO & KANGAROO POCKET
  // ==========================================
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 1.05;

  const torsoGeo = new THREE.CylinderGeometry(0.48, 0.58, 1.05, 36);
  torsoGeo.scale(1.15, 1.0, 0.90);
  const torsoMesh = new THREE.Mesh(torsoGeo, hoodieMat);
  torsoMesh.castShadow = true;
  torsoGroup.add(torsoMesh);

  // Kangaroo Pocket (offset cleanly in front to prevent z-fighting)
  const pocketBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.66, 0.36, 0.08),
    hoodieDarkMat
  );
  pocketBase.position.set(0, -0.22, 0.47);
  pocketBase.rotation.x = -0.12;
  torsoGroup.add(pocketBase);

  // Side Slits
  const leftSlit = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.26, 0.09),
    new THREE.MeshBasicMaterial({ color: 0x1e1b4b })
  );
  leftSlit.position.set(-0.31, -0.22, 0.48);
  leftSlit.rotation.z = 0.25;
  torsoGroup.add(leftSlit);

  const rightSlit = leftSlit.clone();
  rightSlit.position.x = 0.31;
  rightSlit.rotation.z = -0.25;
  torsoGroup.add(rightSlit);

  // Ribbed Lower Hem
  const hemGeo = new THREE.TorusGeometry(0.56, 0.055, 16, 40);
  hemGeo.scale(1.14, 0.90, 1.0);
  const hemMesh = new THREE.Mesh(hemGeo, hoodieDarkMat);
  hemMesh.position.y = -0.52;
  hemMesh.rotation.x = Math.PI / 2;
  torsoGroup.add(hemMesh);

  // Puffy Hood behind neck
  const hoodGeo = new THREE.TorusGeometry(0.46, 0.18, 18, 36, Math.PI * 1.4);
  const hoodMesh = new THREE.Mesh(hoodGeo, hoodieMat);
  hoodMesh.position.set(0, 0.50, -0.22);
  hoodMesh.rotation.x = -Math.PI * 0.35;
  hoodMesh.rotation.z = -Math.PI * 0.7;
  torsoGroup.add(hoodMesh);

  // Collar Rim
  const collarGeo = new THREE.TorusGeometry(0.38, 0.065, 16, 36);
  const collarMesh = new THREE.Mesh(collarGeo, hoodieDarkMat);
  collarMesh.position.set(0, 0.52, 0.02);
  collarMesh.rotation.x = Math.PI / 2 + 0.1;
  torsoGroup.add(collarMesh);

  // Drawstrings
  const buildString = (xPos: number) => {
    const strGroup = new THREE.Group();
    const cordCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(xPos, 0.46, 0.42),
      new THREE.Vector3(xPos * 1.15, 0.30, 0.48),
      new THREE.Vector3(xPos * 0.95, 0.12, 0.52),
      new THREE.Vector3(xPos * 0.9, -0.04, 0.52)
    );
    const cordGeo = new THREE.TubeGeometry(cordCurve, 20, 0.016, 8, false);
    const cordMesh = new THREE.Mesh(cordGeo, stringMat);
    strGroup.add(cordMesh);

    const aglet = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.075, 14), agletMat);
    aglet.position.set(xPos * 0.9, -0.075, 0.52);
    strGroup.add(aglet);

    return strGroup;
  };
  torsoGroup.add(buildString(-0.15));
  torsoGroup.add(buildString(0.15));

  root.add(torsoGroup);

  // ==========================================
  // 3. ARMS & HANDS (Seamless Joints & Accurate Angles)
  // ==========================================
  const buildArm = (isLeft: boolean) => {
    const armRoot = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    // Left arm is at -X (viewer's left), Right arm is at +X (viewer's right)
    armRoot.position.set(sign * 0.58, 1.48, 0.0);

    // Shoulder Sphere (smooth organic ball joint)
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 18), hoodieMat);
    armRoot.add(shoulder);

    // Upper Arm Sleeve
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.45, 20), hoodieMat);
    upperArm.position.y = -0.22;
    armRoot.add(upperArm);

    // Elbow Sphere (prevents any elbow separation gap!)
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), hoodieMat);
    elbow.position.y = -0.44;
    armRoot.add(elbow);

    // Forearm Group
    const forearmGroup = new THREE.Group();
    forearmGroup.position.y = -0.44;

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.40, 20), hoodieMat);
    forearm.position.y = -0.20;
    forearmGroup.add(forearm);

    // Ribbed Cuff
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.03, 14, 24), hoodieDarkMat);
    cuff.position.y = -0.38;
    cuff.rotation.x = Math.PI / 2;
    forearmGroup.add(cuff);

    // Cute Hand
    const handGroup = new THREE.Group();
    handGroup.position.y = -0.50;

    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), skinMat);
    palm.scale.set(1.0, 1.15, 0.65);
    handGroup.add(palm);

    for (let f = -1.5; f <= 1.5; f += 1.0) {
      const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.07, 8, 8), skinMat);
      finger.position.set(f * 0.036, -0.10, 0.0);
      handGroup.add(finger);
    }

    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.08, 8, 8), skinMat);
    thumb.position.set(sign * 0.11, 0.01, 0.04);
    thumb.rotation.z = sign * -0.65;
    thumb.rotation.x = 0.2;
    handGroup.add(thumb);

    forearmGroup.add(handGroup);
    armRoot.add(forearmGroup);

    // ==========================================
    // RIGGING POSE LOGIC
    // ==========================================
    if (pose === "wave" && isLeft) {
      // LEFT HAND WAVING (Viewer's Left):
      // -Z rotation raises negative X arm up beside head!
      armRoot.rotation.z = -1.95;
      armRoot.rotation.x = -0.35;
      armRoot.rotation.y = -0.15;

      forearmGroup.rotation.z = -0.85 + Math.sin(time * 8) * 0.35;
      forearmGroup.rotation.x = -0.25;

      handGroup.rotation.z = 0.3;
      handGroup.rotation.y = 0.0;
    } else if (isShock) {
      // SHOCK POSE: Both hands actually raised to cheeks ("Home Alone" pose)!
      // Lift arm up and forward towards face
      armRoot.rotation.x = -1.85; // swings arm UPWARDS and forward towards face!
      armRoot.rotation.z = isLeft ? -0.45 : 0.45;
      armRoot.rotation.y = isLeft ? 0.25 : -0.25;

      // Forearm folds inwards & upwards right onto the cheek
      forearmGroup.rotation.x = -1.15;
      forearmGroup.rotation.z = isLeft ? 0.75 : -0.75;

      // Palms cup the cheeks
      handGroup.rotation.y = isLeft ? Math.PI * 0.45 : -Math.PI * 0.45;
      handGroup.rotation.z = isLeft ? -0.25 : 0.25;
    } else if (pose === "thumbs_up" && !isLeft) {
      // Right hand thumbs up
      armRoot.rotation.x = 0.95;
      armRoot.rotation.z = -0.35;
      forearmGroup.rotation.x = -0.75;
      forearmGroup.rotation.z = -0.2;
      thumb.rotation.x = 0.8;
    } else {
      // Natural idle
      armRoot.rotation.z = sign * 0.22 + Math.sin(time * 2 + (isLeft ? 0 : Math.PI)) * 0.02;
      armRoot.rotation.x = 0.08;
      forearmGroup.rotation.z = sign * 0.14;
    }

    return armRoot;
  };

  root.add(buildArm(true));  // Left
  root.add(buildArm(false)); // Right

  // ==========================================
  // 4. LEGS & SNEAKERS
  // ==========================================
  const buildLeg = (isLeft: boolean) => {
    const legGroup = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    legGroup.position.set(sign * 0.26, 0.55, 0.0);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.18, 0.65, 20), pantsMat);
    leg.position.y = -0.28;
    legGroup.add(leg);

    const pCuff = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 12, 20), pantsMat);
    pCuff.position.y = -0.58;
    pCuff.rotation.x = Math.PI / 2;
    legGroup.add(pCuff);

    // Sneaker
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.68, 0.06);

    const soleGeo = new THREE.BoxGeometry(0.32, 0.10, 0.60);
    const soleMesh = new THREE.Mesh(soleGeo, shoeSoleMat);
    soleMesh.position.y = 0.05;
    shoeGroup.add(soleMesh);

    const upperGeo = new THREE.SphereGeometry(0.21, 20, 18);
    upperGeo.scale(0.88, 0.82, 1.35);
    const upperMesh = new THREE.Mesh(upperGeo, shoeUpperMat);
    upperMesh.position.set(0, 0.16, 0.04);
    shoeGroup.add(upperMesh);

    const toeGeo = new THREE.SphereGeometry(0.145, 16, 16);
    toeGeo.scale(1.0, 0.72, 0.95);
    const toeMesh = new THREE.Mesh(toeGeo, shoeSoleMat);
    toeMesh.position.set(0, 0.12, 0.23);
    shoeGroup.add(toeMesh);

    for (let l = -0.05; l <= 0.10; l += 0.06) {
      const lace = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.03), shoeSoleMat);
      lace.position.set(0, 0.26, l);
      shoeGroup.add(lace);
    }

    legGroup.add(shoeGroup);
    return legGroup;
  };

  root.add(buildLeg(true));
  root.add(buildLeg(false));

  return root;
};

export const AlphaCharacter3D: React.FC<Alpha3DProps> = ({
  expression = "happy",
  pose = "idle",
  cameraAngle = 0,
  cameraPitch = 0,
  turntable = false,
  scale = 1,
  showPedestal = false,
  rimLightColor = 0x818cf8,
  bgColor = "transparent",
  mouthOpen = 0,
  activeWord = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const time = frame / fps;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = expression === "shock" ? 1.05 : 1.15;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    const radius = 5.3 / scale;
    const angle = turntable ? (frame / (fps * 4)) * Math.PI * 2 + cameraAngle : cameraAngle;
    const pitch = cameraPitch;

    camera.position.set(
      Math.sin(angle) * Math.cos(pitch) * radius,
      1.65 + Math.sin(pitch) * radius,
      Math.cos(angle) * Math.cos(pitch) * radius
    );
    camera.lookAt(0, 1.45, 0);

    // ==========================================
    // STUDIO LIGHTING SETUP
    // ==========================================
    if (expression === "shock") {
      // HORROR SETUP
      const keyLight = new THREE.DirectionalLight(0xffedd5, 1.5);
      keyLight.position.set(2.5, 4.0, 3.0);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
      fillLight.position.set(-3.5, 2.0, 2.5);
      scene.add(fillLight);

      // Blazing Red Rim Light
      const rimLight = new THREE.DirectionalLight(0xff1111, 7.5);
      rimLight.position.set(0, 3.2, -4.5);
      scene.add(rimLight);

      // Red Under-light illuminating face from below
      const underLight = new THREE.DirectionalLight(0xef4444, 3.2);
      underLight.position.set(0, -1.5, 2.8);
      scene.add(underLight);

      scene.add(new THREE.AmbientLight(0x181828, 0.6));
    } else {
      // VIBRANT STUDIO 3-POINT
      const keyLight = new THREE.DirectionalLight(0xfff5eb, 3.0);
      keyLight.position.set(3.5, 4.8, 3.8);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.4);
      fillLight.position.set(-3.5, 2.5, 2.8);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(rimLightColor, 4.2);
      rimLight.position.set(0, 3.8, -4.2);
      scene.add(rimLight);

      scene.add(new THREE.AmbientLight(0x2d3748, 0.85));

      const groundBounce = new THREE.DirectionalLight(0x818cf8, 0.45);
      groundBounce.position.set(0, -3.0, 1.5);
      scene.add(groundBounce);
    }

    // Pedestal
    if (showPedestal) {
      const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.25, 48);
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0x181824,
        roughness: 0.25,
        metalness: 0.1,
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = -0.125;
      pedestal.receiveShadow = true;
      scene.add(pedestal);

      const ringGeo = new THREE.TorusGeometry(1.61, 0.025, 16, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: expression === "shock" ? 0xef4444 : 0x6366f1,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.0;
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    }

    // Add Alpha Model with dynamic lip-sync
    const model = createAlpha3DModel(expression, pose, time, mouthOpen);
    scene.add(model);

    renderer.render(scene, camera);

    return () => {
      renderer.dispose();
    };
  }, [
    frame,
    fps,
    width,
    height,
    expression,
    pose,
    cameraAngle,
    cameraPitch,
    turntable,
    scale,
    showPedestal,
    rimLightColor,
    time,
    mouthOpen,
  ]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
