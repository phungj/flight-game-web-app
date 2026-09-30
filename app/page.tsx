"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { Aircraft } from "@/src/engine/aircraft";
import { Controls } from "@/src/engine/controls";
import { Missile } from "@/src/engine/missile";

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const debugRef = useRef<HTMLDivElement>(null);
    const hudRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // --------------------------------------------------
        // Scene
        // --------------------------------------------------

        const scene = new THREE.Scene();

        scene.background =
            new THREE.Color(0x87ceeb);

        // --------------------------------------------------
        // Camera
        // --------------------------------------------------

        const camera =
            new THREE.PerspectiveCamera(
                70,
                window.innerWidth /
                window.innerHeight,
                0.1,
                10000
            );

        // --------------------------------------------------
        // Renderer
        // --------------------------------------------------

        const renderer =
            new THREE.WebGLRenderer({
                antialias: true,
            });

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        container.appendChild(
            renderer.domElement
        );

        // --------------------------------------------------
        // Lighting
        // --------------------------------------------------

        const sunlight =
            new THREE.DirectionalLight(
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

        const ground =
            new THREE.Mesh(
                new THREE.PlaneGeometry(
                    10000,
                    10000
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x2874a6,
                })
            );

        ground.rotation.x =
            -Math.PI / 2;

        scene.add(ground);

        // --------------------------------------------------
        // Simulation
        // --------------------------------------------------

        const player =
            new Aircraft();

        const controls =
            new Controls();

        // --------------------------------------------------
        // Aircraft render object
        // --------------------------------------------------

        const aircraft =
            new THREE.Group();

        // --------------------------------------------------
        // Fuselage
        // --------------------------------------------------

        const fuselage =
            new THREE.Mesh(
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

        fuselage.position.z =
            -0.5;

        aircraft.add(fuselage);

        // --------------------------------------------------
        // Main wings
        // --------------------------------------------------

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

        const wings =
            new THREE.Mesh(
                wingGeometry,
                wingMaterial
            );

        wings.position.z =
            0.5;

        aircraft.add(wings);

        // --------------------------------------------------
        // Horizontal tail
        // --------------------------------------------------

        const tail =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.5,
                    0.15,
                    0.8
                ),
                wingMaterial
            );

        tail.position.z =
            1.8;

        aircraft.add(tail);

        // --------------------------------------------------
        // Vertical tail
        // --------------------------------------------------

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

        aircraft.add(
            verticalTail
        );

        scene.add(aircraft);

        // --------------------------------------------------
        // Aircraft axes
        // --------------------------------------------------

        const axes =
            new THREE.AxesHelper(5);

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

        scene.add(
            velocityArrow
        );

        // --------------------------------------------------
        // Enemy
        // --------------------------------------------------

        const enemy = {
            position: new THREE.Vector3(
                0,
                300,
                -800
            ),

            quaternion:
                new THREE.Quaternion(),

            alive: true,

            angle: 0,
        };

        const enemyGroup =
            new THREE.Group();

        // Enemy fuselage
        const enemyFuselage =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.7,
                    5,
                    6
                ),
                new THREE.MeshStandardMaterial({
                    color: 0xff4444,
                })
            );

        enemyFuselage.rotation.x =
            -Math.PI / 2;

        enemyFuselage.position.z =
            -0.5;

        enemyGroup.add(
            enemyFuselage
        );

        // Enemy wings
        const enemyWings =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    6,
                    0.2,
                    1.2
                ),
                new THREE.MeshStandardMaterial({
                    color: 0xcc2222,
                })
            );

        enemyWings.position.z =
            0.5;

        enemyGroup.add(
            enemyWings
        );

        scene.add(enemyGroup);

        // --------------------------------------------------
        // Missiles
        // --------------------------------------------------

        const missiles: Missile[] = [];

        const missileMeshes:
            THREE.Mesh[] = [];

        const missileGeometry =
            new THREE.CapsuleGeometry(
                0.15,
                1.5,
                4,
                8
            );

        const missileMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
            });

        // --------------------------------------------------
        // Lock-on
        // --------------------------------------------------

        let locked = false;

        const lockRange = 1000;

        const lockAngle =
            THREE.MathUtils.degToRad(18);

        // --------------------------------------------------
        // Launch missile
        // --------------------------------------------------

        function launchMissile() {
            if (
                !locked ||
                !enemy.alive
            ) {
                return;
            }

            const forward =
                new THREE.Vector3(
                    0,
                    0,
                    -1
                ).applyQuaternion(
                    player.quaternion
                );

            const launchPosition =
                player.position
                    .clone()
                    .addScaledVector(
                        forward,
                        5
                    );

            const missile =
                new Missile(
                    launchPosition,
                    forward,
                    enemy.position
                );

            missiles.push(
                missile
            );

            const missileMesh =
                new THREE.Mesh(
                    missileGeometry,
                    missileMaterial
                );

            scene.add(
                missileMesh
            );

            missileMeshes.push(
                missileMesh
            );
        }

        // --------------------------------------------------
        // Input
        // --------------------------------------------------

        function handleKeyDown(
            event: KeyboardEvent
        ) {
            if (
                event.code === "Space" &&
                !event.repeat
            ) {
                launchMissile();
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        // --------------------------------------------------
        // Chase camera
        // --------------------------------------------------

        const chasePlane =
            new THREE.Object3D();

        scene.add(chasePlane);

        const chaseOffset =
            new THREE.Vector3(
                0,
                3,
                10
            );

        const chasePosition =
            new THREE.Vector3();

        const chaseQuaternion =
            new THREE.Quaternion();

        const chasePositionSmoothing = 30;
        const chaseRotationSmoothing = 30;

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

            const dt =
                Math.min(
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

            player.update(
                dt,
                {
                    pitch:
                    controls.pitch,

                    roll:
                    controls.roll,

                    yaw:
                    controls.yaw,

                    throttle:
                    controls.throttle,
                }
            );

            // ------------------------------------------------
            // Enemy movement
            // ------------------------------------------------

            if (enemy.alive) {
                enemy.angle +=
                    0.15 * dt;

                const radius = 500;

                enemy.position.set(
                    Math.sin(enemy.angle) *
                    radius,
                    300,
                    -800 +
                    Math.cos(enemy.angle) *
                    radius
                );

                const tangent =
                    new THREE.Vector3(
                        Math.cos(enemy.angle),
                        0,
                        -Math.sin(enemy.angle)
                    );

                tangent.normalize();

                enemy.quaternion.setFromUnitVectors(
                    new THREE.Vector3(
                        0,
                        0,
                        -1
                    ),
                    tangent
                );

                enemyGroup.position.copy(
                    enemy.position
                );

                enemyGroup.quaternion.copy(
                    enemy.quaternion
                );
            }

            // ------------------------------------------------
            // Lock-on
            // ------------------------------------------------

            if (enemy.alive) {
                const toEnemy =
                    enemy.position
                        .clone()
                        .sub(player.position);

                const distance =
                    toEnemy.length();

                if (
                    distance <= lockRange
                ) {
                    toEnemy.normalize();

                    const forward =
                        new THREE.Vector3(
                            0,
                            0,
                            -1
                        ).applyQuaternion(
                            player.quaternion
                        );

                    const dot =
                        forward.dot(
                            toEnemy
                        );

                    locked =
                        dot >=
                        Math.cos(
                            lockAngle
                        );
                } else {
                    locked = false;
                }
            } else {
                locked = false;
            }

            // ------------------------------------------------
            // Missiles
            // ------------------------------------------------

            for (
                let i = missiles.length - 1;
                i >= 0;
                i--
            ) {
                const missile =
                    missiles[i];

                missile.update(dt);

                const missileMesh =
                    missileMeshes[i];

                missileMesh.position.copy(
                    missile.position
                );

                missileMesh.quaternion.copy(
                    missile.quaternion
                );

                if (
                    enemy.alive &&
                    missile.position.distanceTo(
                        enemy.position
                    ) < 5
                ) {
                    enemy.alive = false;

                    enemyGroup.visible =
                        false;

                    missile.alive =
                        false;

                    locked = false;
                }

                if (!missile.alive) {
                    scene.remove(
                        missileMesh
                    );

                    missiles.splice(
                        i,
                        1
                    );

                    missileMeshes.splice(
                        i,
                        1
                    );
                }
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

            velocityArrow.setLength(
                20
            );

            // ------------------------------------------------
            // Chase camera
            // ------------------------------------------------

            chasePosition
                .copy(chaseOffset)
                .applyQuaternion(
                    player.quaternion
                )
                .add(player.position);

            chaseQuaternion.copy(
                player.quaternion
            );

            const positionAlpha =
                1 -
                Math.exp(
                    -chasePositionSmoothing *
                    dt
                );

            chasePlane.position.lerp(
                chasePosition,
                positionAlpha
            );

            const rotationAlpha =
                1 -
                Math.exp(
                    -chaseRotationSmoothing *
                    dt
                );

            chasePlane.quaternion.slerp(
                chaseQuaternion,
                rotationAlpha
            );

            camera.position.copy(
                chasePlane.position
            );

            camera.quaternion.copy(
                chasePlane.quaternion
            );

            // ------------------------------------------------
            // Target HUD
            // ------------------------------------------------

            if (
                hudRef.current &&
                enemy.alive
            ) {
                const targetPosition =
                    enemy.position.clone();

                const projected =
                    targetPosition.project(
                        camera
                    );

                const halfWidth =
                    window.innerWidth / 2;

                const halfHeight =
                    window.innerHeight / 2;

                const screenX =
                    projected.x *
                    halfWidth +
                    halfWidth;

                const screenY =
                    -projected.y *
                    halfHeight +
                    halfHeight;

                const onScreen =
                    projected.z >= -1 &&
                    projected.z <= 1 &&
                    screenX >= 0 &&
                    screenX <=
                    window.innerWidth &&
                    screenY >= 0 &&
                    screenY <=
                    window.innerHeight;

                const distance =
                    enemy.position.distanceTo(
                        player.position
                    );

                const marker =
                    hudRef.current;

                marker.style.display =
                    "block";

                if (onScreen) {
                    marker.style.left =
                        `${screenX}px`;

                    marker.style.top =
                        `${screenY}px`;

                    marker.style.transform =
                        "translate(-50%, -50%)";

                    marker.textContent =
                        locked
                            ? `◇ LOCK\n${distance.toFixed(0)}`
                            : `◇\n${distance.toFixed(0)}`;
                } else {
                    const dx =
                        screenX -
                        halfWidth;

                    const dy =
                        screenY -
                        halfHeight;

                    const angle =
                        Math.atan2(
                            dy,
                            dx
                        );

                    const margin = 40;

                    const radius =
                        Math.min(
                            halfWidth,
                            halfHeight
                        ) - margin;

                    const markerX =
                        halfWidth +
                        Math.cos(angle) *
                        radius;

                    const markerY =
                        halfHeight +
                        Math.sin(angle) *
                        radius;

                    marker.style.left =
                        `${markerX}px`;

                    marker.style.top =
                        `${markerY}px`;

                    marker.style.transform =
                        "translate(-50%, -50%)";

                    marker.textContent =
                        "◇";
                }
            } else if (
                hudRef.current
            ) {
                hudRef.current.style.display =
                    "none";
            }

            // ------------------------------------------------
            // Debug
            // ------------------------------------------------

            if (debugRef.current) {
                const enemyDistance =
                    enemy.position.distanceTo(
                        player.position
                    );

                debugRef.current.textContent =
                    [
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

                        "",

                        `ENEMY: ${
                            enemy.alive
                                ? "ALIVE"
                                : "DESTROYED"
                        }`,

                        `DIST: ${enemyDistance.toFixed(1)}`,

                        `LOCK: ${
                            locked
                                ? "YES"
                                : "NO"
                        }`,

                        `MISSILES: ${missiles.length}`,
                    ].join("\n");
            }

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

            window.removeEventListener(
                "keydown",
                handleKeyDown
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

            <div
                ref={hudRef}
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    zIndex: 10,
                    color: "red",
                    fontFamily: "monospace",
                    fontSize: "18px",
                    fontWeight: "bold",
                    textAlign: "center",
                    whiteSpace: "pre",
                    pointerEvents: "none",
                    textShadow:
                        "0 0 4px black",
                }}
            />
        </main>
    );
}