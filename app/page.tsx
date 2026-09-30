"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { Aircraft } from "@/src/engine/aircraft";
import { Controls } from "@/src/engine/controls";
import { Enemy } from "@/src/engine/enemy";
import { FighterAI } from "@/src/engine/fighterAI";
import { Missile } from "@/src/engine/missile";
import { Explosion } from "@/src/engine/explosion";
import { GunProjectile } from "@/src/engine/gunProjectile";
import { Player } from "@/src/engine/player";

export default function Home() {
    const containerRef =
        useRef<HTMLDivElement>(null);

    const debugRef =
        useRef<HTMLDivElement>(null);

    const hudRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container =
            containerRef.current;

        if (!container) return;

        // --------------------------------------------------
        // Scene
        // --------------------------------------------------

        const scene =
            new THREE.Scene();

        scene.background =
            new THREE.Color(
                0x87ceeb
            );

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

        scene.add(
            sunlight
        );

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

        scene.add(
            ground
        );

        // --------------------------------------------------
        // Player
        // --------------------------------------------------

        const player =
            new Player();

        const controls =
            new Controls();

        // --------------------------------------------------
        // Player aircraft render object
        // --------------------------------------------------

        const playerAircraft =
            new THREE.Group();

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

        playerAircraft.add(
            fuselage
        );

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

        playerAircraft.add(
            wings
        );

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

        playerAircraft.add(
            tail
        );

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

        playerAircraft.add(
            verticalTail
        );

        scene.add(
            playerAircraft
        );

        // --------------------------------------------------
        // Aircraft axes
        // --------------------------------------------------

        const axes =
            new THREE.AxesHelper(5);

        playerAircraft.add(
            axes
        );

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
        // Enemies
        // --------------------------------------------------

        const fighter =
            new Enemy(
                "fighter",
                new THREE.Vector3(
                    0,
                    300,
                    -1400
                )
            );

        const bomber =
            new Enemy(
                "bomber",
                new THREE.Vector3(
                    0,
                    150,
                    -1200
                )
            );

        scene.add(
            fighter.group
        );

        scene.add(
            bomber.group
        );

        const enemies =
            [
                fighter,
                bomber,
            ];

        // --------------------------------------------------
        // Fighter AI
        // --------------------------------------------------

        const fighterAI =
            new FighterAI(
                player
            );

        // --------------------------------------------------
        // Target selection
        // --------------------------------------------------

        type Target = {
            enemy: Enemy;
            name: string;
        };

        const targets: Target[] = [
            {
                enemy: fighter,
                name: "FIGHTER",
            },
            {
                enemy: bomber,
                name: "BOMBER",
            },
        ];

        let targetIndex = 0;

        let target =
            targets[targetIndex];

        let locked = false;

        const lockRange = 1000;

        const lockAngle =
            THREE.MathUtils.degToRad(
                18
            );

        // --------------------------------------------------
        // Target switching
        // --------------------------------------------------

        function selectNextTarget() {
            for (
                let i = 1;
                i <= targets.length;
                i++
            ) {
                const nextIndex =
                    (
                        targetIndex + i
                    ) %
                    targets.length;

                if (
                    targets[nextIndex]
                        .enemy
                        .alive
                ) {
                    targetIndex =
                        nextIndex;

                    target =
                        targets[
                            targetIndex
                            ];

                    locked = false;

                    return;
                }
            }
        }

        function ensureValidTarget() {
            if (
                target.enemy.alive
            ) {
                return;
            }

            selectNextTarget();
        }

        // --------------------------------------------------
        // Missiles
        // --------------------------------------------------

        const missiles: Missile[] = [];

        const missileMeshes:
            THREE.Mesh[] = [];

        const missileTrails:
            THREE.Mesh[][] = [];

        const enemyMissiles: Missile[] = [];

        const enemyMissileMeshes:
            THREE.Mesh[] = [];

        const enemyMissileTrails:
            THREE.Mesh[][] = [];

        const missileGeometry =
            new THREE.CapsuleGeometry(
                0.15,
                1.5,
                4,
                8
            );

        const missileMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xeeeeee,
            });

        // --------------------------------------------------
        // Missile trail
        // --------------------------------------------------

        const trailParticleGeometry =
            new THREE.SphereGeometry(
                0.35,
                8,
                8
            );

        const trailParticleMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8,
            });

        // --------------------------------------------------
        // Gun
        // --------------------------------------------------

        const projectiles:
            GunProjectile[] = [];

        const projectileMeshes:
            THREE.Mesh[] = [];

        const enemyProjectiles:
            GunProjectile[] = [];

        const enemyProjectileMeshes:
            THREE.Mesh[] = [];

        const projectileGeometry =
            new THREE.SphereGeometry(
                0.3,
                6,
                6
            );

        const projectileMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xffffaa,
            });

        const playerGunFireRate = 15;
        const playerGunMuzzleSpeed = 500;

        let gunFiring = false;
        let gunCooldown = 0;

        // --------------------------------------------------
        // Explosions
        // --------------------------------------------------

        const explosions:
            Explosion[] = [];

        function destroyPlayer() {
            playerAircraft.visible =
                false;

            velocityArrow.visible =
                false;

            gunFiring = false;
            locked = false;

            leadIndicator.style.display =
                "none";

            missileWarning.style.display =
                "none";

            missileDirection.style.display =
                "none";

            fighterHud.style.display =
                "none";

            bomberHud.style.display =
                "none";

            targetBox.style.display =
                "none";

            const explosion =
                new Explosion(
                    player.position
                );

            scene.add(
                explosion.group
            );

            explosions.push(
                explosion
            );
        }

        // --------------------------------------------------
        // Gun reticle
        // --------------------------------------------------

        const reticle =
            document.createElement(
                "div"
            );

        reticle.style.position =
            "fixed";

        reticle.style.left =
            "50%";

        reticle.style.top =
            "50%";

        reticle.style.width =
            "18px";

        reticle.style.height =
            "18px";

        reticle.style.border =
            "2px solid white";

        reticle.style.transform =
            "translate(-50%, -50%)";

        reticle.style.pointerEvents =
            "none";

        reticle.style.boxSizing =
            "border-box";

        document.body.appendChild(
            reticle
        );

        // --------------------------------------------------
        // Lead indicator
        // --------------------------------------------------

        const leadIndicator =
            document.createElement(
                "div"
            );

        leadIndicator.style.position =
            "fixed";

        leadIndicator.style.width =
            "30px";

        leadIndicator.style.height =
            "30px";

        leadIndicator.style.border =
            "2px solid white";

        leadIndicator.style.borderRadius =
            "50%";

        leadIndicator.style.transform =
            "translate(-50%, -50%)";

        leadIndicator.style.pointerEvents =
            "none";

        leadIndicator.style.display =
            "none";

        leadIndicator.style.boxSizing =
            "border-box";

        document.body.appendChild(
            leadIndicator
        );

        // --------------------------------------------------
        // Missile warning
        // --------------------------------------------------

        const missileWarning =
            document.createElement(
                "div"
            );

        missileWarning.style.position =
            "fixed";

        missileWarning.style.left =
            "50%";

        missileWarning.style.top =
            "80%";

        missileWarning.style.transform =
            "translate(-50%, -50%)";

        missileWarning.style.color =
            "white";

        missileWarning.style.fontFamily =
            "monospace";

        missileWarning.style.fontSize =
            "24px";

        missileWarning.style.fontWeight =
            "bold";

        missileWarning.style.textAlign =
            "center";

        missileWarning.style.pointerEvents =
            "none";

        missileWarning.style.zIndex =
            "20";

        missileWarning.style.textShadow =
            "0 0 4px black";

        missileWarning.style.display =
            "none";

        document.body.appendChild(
            missileWarning
        );

        const missileDirection =
            document.createElement(
                "div"
            );

        missileDirection.style.position =
            "fixed";

        missileDirection.style.left =
            "50%";

        missileDirection.style.top =
            "50%";

        missileDirection.style.width =
            "0";

        missileDirection.style.height =
            "0";

        missileDirection.style.borderLeft =
            "12px solid transparent";

        missileDirection.style.borderRight =
            "12px solid transparent";

        missileDirection.style.borderBottom =
            "24px solid white";

        missileDirection.style.transformOrigin =
            "50% 50%";

        missileDirection.style.pointerEvents =
            "none";

        missileDirection.style.zIndex =
            "20";

        missileDirection.style.filter =
            "drop-shadow(0 0 3px black)";

        missileDirection.style.display =
            "none";

        document.body.appendChild(
            missileDirection
        );

        // --------------------------------------------------
        // Fighter HUD
        // --------------------------------------------------

        const fighterHud =
            hudRef.current!;

        fighterHud.style.display =
            "none";

        // --------------------------------------------------
        // Bomber HUD
        // --------------------------------------------------

        const bomberHud =
            document.createElement(
                "div"
            );

        bomberHud.style.position =
            "fixed";

        bomberHud.style.zIndex =
            "10";

        bomberHud.style.color =
            "red";

        bomberHud.style.fontFamily =
            "monospace";

        bomberHud.style.fontSize =
            "18px";

        bomberHud.style.fontWeight =
            "bold";

        bomberHud.style.textAlign =
            "center";

        bomberHud.style.whiteSpace =
            "pre";

        bomberHud.style.pointerEvents =
            "none";

        bomberHud.style.textShadow =
            "0 0 4px black";

        bomberHud.style.display =
            "none";

        document.body.appendChild(
            bomberHud
        );

        // --------------------------------------------------
        // Selected target box
        // --------------------------------------------------

        const targetBox =
            document.createElement(
                "div"
            );

        targetBox.style.position =
            "fixed";

        targetBox.style.width =
            "70px";

        targetBox.style.height =
            "70px";

        targetBox.style.border =
            "2px solid red";

        targetBox.style.transform =
            "translate(-50%, -50%)";

        targetBox.style.pointerEvents =
            "none";

        targetBox.style.boxSizing =
            "border-box";

        targetBox.style.zIndex =
            "9";

        targetBox.style.display =
            "none";

        document.body.appendChild(
            targetBox
        );

        // --------------------------------------------------
        // HUD helper
        // --------------------------------------------------

        function updateTargetHud(
            hud: HTMLDivElement,
            targetAircraft: Aircraft,
            name: string,
            selected: boolean,
            targetLocked: boolean
        ) {
            const targetPosition =
                targetAircraft.position.clone();

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
                targetAircraft.position.distanceTo(
                    player.position
                );

            hud.style.display =
                "block";

            if (onScreen) {
                hud.style.left =
                    `${screenX}px`;

                hud.style.top =
                    `${screenY}px`;

                hud.style.transform =
                    "translate(-50%, -50%)";

                if (
                    selected &&
                    targetLocked
                ) {
                    hud.textContent =
                        `◇ LOCK ${name}\n${distance.toFixed(
    0
)}`;
                } else {
                    hud.textContent =
                        `◇ ${name}\n${distance.toFixed(
    0
)}`;
                }
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

                hud.style.left =
                    `${markerX}px`;

                hud.style.top =
                    `${markerY}px`;

                hud.style.transform =
                    "translate(-50%, -50%)";

                hud.textContent =
                    selected &&
                    targetLocked
                        ? "◇ LOCK"
                        : `◇ ${name}`;
            }
        }

        // --------------------------------------------------
        // Launch missile
        // --------------------------------------------------

        function launchMissile() {
            ensureValidTarget();

            if (
                !player.alive ||
                !locked ||
                !target.enemy.alive
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
                    target.enemy.aircraft
                        .position
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

            // ------------------------------------------------
            // Missile trail
            // ------------------------------------------------

            const trail:
                THREE.Mesh[] = [];

            const trailLength = 25;

            for (
                let i = 0;
                i < trailLength;
                i++
            ) {
                const particle =
                    new THREE.Mesh(
                        trailParticleGeometry,
                        trailParticleMaterial.clone()
                    );

                particle.position.copy(
                    launchPosition
                );

                particle.scale.setScalar(
                    0
                );

                scene.add(
                    particle
                );

                trail.push(
                    particle
                );
            }

            missileTrails.push(
                trail
            );
        }

        // --------------------------------------------------
        // Fire gun
        // --------------------------------------------------

        function fireGun() {
            if (
                !player.alive ||
                !enemies.some(
                    enemy =>
                        enemy.alive
                )
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
                        4
                    );

            const playerVelocity =
                forward
                    .clone()
                    .multiplyScalar(
                        player.speed
                    );

            const projectile =
                new GunProjectile(
                    launchPosition,
                    forward,
                    playerVelocity
                );

            projectiles.push(
                projectile
            );

            const mesh =
                new THREE.Mesh(
                    projectileGeometry,
                    projectileMaterial
                );

            mesh.position.copy(
                projectile.position
            );

            scene.add(
                mesh
            );

            projectileMeshes.push(
                mesh
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

            if (
                event.code === "KeyF"
            ) {
                gunFiring = true;
            }

            if (
                event.code === "Tab" &&
                !event.repeat
            ) {
                event.preventDefault();

                selectNextTarget();
            }
        }

        function handleKeyUp(
            event: KeyboardEvent
        ) {
            if (
                event.code === "KeyF"
            ) {
                gunFiring = false;
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        window.addEventListener(
            "keyup",
            handleKeyUp
        );

        // --------------------------------------------------
        // Chase camera
        // --------------------------------------------------

        const chasePlane =
            new THREE.Object3D();

        scene.add(
            chasePlane
        );

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

        const chasePositionSmoothing =
            30;

        const chaseRotationSmoothing =
            30;

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
            // Update player
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
            // Update enemies
            // ------------------------------------------------

            if (fighter.alive) {
                const ai =
                    fighterAI.update(
                        fighter.aircraft
                    );

                fighter.update(
                    dt,
                    ai.controls
                );

                if (ai.fireGun) {
                    const projectile =
                        fighter.fireGun();

                    if (projectile) {
                        enemyProjectiles.push(
                            projectile
                        );

                        const mesh =
                            new THREE.Mesh(
                                projectileGeometry,
                                projectileMaterial
                            );

                        scene.add(
                            mesh
                        );

                        enemyProjectileMeshes.push(
                            mesh
                        );
                    }
                }

                if (ai.fireMissile) {
                    const missile =
                        fighter.fireMissile(
                            player.position
                        );

                    if (missile) {
                        enemyMissiles.push(
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

                        enemyMissileMeshes.push(
                            missileMesh
                        );

                        const trail:
                            THREE.Mesh[] = [];

                        const trailLength = 25;

                        for (
                            let i = 0;
                            i < trailLength;
                            i++
                        ) {
                            const particle =
                                new THREE.Mesh(
                                    trailParticleGeometry,
                                    trailParticleMaterial.clone()
                                );

                            particle.position.copy(
                                missile.position
                            );

                            particle.scale.setScalar(
                                0
                            );

                            scene.add(
                                particle
                            );

                            trail.push(
                                particle
                            );
                        }

                        enemyMissileTrails.push(
                            trail
                        );
                    }
                }
            }

            if (bomber.alive) {
                bomber.update(
                    dt,
                    {
                        pitch: 0,
                        roll: 0,
                        yaw: 0,
                        throttle: 0,
                    }
                );
            }

            // ------------------------------------------------
            // Target validity
            // ------------------------------------------------

            ensureValidTarget();

            // ------------------------------------------------
            // Lock-on
            // ------------------------------------------------

            locked = false;

            if (
                player.alive &&
                target.enemy.alive
            ) {
                const toTarget =
                    target.enemy.aircraft
                        .position
                        .clone()
                        .sub(
                            player.position
                        );

                const distance =
                    toTarget.length();

                if (
                    distance <=
                    lockRange
                ) {
                    toTarget.normalize();

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
                            toTarget
                        );

                    locked =
                        dot >=
                        Math.cos(
                            lockAngle
                        );
                }
            }

            // ------------------------------------------------
            // Gun
            // ------------------------------------------------

            gunCooldown -= dt;

            if (
                player.alive &&
                gunFiring &&
                enemies.some(
                    enemy =>
                        enemy.alive
                ) &&
                gunCooldown <= 0
            ) {
                fireGun();

                gunCooldown =
                    1 /
                    playerGunFireRate;
            }

            // ------------------------------------------------
            // Gun projectiles
            // ------------------------------------------------

            for (
                let i =
                    projectiles.length - 1;
                i >= 0;
                i--
            ) {
                const projectile =
                    projectiles[i];

                projectile.update(dt);

                const projectileMesh =
                    projectileMeshes[i];

                projectileMesh.position.copy(
                    projectile.position
                );

                // ------------------------------------------------
                // Enemy collision
                // ------------------------------------------------

                for (
                    const enemy of enemies
                    ) {
                    if (
                        !enemy.alive
                    ) {
                        continue;
                    }

                    if (
                        projectile.position.distanceTo(
                            enemy.aircraft
                                .position
                        ) <
                        enemy.collisionRadius
                    ) {
                        enemy.takeDamage(
                            10
                        );

                        projectile.alive =
                            false;

                        if (
                            !enemy.alive
                        ) {
                            const explosion =
                                new Explosion(
                                    enemy.aircraft
                                        .position
                                );

                            scene.add(
                                explosion.group
                            );

                            explosions.push(
                                explosion
                            );

                            if (
                                target.enemy ===
                                enemy
                            ) {
                                locked =
                                    false;

                                ensureValidTarget();
                            }
                        }

                        break;
                    }
                }

                // ------------------------------------------------
                // Remove dead projectile
                // ------------------------------------------------

                if (
                    !projectile.alive
                ) {
                    scene.remove(
                        projectileMesh
                    );

                    projectiles.splice(
                        i,
                        1
                    );

                    projectileMeshes.splice(
                        i,
                        1
                    );
                }
            }

            // ------------------------------------------------
            // Enemy gun projectiles
            // ------------------------------------------------

            for (
                let i =
                    enemyProjectiles.length - 1;
                i >= 0;
                i--
            ) {
                const projectile =
                    enemyProjectiles[i];

                projectile.update(dt);

                const projectileMesh =
                    enemyProjectileMeshes[i];

                projectileMesh.position.copy(
                    projectile.position
                );

                if (
                    player.alive &&
                    projectile.position.distanceTo(
                        player.position
                    ) <
                    player.collisionRadius
                ) {
                    projectile.alive =
                        false;

                    const wasAlive =
                        player.alive;

                    player.takeDamage(
                        10
                    );

                    if (
                        wasAlive &&
                        !player.alive
                    ) {
                        destroyPlayer();
                    }
                }

                if (
                    !projectile.alive
                ) {
                    scene.remove(
                        projectileMesh
                    );

                    enemyProjectiles.splice(
                        i,
                        1
                    );

                    enemyProjectileMeshes.splice(
                        i,
                        1
                    );
                }
            }

            // ------------------------------------------------
            // Lead indicator
            // ------------------------------------------------

            if (
                player.alive &&
                target.enemy.alive
            ) {
                const targetAircraft =
                    target.enemy.aircraft;

                const relativePosition =
                    targetAircraft.position
                        .clone()
                        .sub(
                            player.position
                        );

                const playerVelocity =
                    new THREE.Vector3(
                        0,
                        0,
                        -1
                    )
                        .applyQuaternion(
                            player.quaternion
                        )
                        .multiplyScalar(
                            player.speed
                        );

                const targetVelocity =
                    new THREE.Vector3(
                        0,
                        0,
                        -1
                    )
                        .applyQuaternion(
                            targetAircraft
                                .quaternion
                        )
                        .multiplyScalar(
                            targetAircraft.speed
                        );

                const relativeVelocity =
                    targetVelocity
                        .clone()
                        .sub(
                            playerVelocity
                        );

                const projectileSpeed =
                    playerGunMuzzleSpeed;

                const a =
                    relativeVelocity.lengthSq() -
                    projectileSpeed *
                    projectileSpeed;

                const b =
                    2 *
                    relativePosition.dot(
                        relativeVelocity
                    );

                const c =
                    relativePosition.lengthSq();

                let interceptTime = 0;

                if (
                    Math.abs(a) <
                    0.000001
                ) {
                    if (
                        Math.abs(b) >
                        0.000001
                    ) {
                        interceptTime =
                            -c / b;
                    }
                } else {
                    const discriminant =
                        b * b -
                        4 *
                        a *
                        c;

                    if (
                        discriminant >=
                        0
                    ) {
                        const sqrt =
                            Math.sqrt(
                                discriminant
                            );

                        const t1 =
                            (
                                -b -
                                sqrt
                            ) /
                            (2 * a);

                        const t2 =
                            (
                                -b +
                                sqrt
                            ) /
                            (2 * a);

                        if (
                            t1 > 0 &&
                            t2 > 0
                        ) {
                            interceptTime =
                                Math.min(
                                    t1,
                                    t2
                                );
                        } else if (
                            t1 > 0
                        ) {
                            interceptTime =
                                t1;
                        } else if (
                            t2 > 0
                        ) {
                            interceptTime =
                                t2;
                        }
                    }
                }

                if (
                    interceptTime > 0 &&
                    interceptTime < 5
                ) {
                    const predictedTarget =
                        targetAircraft
                            .position
                            .clone()
                            .addScaledVector(
                                targetVelocity,
                                interceptTime
                            );

                    const projected =
                        predictedTarget.project(
                            camera
                        );

                    if (
                        projected.z >= -1 &&
                        projected.z <= 1
                    ) {
                        const screenX =
                            (
                                projected.x *
                                0.5 +
                                0.5
                            ) *
                            window.innerWidth;

                        const screenY =
                            (
                                -projected.y *
                                0.5 +
                                0.5
                            ) *
                            window.innerHeight;

                        leadIndicator.style.left =
                            `${screenX}px`;

                        leadIndicator.style.top =
                            `${screenY}px`;

                        leadIndicator.style.display =
                            "block";
                    } else {
                        leadIndicator.style.display =
                            "none";
                    }
                } else {
                    leadIndicator.style.display =
                        "none";
                }
            } else {
                leadIndicator.style.display =
                    "none";
            }

            // ------------------------------------------------
            // Player missiles
            // ------------------------------------------------

            for (
                let i =
                    missiles.length - 1;
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

                // ------------------------------------------------
                // Update trail
                // ------------------------------------------------

                const trail =
                    missileTrails[i];

                for (
                    let j =
                        trail.length - 1;
                    j > 0;
                    j--
                ) {
                    trail[j].position.copy(
                        trail[j - 1]
                            .position
                    );

                    trail[j].scale.copy(
                        trail[j - 1]
                            .scale
                    );

                    const previousMaterial =
                        trail[j - 1]
                            .material as
                            THREE.MeshBasicMaterial;

                    const material =
                        trail[j]
                            .material as
                            THREE.MeshBasicMaterial;

                    material.opacity =
                        previousMaterial
                            .opacity *
                        0.94;
                }

                trail[0].position.copy(
                    missile.position
                );

                trail[0].scale.setScalar(
                    1
                );

                (
                    trail[0].material as
                        THREE.MeshBasicMaterial
                ).opacity = 0.8;

                for (
                    let j = 1;
                    j < trail.length;
                    j++
                ) {
                    const age =
                        j /
                        trail.length;

                    const scale =
                        0.85 -
                        age * 0.6;

                    trail[j].scale.setScalar(
                        Math.max(
                            scale,
                            0.15
                        )
                    );
                }

                // ------------------------------------------------
                // Enemy collision
                // ------------------------------------------------

                for (
                    const enemy of enemies
                    ) {
                    if (
                        !enemy.alive
                    ) {
                        continue;
                    }

                    if (
                        missile.position.distanceTo(
                            enemy.aircraft
                                .position
                        ) <
                        enemy.collisionRadius
                    ) {
                        enemy.destroy();

                        missile.alive =
                            false;

                        const explosion =
                            new Explosion(
                                enemy.aircraft
                                    .position
                            );

                        scene.add(
                            explosion.group
                        );

                        explosions.push(
                            explosion
                        );

                        if (
                            target.enemy ===
                            enemy
                        ) {
                            locked =
                                false;

                            ensureValidTarget();
                        }

                        break;
                    }
                }

                // ------------------------------------------------
                // Remove dead missile
                // ------------------------------------------------

                if (
                    !missile.alive
                ) {
                    scene.remove(
                        missileMesh
                    );

                    for (
                        const particle of
                        missileTrails[i]
                        ) {
                        scene.remove(
                            particle
                        );

                        particle.geometry.dispose();

                        (
                            particle.material as
                                THREE.Material
                        ).dispose();
                    }

                    missiles.splice(
                        i,
                        1
                    );

                    missileMeshes.splice(
                        i,
                        1
                    );

                    missileTrails.splice(
                        i,
                        1
                    );
                }
            }

            // ------------------------------------------------
            // Enemy missiles
            // ------------------------------------------------

            for (
                let i =
                    enemyMissiles.length - 1;
                i >= 0;
                i--
            ) {
                const missile =
                    enemyMissiles[i];

                missile.update(dt);

                const missileMesh =
                    enemyMissileMeshes[i];

                missileMesh.position.copy(
                    missile.position
                );

                missileMesh.quaternion.copy(
                    missile.quaternion
                );

                // ------------------------------------------------
                // Update trail
                // ------------------------------------------------

                const trail =
                    enemyMissileTrails[i];

                for (
                    let j =
                        trail.length - 1;
                    j > 0;
                    j--
                ) {
                    trail[j].position.copy(
                        trail[j - 1]
                            .position
                    );

                    trail[j].scale.copy(
                        trail[j - 1]
                            .scale
                    );

                    const previousMaterial =
                        trail[j - 1]
                            .material as
                            THREE.MeshBasicMaterial;

                    const material =
                        trail[j]
                            .material as
                            THREE.MeshBasicMaterial;

                    material.opacity =
                        previousMaterial
                            .opacity *
                        0.94;
                }

                trail[0].position.copy(
                    missile.position
                );

                trail[0].scale.setScalar(
                    1
                );

                (
                    trail[0].material as
                        THREE.MeshBasicMaterial
                ).opacity = 0.8;

                for (
                    let j = 1;
                    j < trail.length;
                    j++
                ) {
                    const age =
                        j /
                        trail.length;

                    const scale =
                        0.85 -
                        age * 0.6;

                    trail[j].scale.setScalar(
                        Math.max(
                            scale,
                            0.15
                        )
                    );
                }

                // ------------------------------------------------
                // Player collision
                // ------------------------------------------------

                if (
                    player.alive &&
                    missile.position.distanceTo(
                        player.position
                    ) <
                    player.collisionRadius
                ) {
                    missile.alive =
                        false;

                    const wasAlive =
                        player.alive;

                    player.takeDamage(
                        100
                    );

                    if (
                        wasAlive &&
                        !player.alive
                    ) {
                        destroyPlayer();
                    }
                }

                // ------------------------------------------------
                // Remove dead missile
                // ------------------------------------------------

                if (
                    !missile.alive
                ) {
                    scene.remove(
                        missileMesh
                    );

                    for (
                        const particle of
                        enemyMissileTrails[i]
                        ) {
                        scene.remove(
                            particle
                        );

                        particle.geometry.dispose();

                        (
                            particle.material as
                                THREE.Material
                        ).dispose();
                    }

                    enemyMissiles.splice(
                        i,
                        1
                    );

                    enemyMissileMeshes.splice(
                        i,
                        1
                    );

                    enemyMissileTrails.splice(
                        i,
                        1
                    );
                }
            }

            // ------------------------------------------------
            // Incoming missile warning
            // ------------------------------------------------

            if (
                player.alive &&
                enemyMissiles.length > 0
            ) {
                missileWarning.style.display =
                    "block";

                let closestMissile:
                    Missile | null = null;

                let closestDistance =
                    Infinity;

                for (
                    const missile of
                    enemyMissiles
                    ) {
                    const distance =
                        missile.position.distanceTo(
                            player.position
                        );

                    if (
                        distance <
                        closestDistance
                    ) {
                        closestDistance =
                            distance;

                        closestMissile =
                            missile;
                    }
                }

                missileWarning.textContent =
                    enemyMissiles.length === 1
                        ? `MISSILE\n${closestDistance.toFixed(
    0
)}m`
                        : `MISSILES × ${enemyMissiles.length}\n${closestDistance.toFixed(
    0
)}m`;

                if (
                    closestMissile
                ) {
                    const toMissile =
                        closestMissile
                            .position
                            .clone()
                            .sub(
                                player.position
                            )
                            .normalize();

                    const localMissile =
                        toMissile
                            .clone()
                            .applyQuaternion(
                                player.quaternion
                                    .clone()
                                    .invert()
                            );

                    const angle =
                        Math.atan2(
                            localMissile.x,
                            -localMissile.z
                        );

                    const centerX =
                        window.innerWidth /
                        2;

                    const centerY =
                        window.innerHeight /
                        2;

                    const radius =
                        Math.min(
                            centerX,
                            centerY
                        ) * 0.7;

                    const x =
                        centerX +
                        Math.sin(angle) *
                        radius;

                    const y =
                        centerY -
                        Math.cos(angle) *
                        radius;

                    missileDirection.style.left =
                        `${x}px`;

                    missileDirection.style.top =
                        `${y}px`;

                    missileDirection.style.transform =
                        `translate(-50%, -50%) rotate(${angle}rad)`;

                    missileDirection.style.display =
                        "block";
                }
            } else {
                missileWarning.style.display =
                    "none";

                missileDirection.style.display =
                    "none";
            }

            // ------------------------------------------------
            // Explosions
            // ------------------------------------------------

            for (
                let i =
                    explosions.length - 1;
                i >= 0;
                i--
            ) {
                const explosion =
                    explosions[i];

                explosion.update(dt);

                if (
                    !explosion.alive
                ) {
                    scene.remove(
                        explosion.group
                    );

                    explosions.splice(
                        i,
                        1
                    );
                }
            }

            // ------------------------------------------------
            // Player render object
            // ------------------------------------------------

            if (player.alive) {
                playerAircraft.position.copy(
                    player.position
                );

                playerAircraft.quaternion.copy(
                    player.quaternion
                );
            }

            // ------------------------------------------------
            // Velocity direction
            // ------------------------------------------------

            if (player.alive) {
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
            }

            // ------------------------------------------------
            // Chase camera
            // ------------------------------------------------

            if (player.alive) {
                chasePosition
                    .copy(chaseOffset)
                    .applyQuaternion(
                        player.quaternion
                    )
                    .add(
                        player.position
                    );

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
            }

            // ------------------------------------------------
            // Fighter HUD
            // ------------------------------------------------

            if (
                player.alive &&
                fighter.alive
            ) {
                updateTargetHud(
                    fighterHud,
                    fighter.aircraft,
                    "FIGHTER",
                    target.enemy ===
                    fighter,
                    locked &&
                    target.enemy ===
                    fighter
                );
            } else {
                fighterHud.style.display =
                    "none";
            }

            // ------------------------------------------------
            // Bomber HUD
            // ------------------------------------------------

            if (
                player.alive &&
                bomber.alive
            ) {
                updateTargetHud(
                    bomberHud,
                    bomber.aircraft,
                    "BOMBER",
                    target.enemy ===
                    bomber,
                    locked &&
                    target.enemy ===
                    bomber
                );
            } else {
                bomberHud.style.display =
                    "none";
            }

            // ------------------------------------------------
            // Selected target box
            // ------------------------------------------------

            if (
                player.alive &&
                target.enemy.alive
            ) {
                const projected =
                    target.enemy.aircraft
                        .position
                        .clone()
                        .project(camera);

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

                let boxX =
                    screenX;

                let boxY =
                    screenY;

                if (!onScreen) {
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

                    boxX =
                        halfWidth +
                        Math.cos(angle) *
                        radius;

                    boxY =
                        halfHeight +
                        Math.sin(angle) *
                        radius;
                }

                targetBox.style.left =
                    `${boxX}px`;

                targetBox.style.top =
                    `${boxY}px`;

                targetBox.style.display =
                    "block";
            } else {
                targetBox.style.display =
                    "none";
            }

            // ------------------------------------------------
            // Debug
            // ------------------------------------------------

            if (
                debugRef.current
            ) {
                const fighterDistance =
                    fighter.aircraft.position
                        .distanceTo(
                            player.position
                        );

                const bomberDistance =
                    bomber.aircraft.position
                        .distanceTo(
                            player.position
                        );

                debugRef.current.textContent =
                    [
                        `FPS: ${(
    1 / dt
).toFixed(0)}`,

                        "",

                        `PITCH:   ${controls.pitch.toFixed(
    0
)}`,

                        `ROLL:    ${controls.roll.toFixed(
    0
)}`,

                        `YAW:     ${controls.yaw.toFixed(
    0
)}`,

                        `THROTTLE:${controls.throttle.toFixed(
    0
)}`,

                        "",

                        `SPEED:   ${player.speed.toFixed(
    1
)}`,

                        `THROTTLE:${player.throttle.toFixed(
    2
)}`,

                        "",

                        `X: ${player.position.x.toFixed(
    1
)}`,

                        `Y: ${player.position.y.toFixed(
    1
)}`,

                        `Z: ${player.position.z.toFixed(
    1
)}`,

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

                        `TARGET: ${target.name}`,

                        `LOCK: ${
    locked
        ? "YES"
        : "NO"
}`,

                        "",

                        `PLAYER: ${
    player.alive
        ? "ALIVE"
        : "DESTROYED"
}`,

                        `PLAYER HP: ${player.health}`,

                        "",

                        `FIGHTER: ${
    fighter.alive
        ? "ALIVE"
        : "DESTROYED"
}`,

                        `FIGHTER HP: ${fighter.health}`,

                        `FIGHTER DIST: ${fighterDistance.toFixed(
    1
)}`,

                        "",

                        `BOMBER: ${
    bomber.alive
        ? "ALIVE"
        : "DESTROYED"
}`,

                        `BOMBER HP: ${bomber.health}`,

                        `BOMBER DIST: ${bomberDistance.toFixed(
    1
)}`,

                        "",

                        `MISSILES: ${missiles.length}`,

                        `ENEMY MISSILES: ${enemyMissiles.length}`,

                        `GUN: ${
    gunFiring
        ? "FIRING"
        : "READY"
}`,

                        `ROUNDS: ${projectiles.length}`,

                        `ENEMY ROUNDS: ${enemyProjectiles.length}`,

                        `EXPLOSIONS: ${explosions.length}`,
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

            window.removeEventListener(
                "keyup",
                handleKeyUp
            );

            fighterHud.style.display =
                "none";

            reticle.remove();
            leadIndicator.remove();
            missileWarning.remove();
            missileDirection.remove();
            bomberHud.remove();
            targetBox.remove();

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
                    fontFamily:
                        "monospace",
                    fontSize: "18px",
                    fontWeight: "bold",
                    textAlign: "center",
                    whiteSpace: "pre",
                    pointerEvents:
                        "none",
                    textShadow:
                        "0 0 4px black",
                }}
            />
        </main>
    );
}