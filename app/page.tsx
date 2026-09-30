"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { Aircraft } from "@/src/engine/aircraft";
import { Controls } from "@/src/engine/controls";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const debugRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --------------------------------------------------
    // Scene
    // --------------------------------------------------

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x87ceeb);

    // --------------------------------------------------
    // Camera
    // --------------------------------------------------

    const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );

    camera.position.set(0, 10, 20);

    // --------------------------------------------------
    // Renderer
    // --------------------------------------------------

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    container.appendChild(renderer.domElement);

    // --------------------------------------------------
    // Lighting
    // --------------------------------------------------

    const sunlight = new THREE.DirectionalLight(
        0xffffff,
        3
    );

    sunlight.position.set(
        100,
        200,
        100
    );

    scene.add(sunlight);

    scene.add(
        new THREE.AmbientLight(
            0xffffff,
            0.5
        )
    );

    // --------------------------------------------------
    // Ground
    // --------------------------------------------------

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(
            10000,
            10000
        ),
        new THREE.MeshStandardMaterial({
          color: 0x2874a6,
        })
    );

    ground.rotation.x = -Math.PI / 2;

    scene.add(ground);

    // --------------------------------------------------
    // Simulation
    // --------------------------------------------------

    const player = new Aircraft();
    const controls = new Controls();

    // --------------------------------------------------
    // Aircraft render object
    // --------------------------------------------------

    const aircraft = new THREE.Group();

    // Fuselage
    const fuselage = new THREE.Mesh(
        new THREE.ConeGeometry(
            0.7,
            5,
            6
        ),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
        })
    );

    fuselage.rotation.x =
        -Math.PI / 2;

    fuselage.position.z = -0.5;

    aircraft.add(fuselage);

    // Main wings
    const wingGeometry =
        new THREE.BoxGeometry(
            6,
            0.2,
            1.2
        );

    const wingMaterial =
        new THREE.MeshStandardMaterial({
          color: 0xcccccc,
        });

    const wings = new THREE.Mesh(
        wingGeometry,
        wingMaterial
    );

    wings.position.z = 0.5;

    aircraft.add(wings);

    // Horizontal tail
    const tail = new THREE.Mesh(
        new THREE.BoxGeometry(
            2.5,
            0.15,
            0.8
        ),
        wingMaterial
    );

    tail.position.z = 1.8;

    aircraft.add(tail);

    // Vertical tail
    const verticalTail =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.15,
                1.5,
                0.8
            ),
            wingMaterial
        );

    verticalTail.position.set(
        0,
        0.6,
        1.8
    );

    aircraft.add(verticalTail);

    scene.add(aircraft);

    // --------------------------------------------------
    // Aircraft axes
    // --------------------------------------------------

    const axes = new THREE.AxesHelper(5);

    aircraft.add(axes);

    // --------------------------------------------------
    // Velocity arrow
    // --------------------------------------------------

    const velocityArrow =
        new THREE.ArrowHelper(
            new THREE.Vector3(
                0,
                0,
                -1
            ),
            new THREE.Vector3(),
            20
        );

    scene.add(velocityArrow);

    // --------------------------------------------------
    // Camera helpers
    // --------------------------------------------------

    const cameraOffset =
        new THREE.Vector3();

    const cameraForward =
        new THREE.Vector3();

    const cameraPosition =
        new THREE.Vector3();

    const lookAhead =
        new THREE.Vector3();

    const lookTarget =
        new THREE.Vector3();

    // --------------------------------------------------
    // Animation
    // --------------------------------------------------

    let previousTime =
        performance.now();

    function animate(
        currentTime: number
    ) {
      requestAnimationFrame(
          animate
      );

      const dt = Math.min(
          (
              currentTime -
              previousTime
          ) / 1000,
          0.05
      );

      previousTime =
          currentTime;

      // ------------------------------------------------
      // Update simulation
      // ------------------------------------------------

      player.update(dt, {
        pitch: controls.pitch,
        roll: controls.roll,
        yaw: controls.yaw,
        throttle: controls.throttle,
      });

      // ------------------------------------------------
      // Debug
      // ------------------------------------------------

      if (debugRef.current) {
        debugRef.current.textContent = [
          `FPS: ${(1 / dt).toFixed(0)}`,
          "",
          `PITCH:   ${controls.pitch.toFixed(0)}`,
          `ROLL:    ${controls.roll.toFixed(0)}`,
          `YAW:     ${controls.yaw.toFixed(0)}`,
          `THROTTLE:${controls.throttle.toFixed(0)}`,
          "",
          `SPEED:   ${player.speed.toFixed(1)}`,
          `THROTTLE:${player.throttle.toFixed(2)}`,
          "",
          `X: ${player.position.x.toFixed(1)}`,
          `Y: ${player.position.y.toFixed(1)}`,
          `Z: ${player.position.z.toFixed(1)}`,
          "",
          `ROT X: ${THREE.MathUtils
              .radToDeg(
                  player.rotation.x
              )
              .toFixed(1)}°`,
          `ROT Y: ${THREE.MathUtils
              .radToDeg(
                  player.rotation.y
              )
              .toFixed(1)}°`,
          `ROT Z: ${THREE.MathUtils
              .radToDeg(
                  player.rotation.z
              )
              .toFixed(1)}°`,
        ].join("\n");
      }

      // ------------------------------------------------
      // Simulation → aircraft
      // ------------------------------------------------

      aircraft.position.copy(
          player.position
      );

      aircraft.quaternion.copy(
          player.quaternion
      );

      // ------------------------------------------------
      // Velocity direction
      // ------------------------------------------------

      const forward =
          new THREE.Vector3(
              0,
              0,
              -1
          ).applyQuaternion(
              player.quaternion
          );

      velocityArrow.position.copy(
          player.position
      );

      velocityArrow.setDirection(
          forward
      );

      velocityArrow.setLength(20);

      // ------------------------------------------------
      // Camera
      // ------------------------------------------------
      //
      // The important change:
      //
      // The camera follows the aircraft's
      // pitch/yaw, but NOT its roll.
      //
      // This lets the aircraft visibly roll
      // relative to the camera/world.
      // ------------------------------------------------

      cameraOffset.set(
          0,
          4,
          15
      );

      // Extract the aircraft's forward direction,
      // but deliberately ignore its roll.
      //
      // We do this by using the aircraft's Euler
      // rotation with Z forced to zero.

      const cameraRotation =
          new THREE.Euler(
              player.rotation.x,
              player.rotation.y,
              0,
              player.rotation.order
          );

      cameraOffset.applyEuler(
          cameraRotation
      );

      cameraPosition
          .copy(player.position)
          .add(cameraOffset);

      camera.position.lerp(
          cameraPosition,
          1 -
          Math.pow(
              0.001,
              dt
          )
      );

      // ------------------------------------------------
      // Camera look target
      // ------------------------------------------------

      lookAhead.set(
          0,
          0,
          -50
      );

      lookAhead.applyEuler(
          cameraRotation
      );

      lookTarget
          .copy(player.position)
          .add(lookAhead);

      camera.lookAt(
          lookTarget
      );

      // ------------------------------------------------
      // Render
      // ------------------------------------------------

      renderer.render(
          scene,
          camera
      );
    }

    animate(
        performance.now()
    );

    // --------------------------------------------------
    // Resize
    // --------------------------------------------------

    function handleResize() {
      camera.aspect =
          window.innerWidth /
          window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
          window.innerWidth,
          window.innerHeight
      );
    }

    window.addEventListener(
        "resize",
        handleResize
    );

    // --------------------------------------------------
    // Cleanup
    // --------------------------------------------------

    return () => {
      window.removeEventListener(
          "resize",
          handleResize
      );

      renderer.dispose();

      controls.dispose();

      container.removeChild(
          renderer.domElement
      );
    };
  }, []);

  return (
      <main
          ref={containerRef}
          style={{
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            position: "relative",
          }}
      >
        <div
            ref={debugRef}
            style={{
              position: "absolute",
              whiteSpace: "pre",
              top: 10,
              left: 10,
              zIndex: 10,
              padding: "10px",
              background:
                  "rgba(0, 0, 0, 0.7)",
              color: "white",
              fontFamily:
                  "monospace",
              fontSize: "14px",
              lineHeight: "1.5",
              pointerEvents:
                  "none",
            }}
        />
      </main>
  );
}