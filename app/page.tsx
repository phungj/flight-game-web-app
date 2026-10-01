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
                100000
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
        // Water
        // --------------------------------------------------

        const ground =
            new THREE.Mesh(
                new THREE.PlaneGeometry(
                    100000,
                    100000
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x2874a6,
                })
            );

        ground.rotation.x =
            -Math.PI / 2;

        scene.add(ground);

        // --------------------------------------------------
        // Player
        // --------------------------------------------------

        const player =
            new Player();

        player.aircraft.position.set(
            0,
            500,
            0
        );

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

        playerAircraft.add(wings);

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

        playerAircraft.add(tail);

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
        // Scenario
        // --------------------------------------------------

        const fighter =
            new Enemy(
                "fighter",
                new THREE.Vector3(
                    500,
                    750,
                    -3200
                )
            );

        const bomber =
            new Enemy(
                "bomber",
                new THREE.Vector3(
                    0,
                    700,
                    -4000
                )
            );

        scene.add(
            fighter.group
        );

        scene.add(
            bomber.group
        );

        const enemies = [
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

        const lockRange = 1500;

        const lockAngle =
            THREE.MathUtils.degToRad(
                18
            );

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

        const deathPosition =
            new THREE.Vector3();

        const deathQuaternion =
            new THREE.Quaternion();

        let playerHasDied = false;

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
        // HUD
        // --------------------------------------------------

        const fighterHud =
            hudRef.current!;

        fighterHud.style.display =
            "none";

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
        // Radar
        // --------------------------------------------------

        const radar =
            document.createElement(
                "div"
            );

        radar.style.position =
            "fixed";

        radar.style.left =
            "28px";

        radar.style.bottom =
            "28px";

        radar.style.width =
            "180px";

        radar.style.height =
            "180px";

        radar.style.border =
            "2px solid rgba(255, 255, 255, 0.65)";

        radar.style.borderRadius =
            "50%";

        radar.style.background =
            "rgba(0, 0, 0, 0.35)";

        radar.style.boxSizing =
            "border-box";

        radar.style.pointerEvents =
            "none";

        radar.style.zIndex =
            "10";

        radar.style.overflow =
            "hidden";

        document.body.appendChild(
            radar
        );

        // --------------------------------------------------
        // Radar grid
        // --------------------------------------------------

        const radarGrid =
            document.createElement(
                "div"
            );

        radarGrid.style.position =
            "absolute";

        radarGrid.style.left =
            "0";

        radarGrid.style.top =
            "0";

        radarGrid.style.width =
            "100%";

        radarGrid.style.height =
            "100%";

        radarGrid.style.pointerEvents =
            "none";

        radarGrid.style.overflow =
            "hidden";

        radar.appendChild(
            radarGrid
        );

        const radarCircleRadii = [
            0.25,
            0.5,
            0.75,
        ];

        for (
            const fraction of
            radarCircleRadii
            ) {
            const circle =
                document.createElement(
                    "div"
                );

            const diameter =
                180 * fraction;

            circle.style.position =
                "absolute";

            circle.style.width =
                `${diameter}px`;

            circle.style.height =
                `${diameter}px`;

            circle.style.left =
                `${90 - diameter / 2}px`;

            circle.style.top =
                `${90 - diameter / 2}px`;

            circle.style.border =
                "1px solid rgba(255, 255, 255, 0.15)";

            circle.style.borderRadius =
                "50%";

            circle.style.boxSizing =
                "border-box";

            radarGrid.appendChild(
                circle
            );
        }

        // --------------------------------------------------
        // Radar crosshair
        // --------------------------------------------------

        const radarHorizontal =
            document.createElement(
                "div"
            );

        radarHorizontal.style.position =
            "absolute";

        radarHorizontal.style.left =
            "0";

        radarHorizontal.style.top =
            "50%";

        radarHorizontal.style.width =
            "100%";

        radarHorizontal.style.height =
            "1px";

        radarHorizontal.style.transform =
            "translateY(-50%)";

        radarHorizontal.style.background =
            "rgba(255, 255, 255, 0.15)";

        radarGrid.appendChild(
            radarHorizontal
        );

        const radarVertical =
            document.createElement(
                "div"
            );

        radarVertical.style.position =
            "absolute";

        radarVertical.style.left =
            "50%";

        radarVertical.style.top =
            "0";

        radarVertical.style.width =
            "1px";

        radarVertical.style.height =
            "100%";

        radarVertical.style.transform =
            "translateX(-50%)";

        radarVertical.style.background =
            "rgba(255, 255, 255, 0.15)";

        radarGrid.appendChild(
            radarVertical
        );

        // --------------------------------------------------
        // Radar player
        // --------------------------------------------------

        const radarPlayer =
            document.createElement(
                "div"
            );

        radarPlayer.style.position =
            "absolute";

        radarPlayer.style.left =
            "50%";

        radarPlayer.style.top =
            "50%";

        radarPlayer.style.width =
            "0";

        radarPlayer.style.height =
            "0";

        radarPlayer.style.borderLeft =
            "6px solid transparent";

        radarPlayer.style.borderRight =
            "6px solid transparent";

        radarPlayer.style.borderBottom =
            "12px solid white";

        radarPlayer.style.transform =
            "translate(-50%, -50%)";

        radarPlayer.style.zIndex =
            "3";

        radar.appendChild(
            radarPlayer
        );

        const radarLabel =
            document.createElement(
                "div"
            );

        radarLabel.style.position =
            "absolute";

        radarLabel.style.left =
            "50%";

        radarLabel.style.top =
            "5px";

        radarLabel.style.transform =
            "translateX(-50%)";

        radarLabel.style.color =
            "rgba(255, 255, 255, 0.65)";

        radarLabel.style.fontFamily =
            "monospace";

        radarLabel.style.fontSize =
            "10px";

        radarLabel.style.zIndex =
            "4";

        radar.appendChild(
            radarLabel
        );

        // --------------------------------------------------
        // Radar contacts
        // --------------------------------------------------

        type RadarContact = {
            enemy: Enemy;
            marker: HTMLDivElement;
        };

        const radarContacts:
            RadarContact[] =
            enemies.map(
                enemy => {
                    const marker =
                        document.createElement(
                            "div"
                        );

                    marker.style.position =
                        "absolute";

                    marker.style.width =
                        "8px";

                    marker.style.height =
                        "8px";

                    marker.style.borderRadius =
                        "50%";

                    marker.style.transform =
                        "translate(-50%, -50%)";

                    marker.style.pointerEvents =
                        "none";

                    marker.style.display =
                        "none";

                    marker.style.boxSizing =
                        "border-box";

                    marker.style.zIndex =
                        "2";

                    radar.appendChild(
                        marker
                    );

                    return {
                        enemy,
                        marker,
                    };
                }
            );

        // --------------------------------------------------
        // Radar missile contacts
        // --------------------------------------------------

        const radarEnemyMissileMarkers:
            HTMLDivElement[] = [];

        const radarPlayerMissileMarkers:
            HTMLDivElement[] = [];

        const createRadarMissileMarker =
            (
                enemyMissile: boolean
            ) => {
                const marker =
                    document.createElement(
                        "div"
                    );

                marker.style.position =
                    "absolute";

                marker.style.width =
                    "7px";

                marker.style.height =
                    "7px";

                marker.style.transform =
                    "translate(-50%, -50%)";

                marker.style.pointerEvents =
                    "none";

                marker.style.display =
                    "none";

                marker.style.boxSizing =
                    "border-box";

                marker.style.zIndex =
                    "2";

                if (enemyMissile) {
                    marker.style.background =
                        "red";

                    marker.style.border =
                        "1px solid white";

                    marker.style.clipPath =
                        "polygon(50% 0%, 100% 100%, 0% 100%)";
                } else {
                    marker.style.background =
                        "white";

                    marker.style.border =
                        "1px solid black";

                    marker.style.borderRadius =
                        "50%";
                }

                radar.appendChild(
                    marker
                );

                return marker;
            };

        function ensureRadarMissileMarkers(
            missileList: Missile[],
            markers: HTMLDivElement[],
            enemyMissile: boolean
        ) {
            while (
                markers.length <
                missileList.length
                ) {
                markers.push(
                    createRadarMissileMarker(
                        enemyMissile
                    )
                );
            }
        }

        // --------------------------------------------------
        // Return an aircraft to level flight
        // --------------------------------------------------

        function levelAircraft(
            aircraft: Aircraft,
            dt: number
        ) {
            const euler =
                new THREE.Euler(
                    0,
                    0,
                    0,
                    "YXZ"
                );

            euler.setFromQuaternion(
                aircraft.quaternion,
                "YXZ"
            );

            const levelRate = 3;

            const alpha =
                1 -
                Math.exp(
                    -levelRate *
                    dt
                );

            euler.x =
                THREE.MathUtils.lerp(
                    euler.x,
                    0,
                    alpha
                );

            euler.z =
                THREE.MathUtils.lerp(
                    euler.z,
                    0,
                    alpha
                );

            aircraft.quaternion.setFromEuler(
                euler
            );
        }

        // --------------------------------------------------
        // Destroy player
        // --------------------------------------------------

        function destroyPlayer() {
            if (playerHasDied) {
                return;
            }

            playerHasDied = true;

            deathPosition.copy(
                player.position
            );

            deathQuaternion.copy(
                player.quaternion
            );

            player.alive = false;

            playerAircraft.visible =
                false;

            gunFiring = false;
            locked = false;

            reticle.style.display =
                "none";

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

            radar.style.display =
                "none";

            const explosion =
                new Explosion(
                    deathPosition
                );

            scene.add(
                explosion.group
            );

            explosions.push(
                explosion
            );
        }

        // --------------------------------------------------
        // Destroy enemy
        // --------------------------------------------------

        function destroyEnemy(
            enemy: Enemy
        ) {
            if (!enemy.alive) {
                return;
            }

            const enemyDeathPosition =
                enemy.aircraft.position.clone();

            enemy.destroy();

            const explosion =
                new Explosion(
                    enemyDeathPosition
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
                locked = false;
                ensureValidTarget();
            }
        }

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

                hud.textContent =
                    selected &&
                    targetLocked
                        ? "◇ LOCK"
                        : `◇ ${name}`;
            }
        }

        // --------------------------------------------------
        // Radar
        // --------------------------------------------------

        function updateRadar() {
            if (!player.alive) {
                radar.style.display =
                    "none";

                return;
            }

            radar.style.display =
                "block";

            const radarCenter = 90;
            const radarRadius = 90;

            // Find the closest alive aircraft.
            let nearestEnemyDistance =
                Infinity;

            for (
                const enemy of enemies
                ) {
                if (!enemy.alive) {
                    continue;
                }

                const distance =
                    enemy.aircraft.position.distanceTo(
                        player.position
                    );

                nearestEnemyDistance =
                    Math.min(
                        nearestEnemyDistance,
                        distance
                    );
            }

            const radarRange =
                Number.isFinite(
                    nearestEnemyDistance
                )
                    ? Math.max(
                        1000,
                        Math.ceil(
                            nearestEnemyDistance /
                            1000
                        ) * 1000
                    )
                    : 1000;

            radarLabel.textContent =
                `RADAR ${(
                    radarRange / 1000
                ).toFixed(0)} KM`;

            // ------------------------------------------------
            // Heading-only orientation
            //
            // This radar is deliberately 2D.
            //
            // It uses ONLY the aircraft's yaw/
            // heading. Pitch and roll do not enter
            // this calculation at all.
            //
            // In particular, do NOT derive these
            // vectors from player.quaternion.
            // ------------------------------------------------

            const heading =
                player.rotation.y;

            // Aircraft forward is -Z.
            const forwardX =
                -Math.sin(
                    heading
                );

            const forwardZ =
                -Math.cos(
                    heading
                );

            // Aircraft right is +X.
            const rightX =
                Math.cos(
                    heading
                );

            const rightZ =
                -Math.sin(
                    heading
                );

            function updateRadarPosition(
                position: THREE.Vector3,
                marker: HTMLDivElement
            ) {
                // Only world X/Z matter.
                // Altitude is completely ignored.
                const dx =
                    position.x -
                    player.position.x;

                const dz =
                    position.z -
                    player.position.z;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dz * dz
                    );

                if (
                    distance >
                    radarRange
                ) {
                    marker.style.display =
                        "none";

                    return;
                }

                // Project the world-space contact
                // onto the aircraft's horizontal
                // heading basis.
                const right =
                    dx * rightX +
                    dz * rightZ;

                const forward =
                    dx * forwardX +
                    dz * forwardZ;

                const x =
                    radarCenter +
                    (
                        right /
                        radarRange
                    ) *
                    radarRadius;

                const y =
                    radarCenter -
                    (
                        forward /
                        radarRange
                    ) *
                    radarRadius;

                marker.style.left =
                    `${x}px`;

                marker.style.top =
                    `${y}px`;

                marker.style.display =
                    "block";
            }

            // ------------------------------------------------
            // Aircraft contacts
            // ------------------------------------------------

            for (
                const contact of
                radarContacts
                ) {
                const enemy =
                    contact.enemy;

                const marker =
                    contact.marker;

                if (!enemy.alive) {
                    marker.style.display =
                        "none";

                    continue;
                }

                updateRadarPosition(
                    enemy.aircraft.position,
                    marker
                );

                if (
                    marker.style.display ===
                    "none"
                ) {
                    continue;
                }

                if (
                    target.enemy ===
                    enemy
                ) {
                    marker.style.width =
                        "10px";

                    marker.style.height =
                        "10px";

                    marker.style.border =
                        "2px solid white";

                    marker.style.borderRadius =
                        "50%";

                    marker.style.background =
                        "transparent";

                    marker.style.clipPath =
                        "none";
                } else {
                    marker.style.width =
                        "8px";

                    marker.style.height =
                        "8px";

                    marker.style.border =
                        "none";

                    marker.style.borderRadius =
                        "50%";

                    marker.style.background =
                        "red";

                    marker.style.clipPath =
                        "none";
                }
            }

            // ------------------------------------------------
            // Enemy missiles
            // ------------------------------------------------

            ensureRadarMissileMarkers(
                enemyMissiles,
                radarEnemyMissileMarkers,
                true
            );

            for (
                let i = 0;
                i <
                radarEnemyMissileMarkers.length;
                i++
            ) {
                const marker =
                    radarEnemyMissileMarkers[i];

                const missile =
                    enemyMissiles[i];

                if (
                    !missile ||
                    !missile.alive
                ) {
                    marker.style.display =
                        "none";

                    continue;
                }

                updateRadarPosition(
                    missile.position,
                    marker
                );
            }

            // ------------------------------------------------
            // Player missiles
            // ------------------------------------------------

            ensureRadarMissileMarkers(
                missiles,
                radarPlayerMissileMarkers,
                false
            );

            for (
                let i = 0;
                i <
                radarPlayerMissileMarkers.length;
                i++
            ) {
                const marker =
                    radarPlayerMissileMarkers[i];

                const missile =
                    missiles[i];

                if (
                    !missile ||
                    !missile.alive
                ) {
                    marker.style.display =
                        "none";

                    continue;
                }

                updateRadarPosition(
                    missile.position,
                    marker
                );
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

            const trail:
                THREE.Mesh[] =
                [];

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

            scene.add(mesh);

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
            // Player
            // ------------------------------------------------

            if (player.alive) {
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
            }

            // ------------------------------------------------
            // Water collision
            // ------------------------------------------------

            if (
                player.alive &&
                player.position.y <= 0
            ) {
                destroyPlayer();
            }

            // ------------------------------------------------
            // Fighter
            // ------------------------------------------------

            if (fighter.alive) {
                const ai =
                    fighterAI.update(
                        fighter.aircraft,
                        missiles,
                        dt
                    );

                fighter.update(
                    dt,
                    ai.controls
                );

                if (
                    !player.alive
                ) {
                    levelAircraft(
                        fighter.aircraft,
                        dt
                    );
                }

                if (
                    fighter.alive &&
                    fighter.aircraft.position.y <=
                    0
                ) {
                    destroyEnemy(
                        fighter
                    );
                }

                if (
                    player.alive &&
                    fighter.alive
                ) {
                    if (
                        ai.useCountermeasure
                    ) {
                        let closestMissile:
                            Missile | null =
                            null;

                        let closestDistance =
                            Infinity;

                        for (
                            const missile of
                            missiles
                            ) {
                            if (
                                !missile.alive
                            ) {
                                continue;
                            }

                            const distance =
                                missile.position.distanceTo(
                                    fighter.aircraft
                                        .position
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

                        if (
                            closestMissile
                        ) {
                            fighter.useCountermeasure(
                                closestMissile
                            );
                        }
                    }

                    if (
                        ai.fireGun
                    ) {
                        const projectile =
                            fighter.fireGun();

                        if (
                            projectile
                        ) {
                            enemyProjectiles.push(
                                projectile
                            );

                            const mesh =
                                new THREE.Mesh(
                                    projectileGeometry,
                                    projectileMaterial
                                );

                            scene.add(mesh);

                            enemyProjectileMeshes.push(
                                mesh
                            );
                        }
                    }

                    if (
                        ai.fireMissile
                    ) {
                        const missile =
                            fighter.fireMissile(
                                player.position
                            );

                        if (
                            missile
                        ) {
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
                                THREE.Mesh[] =
                                [];

                            const trailLength =
                                25;

                            for (
                                let i = 0;
                                i <
                                trailLength;
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
            }

            // ------------------------------------------------
            // Bomber
            // ------------------------------------------------

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

                if (
                    !player.alive
                ) {
                    levelAircraft(
                        bomber.aircraft,
                        dt
                    );
                }

                if (
                    bomber.alive &&
                    bomber.aircraft.position.y <=
                    0
                ) {
                    destroyEnemy(
                        bomber
                    );
                }
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
            // Player gun projectiles
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

                for (
                    const enemy of
                    enemies
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
                    trail[0]
                        .material as
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

                for (
                    const enemy of
                    enemies
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
                        const enemyDeathPosition =
                            enemy.aircraft
                                .position
                                .clone();

                        enemy.destroy();

                        missile.alive =
                            false;

                        const explosion =
                            new Explosion(
                                enemyDeathPosition
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
                    trail[0]
                        .material as
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
                    Missile | null =
                    null;

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
                    enemyMissiles.length ===
                    1
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
            // Player render
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
            } else {
                chasePosition
                    .copy(chaseOffset)
                    .applyQuaternion(
                        deathQuaternion
                    )
                    .add(
                        deathPosition
                    );

                chasePosition.y =
                    Math.max(
                        chasePosition.y,
                        2
                    );

                chasePlane.position.copy(
                    chasePosition
                );

                chasePlane.quaternion.copy(
                    deathQuaternion
                );
            }

            camera.position.copy(
                chasePlane.position
            );

            camera.quaternion.copy(
                chasePlane.quaternion
            );

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
            // Target box
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
            // Radar
            // ------------------------------------------------

            updateRadar();

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
            radar.remove();

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
                style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    zIndex: 10,
                    padding:
                        "12px 16px",
                    background:
                        "rgba(0, 0, 0, 0.55)",
                    border:
                        "1px solid rgba(255, 255, 255, 0.35)",
                    color: "white",
                    fontFamily:
                        "monospace",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    textShadow:
                        "0 0 3px black",
                    pointerEvents:
                        "none",
                    minWidth: "220px",
                }}
            >
                <div
                    style={{
                        fontWeight:
                            "bold",
                        marginBottom:
                            "3px",
                        fontSize:
                            "15px",
                    }}
                >
                    SCENARIO
                </div>

                <div
                    style={{
                        marginBottom:
                            "10px",
                    }}
                >
                    Eliminate the bomber
                    <br />
                    and its escort.
                </div>

                <div
                    style={{
                        borderTop:
                            "1px solid rgba(255, 255, 255, 0.25)",
                        paddingTop:
                            "8px",
                        fontWeight:
                            "bold",
                        marginBottom:
                            "4px",
                    }}
                >
                    CONTROLS
                </div>

                <div>
                    ↑ / ↓ &nbsp; Pitch
                </div>

                <div>
                    A / D &nbsp;&nbsp; Roll
                </div>

                <div>
                    Q / E &nbsp;&nbsp; Yaw
                </div>

                <div>
                    W / S &nbsp;&nbsp; Throttle
                </div>

                <div
                    style={{
                        marginTop:
                            "6px",
                    }}
                >
                    F &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Gun
                </div>

                <div>
                    SPACE &nbsp; Missile
                </div>

                <div>
                    TAB &nbsp;&nbsp;&nbsp; Change Target
                </div>
            </div>

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
                    fontWeight:
                        "bold",
                    textAlign:
                        "center",
                    whiteSpace:
                        "pre",
                    pointerEvents:
                        "none",
                    textShadow:
                        "0 0 4px black",
                }}
            />
        </main>
    );
}