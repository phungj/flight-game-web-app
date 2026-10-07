"use client";

import {useEffect, useRef, useState} from "react";
import * as THREE from "three";

import { Controls } from "@/src/engine/controls";
import { Enemy } from "@/src/engine/enemy/enemy";

import {
    AircraftEnemy,
} from "@/src/engine/enemy/aircraft/aircraftEnemy";

import {
    FighterAI,
} from "@/src/engine/enemy/aircraft/fighterAI";

import {
    ShipEnemy,
} from "@/src/engine/enemy/ship/shipEnemy";

import {
    ShipAI,
} from "@/src/engine/enemy/ship/shipAI";

import {
    GroundEnemy,
} from "@/src/engine/enemy/ground/groundEnemy";

import {
    GroundAI,
} from "@/src/engine/enemy/ground/groundAI";

import { Missile } from "@/src/engine/missile";
import { Explosion } from "@/src/engine/explosion";
import { GunProjectile } from "@/src/engine/gunProjectile";
import { Player } from "@/src/engine/player";

import type {
    LevelDefinition,
    LevelObjectDefinition,
} from "@/src/levels/types";

import {
    selectBestTarget,
    selectNextTarget as getNextTarget,
    Target,
} from "@/src/engine/targeting";
import {ObjectEnemy} from "@/src/engine/enemy/objectEnemy";
import {ScenarioPanel} from "@/components/ScenarioPanel";
import {createLevelObject, objectMaterials} from "@/src/engine/createLevelObject";
import {GameHud} from "@/src/engine/hud/gameHUD";

type GameProps = {
    level: LevelDefinition;
    onExit: () => void;
};

type ObjectRuntimeEnemy = {
    definition: LevelObjectDefinition;
    enemy: ObjectEnemy;
};

type RuntimeEnemy = {
    definition:
        LevelDefinition["enemies"][number];

    enemy: Enemy;
};

export default function Game({
                                 level,
                                 onExit,
                             }: GameProps) {
    const containerRef =
        useRef<HTMLDivElement>(null);

    const hudRef =
        useRef<HTMLDivElement>(null);

    const [resetKey, setResetKey] = useState<number>(0);

    useEffect(() => {
        const container =
            containerRef.current;

        if (!container) {
            return;
        }

        const hud = new GameHud(containerRef.current);

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

        renderer.setPixelRatio(
            window.devicePixelRatio
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
        // Terrain
        // --------------------------------------------------

        const terrainMaterial =
            new THREE.MeshStandardMaterial({
                color:
                    level.terrain.type === "land"
                        ? 0x4f7a3a
                        : 0x2874a6,
            });

        const ground =
            new THREE.Mesh(
                new THREE.PlaneGeometry(
                    100000,
                    100000
                ),
                terrainMaterial
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

        player.aircraft.position.set(
            0,
            500,
            0
        );

        const controls =
            new Controls();

        // --------------------------------------------------
        // Player aircraft
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

        const wingMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xcccccc,
            });

        const wings =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    6,
                    0.2,
                    1.2
                ),
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
        // Level objects
        // --------------------------------------------------

        const levelObjects:
            THREE.Object3D[] =
            [];



        const objectEnemies:
            ObjectRuntimeEnemy[] = [];

        // --------------------------------------------------
        // Level objects
        // --------------------------------------------------

        for (
            const definition of
            level.objects
            ) {
            const object =
                createLevelObject(
                    definition
                );

            scene.add(
                object
            );

            levelObjects.push(
                object
            );

            if (
                definition.enemy
            ) {
                const enemy =
                    new ObjectEnemy(
                        new THREE.Vector3(
                            ...definition.position
                        ),
                        {
                            health:
                            definition.enemy.health,

                            team:
                            definition.enemy.team,

                            group:
                            object,
                        }
                    );

                objectEnemies.push({
                    definition,
                    enemy,
                });
            }
        }

        // --------------------------------------------------
        // Enemies
        // --------------------------------------------------

        const runtimeEnemies:
            RuntimeEnemy[] =
            level.enemies.map(
                definition => {
                    const position =
                        new THREE.Vector3(
                            ...definition.position
                        );

                    let enemy: Enemy;

                    switch (
                        definition.type
                        ) {
                        case "fighter":
                        case "bomber":
                            enemy =
                                new AircraftEnemy(
                                    definition.type,
                                    position,
                                    {
                                        countermeasures:
                                        definition.countermeasures,

                                        team:
                                        definition.team,
                                    }
                                );
                            break;

                        case "supply":
                        case "destroyer":
                        case "cruiser":
                            enemy =
                                new ShipEnemy(
                                    definition.type,
                                    position,
                                    {
                                        team:
                                        definition.team,
                                    }
                                );
                            break;

                        case "truck":
                        case "tank":
                        case "aa":
                        case "sam":
                            enemy =
                                new GroundEnemy(
                                    definition.type,
                                    position,
                                    {
                                        team:
                                        definition.team,
                                    }
                                );
                            break;

                        default:
                            throw new Error(
                                `Unknown enemy type: ${definition.type}`
                            );
                    }

                    scene.add(
                        enemy.group
                    );

                    return {
                        definition,
                        enemy,
                    };
                }
            );

        const enemies:
            Enemy[] = [
            ...runtimeEnemies.map(
                runtimeEnemy =>
                    runtimeEnemy.enemy
            ),

            ...objectEnemies.map(
                objectEnemy =>
                    objectEnemy.enemy
            ),
        ];

        for (const enemy of enemies) {
            hud.addTarget(enemy);
        }

        // --------------------------------------------------
        // Fighter AI
        // --------------------------------------------------

        const fighterAIs =
            new Map<
                AircraftEnemy,
                FighterAI
            >();

        for (
            const runtimeEnemy of
            runtimeEnemies
            ) {
            if (
                runtimeEnemy.definition.ai ===
                "fighter" &&
                runtimeEnemy.enemy instanceof
                AircraftEnemy
            ) {
                fighterAIs.set(
                    runtimeEnemy.enemy,
                    new FighterAI(
                        player
                    )
                );
            }
        }

        // --------------------------------------------------
        // Ship AI
        // --------------------------------------------------

        const shipAIs =
            new Map<
                ShipEnemy,
                ShipAI
            >();

        for (
            const runtimeEnemy of
            runtimeEnemies
            ) {
            if (
                runtimeEnemy.definition.ai ===
                "ship" &&
                runtimeEnemy.enemy instanceof
                ShipEnemy
            ) {
                shipAIs.set(
                    runtimeEnemy.enemy,
                    new ShipAI(
                        player
                    )
                );
            }
        }

        // --------------------------------------------------
        // Ground AI
        // --------------------------------------------------

        const groundAIs =
            new Map<
                GroundEnemy,
                GroundAI
            >();

        for (
            const runtimeEnemy of
            runtimeEnemies
            ) {
            if (
                runtimeEnemy.definition.ai ===
                "ground" &&
                runtimeEnemy.enemy instanceof
                GroundEnemy
            ) {
                groundAIs.set(
                    runtimeEnemy.enemy,
                    new GroundAI(
                        player
                    )
                );
            }
        }

        // --------------------------------------------------
// Targets
// --------------------------------------------------

        const targets:
            Target[] = [
            ...runtimeEnemies.map(
                runtimeEnemy => ({
                    enemy:
                    runtimeEnemy.enemy,

                    name:
                    runtimeEnemy.definition.name,
                })
            ),

            ...objectEnemies.map(
                objectEnemy => ({
                    enemy:
                    objectEnemy.enemy,

                    name:
                    objectEnemy.definition
                        .enemy!
                        .name,
                })
            ),
        ];

        let target =
            selectBestTarget(
                player,
                targets
            );

        let locked = false;

        const lockRange =
            1500;

        const lockAngle =
            THREE.MathUtils.degToRad(
                18
            );

        function selectNextTarget() {
            if (
                targets.length === 0
            ) {
                return;
            }

            const nextTarget =
                getNextTarget(
                    player,
                    camera,
                    targets,
                    target
                );

            if (
                nextTarget &&
                nextTarget !== target
            ) {
                target =
                    nextTarget;

                locked = false;
            }
        }

        function ensureValidTarget() {
            if (
                targets.length === 0
            ) {
                target =
                    undefined;

                locked = false;

                return;
            }

            if (
                target &&
                target.enemy.alive
            ) {
                return;
            }

            target =
                selectBestTarget(
                    player,
                    targets
                );

            locked = false;
        }

        // --------------------------------------------------
        // Missiles
        // --------------------------------------------------

        const missiles:
            Missile[] =
            [];

        const missileMeshes:
            THREE.Mesh[] =
            [];

        const missileTrails:
            THREE.Mesh[][] =
            [];

        const enemyMissiles:
            Missile[] =
            [];

        const enemyMissileMeshes:
            THREE.Mesh[] =
            [];

        const enemyMissileTrails:
            THREE.Mesh[][] =
            [];

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
            GunProjectile[] =
            [];

        const projectileMeshes:
            THREE.Mesh[] =
            [];

        const enemyProjectiles:
            GunProjectile[] =
            [];

        const enemyProjectileMeshes:
            THREE.Mesh[] =
            [];

        /*
         * Damage is kept alongside enemyProjectiles so
         * aircraft guns, ship CIWS, and ground AA can
         * share the same projectile implementation while
         * using different damage values.
         */
        const enemyProjectileDamages:
            number[] =
            [];

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

        const playerGunFireRate =
            15;

        const playerGunMuzzleSpeed =
            500;

        let gunFiring = false;
        let gunCooldown = 0;

        // --------------------------------------------------
        // Explosions
        // --------------------------------------------------

        const explosions:
            Explosion[] =
            [];

        const deathPosition =
            new THREE.Vector3();

        const deathQuaternion =
            new THREE.Quaternion();

        let playerHasDied = false;



        // --------------------------------------------------
        // Target box
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

        targetBox.style.border = "2px solid red";

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

        radar.appendChild(
            radarGrid
        );

        for (
            const fraction of [
            0.25,
            0.5,
            0.75,
        ]
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

        radarVertical.style.background =
            "rgba(255, 255, 255, 0.15)";

        radarGrid.appendChild(
            radarVertical
        );

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

                    marker.style.display =
                        "none";

                    marker.style.zIndex =
                        "2";

                    marker.style.background =
                        enemy.team ===
                        "friendly"
                            ? "blue"
                            : "red";

                    radar.appendChild(
                        marker
                    );

                    return {
                        enemy,
                        marker,
                    };
                }
            );

        const radarEnemyMissileMarkers:
            HTMLDivElement[] =
            [];

        const radarPlayerMissileMarkers:
            HTMLDivElement[] =
            [];

        function createRadarMissileMarker(
            enemyMissile: boolean
        ) {
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

            marker.style.display =
                "none";

            marker.style.zIndex =
                "2";

            if (enemyMissile) {
                marker.style.background =
                    "red";

                marker.style.clipPath =
                    "polygon(50% 0%, 100% 100%, 0% 100%)";
            } else {
                marker.style.background =
                    "white";

                marker.style.borderRadius =
                    "50%";
            }

            radar.appendChild(
                marker
            );

            return marker;
        }

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
        // Selected-target 3D arrow
        // --------------------------------------------------

        const targetArrow =
            new THREE.Group();

        const targetArrowMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9,
                depthTest: false,
                depthWrite: false,
            });

        const targetArrowHead =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.27,
                    0.84,
                    4
                ),
                targetArrowMaterial
            );

        targetArrowHead.rotation.x =
            Math.PI / 2;

        targetArrow.add(
            targetArrowHead
        );

        const targetArrowShaft =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.07,
                    0.07,
                    0.72,
                    6
                ),
                targetArrowMaterial
            );

        targetArrowShaft.rotation.x =
            Math.PI / 2;

        targetArrowShaft.position.z =
            -0.42;

        targetArrow.add(
            targetArrowShaft
        );

        targetArrow.visible =
            false;

        targetArrow.renderOrder =
            100;

        scene.add(
            targetArrow
        );

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

            player.alive =
                false;

            playerAircraft.visible =
                false;

            gunFiring = false;
            locked = false;

            hud.hide();

            targetBox.style.display =
                "none";

            targetArrow.visible =
                false;

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
                enemy.position.clone();

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
                target &&
                target.enemy ===
                enemy
            ) {
                locked = false;

                ensureValidTarget();
            }
        }



        // --------------------------------------------------
        // Radar update
        // --------------------------------------------------

        function updateRadar() {
            if (!player.alive) {
                radar.style.display =
                    "none";

                return;
            }

            radar.style.display =
                "block";

            const radarCenter =
                90;

            const radarRadius =
                90;

            let nearestEnemyDistance =
                Infinity;

            for (
                const enemy of
                enemies
                ) {
                if (!enemy.alive) {
                    continue;
                }

                const distance =
                    enemy.position.distanceTo(
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
                    radarRange /
                    1000
                ).toFixed(0)} KM`;

            const heading =
                player.rotation.y;

            const forwardX =
                -Math.sin(
                    heading
                );

            const forwardZ =
                -Math.cos(
                    heading
                );

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

                const right =
                    dx * rightX +
                    dz * rightZ;

                const forward =
                    dx * forwardX +
                    dz * forwardZ;

                const x =
                    radarCenter +
                    (right /
                        radarRange) *
                    radarRadius;

                const y =
                    radarCenter -
                    (forward /
                        radarRange) *
                    radarRadius;

                marker.style.left =
                    `${x}px`;

                marker.style.top =
                    `${y}px`;

                marker.style.display =
                    "block";
            }

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
                    enemy.position,
                    marker
                );

                if (
                    target &&
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

                    marker.style.clipPath =
                        "none";
                } else {
                    marker.style.width =
                        "8px";

                    marker.style.height =
                        "8px";

                    marker.style.borderRadius =
                        "50%";

                    marker.style.background =
                        enemy.team ===
                        "friendly"
                            ? "blue"
                            : "red";

                    marker.style.border = "none";

                    marker.style.clipPath =
                        "none";
                }
            }

            // --------------------------------------------------
// Incoming missiles
// --------------------------------------------------

            const incomingMissiles =
                [
                    ...enemyMissiles,
                    ...missiles,
                ].filter(
                    missile =>
                        missile.alive &&
                        missile.target ===
                        player.position
                );

            ensureRadarMissileMarkers(
                incomingMissiles,
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
                    incomingMissiles[i];

                if (!missile) {
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
                !target ||
                !target.enemy.alive ||
                !locked
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
                    target.enemy.position
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

            for (
                let i = 0;
                i < 25;
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
        // Gun
        // --------------------------------------------------

        function fireGun() {
            if (!player.alive) {
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

            scene.add(
                mesh
            );

            projectileMeshes.push(
                mesh
            );
        }

        // --------------------------------------------------
        // Ship CIWS
        // --------------------------------------------------

        function fireShipCIWS(
            enemy: ShipEnemy
        ) {
            if (
                !player.alive ||
                !enemy.alive
            ) {
                return;
            }

            if (
                !enemy.canFireCIWS()
            ) {
                return;
            }

            const direction =
                player.position
                    .clone()
                    .sub(
                        enemy.position
                    );

            if (
                direction.lengthSq() <
                0.000001
            ) {
                return;
            }

            direction.normalize();

            const launchPosition =
                enemy.position
                    .clone()
                    .addScaledVector(
                        direction,
                        10
                    );

            launchPosition.y += 8;

            /*
             * Add the ship's own velocity to the
             * projectile. The CIWS round is still fired
             * toward the player, but the moving ship
             * contributes its existing velocity.
             */
            const shipForward =
                new THREE.Vector3(
                    0,
                    0,
                    -1
                ).applyQuaternion(
                    enemy.quaternion
                );

            const shipVelocity =
                shipForward
                    .multiplyScalar(
                        enemy.speed
                    );

            const ciwsVelocity =
                direction
                    .clone()
                    .multiplyScalar(
                        500
                    )
                    .add(
                        shipVelocity
                    );

            const projectile =
                new GunProjectile(
                    launchPosition,
                    direction,
                    ciwsVelocity
                );

            if (
                !enemy.fireCIWS()
            ) {
                return;
            }

            enemyProjectiles.push(
                projectile
            );

            enemyProjectileDamages.push(
                enemy.ciwsDamage
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

        // --------------------------------------------------
        // Ground AA
        // --------------------------------------------------

        function fireGroundAA(
            enemy: GroundEnemy
        ) {
            if (
                !player.alive ||
                !enemy.alive
            ) {
                return;
            }

            const direction =
                player.position
                    .clone()
                    .sub(
                        enemy.position
                    );

            if (
                direction.lengthSq() <
                0.000001
            ) {
                return;
            }

            direction.normalize();

            const launchPosition =
                enemy.position
                    .clone()
                    .addScaledVector(
                        direction,
                        4
                    );

            launchPosition.y +=
                3;

            const projectileVelocity =
                direction
                    .clone()
                    .multiplyScalar(
                        500
                    );

            const projectile =
                new GunProjectile(
                    launchPosition,
                    direction,
                    projectileVelocity
                );

            enemyProjectiles.push(
                projectile
            );

            enemyProjectileDamages.push(
                enemy.aaDamage
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

        // --------------------------------------------------
        // Launch enemy missile
        // --------------------------------------------------

        function launchEnemyMissile(
            missile: Missile
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

            for (
                let i = 0;
                i < 25;
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

        // --------------------------------------------------
        // Input
        // --------------------------------------------------

        function handleKeyDown(
            event: KeyboardEvent
        ) {
            if (
                event.code ===
                "Space" &&
                !event.repeat
            ) {
                launchMissile();
            }

            if (
                event.code ===
                "KeyF"
            ) {
                gunFiring =
                    true;
            }

            if (
                event.code ===
                "Tab" &&
                !event.repeat
            ) {
                event.preventDefault();

                selectNextTarget();
            }

            if (
                event.code ===
                "KeyR" &&
                !event.repeat
            ) {
                setResetKey(
                    key =>
                        key + 1
                );

                return;
            }

            if (
                event.code ===
                "Escape" &&
                !event.repeat
            ) {
                onExit();
            }
        }

        function handleKeyUp(
            event: KeyboardEvent
        ) {
            if (
                event.code ===
                "KeyF"
            ) {
                gunFiring =
                    false;
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

            if (
                player.alive &&
                player.position.y <= 0
            ) {
                destroyPlayer();
            }

            // ------------------------------------------------
            // Enemies
            // ------------------------------------------------

            const aircraftEnemies =
                enemies.filter(
                    (
                        enemy
                    ): enemy is AircraftEnemy =>
                        enemy instanceof AircraftEnemy
                );

            for (
                const runtimeEnemy of
                runtimeEnemies
                ) {
                const enemy =
                    runtimeEnemy.enemy;

                if (!enemy.alive) {
                    continue;
                }

                // --------------------------------------------
// Aircraft
// --------------------------------------------

                if (
                    enemy instanceof
                    AircraftEnemy
                ) {
                    const ai =
                        fighterAIs.get(
                            enemy
                        );

                    if (ai) {
                        const result =
                            ai.update(
                                enemy,
                                aircraftEnemies,
                                missiles,
                                dt
                            );

                        enemy.update(
                            dt,
                            result.controls
                        );

                        if (
                            enemy.alive &&
                            enemy.position.y <= 0
                        ) {
                            destroyEnemy(
                                enemy
                            );

                            continue;
                        }

                        if (
                            enemy.alive
                        ) {
                            // --------------------------------------------
                            // Countermeasures
                            // --------------------------------------------

                            if (
                                result.useCountermeasure
                            ) {
                                enemy.useCountermeasure(
                                    missiles
                                );
                            }

                            // --------------------------------------------
                            // Gun
                            // --------------------------------------------

                            if (
                                result.gunTarget
                            ) {
                                const projectile =
                                    enemy.fireGun();

                                if (
                                    projectile
                                ) {
                                    enemyProjectiles.push(
                                        projectile
                                    );

                                    enemyProjectileDamages.push(
                                        10
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

                            // --------------------------------------------
                            // Missile
                            // --------------------------------------------

                            if (
                                result.missileTarget
                            ) {
                                const missile =
                                    enemy.fireMissile(
                                        result
                                            .missileTarget
                                            .position
                                    );

                                if (
                                    missile
                                ) {
                                    launchEnemyMissile(
                                        missile
                                    );
                                }
                            }
                        }

                        continue;
                    }

                    /*
                     * Aircraft without an AI, such as the
                     * current bomber.
                     */
                    enemy.update(
                        dt,
                        {
                            pitch: 0,
                            roll: 0,
                            yaw: 0,
                            throttle: 0,
                        }
                    );

                    if (
                        enemy.alive &&
                        enemy.position.y <= 0
                    ) {
                        destroyEnemy(
                            enemy
                        );
                    }

                    continue;
                }

                // --------------------------------------------
                // Ships
                // --------------------------------------------

                if (
                    enemy instanceof
                    ShipEnemy
                ) {
                    const ai =
                        shipAIs.get(
                            enemy
                        );

                    if (ai) {
                        const result =
                            ai.update(
                                enemy,
                                missiles,
                                dt
                            );

                        enemy.update(
                            dt,
                            result.controls
                        );

                        if (
                            enemy.alive &&
                            result.missileTarget
                        ) {
                            const missile =
                                enemy.fireMissile(
                                    result
                                        .missileTarget
                                        .position
                                );

                            if (
                                missile
                            ) {
                                launchEnemyMissile(
                                    missile
                                );
                            }
                        }

                        if (
                            player.alive &&
                            enemy.alive &&
                            result.ciwsTarget
                        ) {
                            fireShipCIWS(
                                enemy
                            );
                        }
                    } else {
                        enemy.update(
                            dt,
                            {
                                pitch: 0,
                                roll: 0,
                                yaw: 0,
                                throttle: 0,
                            }
                        );
                    }

                    continue;
                }

                // --------------------------------------------
                // Ground enemies
                // --------------------------------------------

                if (
                    enemy instanceof
                    GroundEnemy
                ) {
                    const ai =
                        groundAIs.get(
                            enemy
                        );

                    if (ai) {
                        const result =
                            ai.update(
                                enemy,
                                missiles,
                                dt
                            );

                        enemy.update(
                            dt,
                            result.controls
                        );

                        if (
                            enemy.alive &&
                            result.missileTarget
                        ) {
                            const missile =
                                enemy.fireMissile(
                                    result
                                        .missileTarget
                                        .position
                                );

                            if (
                                missile
                            ) {
                                launchEnemyMissile(
                                    missile
                                );
                            }
                        }

                        if (
                            player.alive &&
                            enemy.alive &&
                            result.aaTarget
                        ) {
                            const rounds =
                                enemy.getAARounds(
                                    dt
                                );

                            for (
                                let i = 0;
                                i < rounds;
                                i++
                            ) {
                                if (
                                    enemy.canFireAA()
                                ) {
                                    enemy.fireAA();

                                    fireGroundAA(
                                        enemy
                                    );
                                }
                            }
                        }
                    } else {
                        enemy.update(
                            dt,
                            {
                                pitch: 0,
                                roll: 0,
                                yaw: 0,
                                throttle: 0,
                            }
                        );
                    }

                    continue;
                }

                // --------------------------------------------
                // Generic enemy fallback
                // --------------------------------------------

                enemy.update(
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
            // Lock
            // ------------------------------------------------

            locked = false;

            if (
                player.alive &&
                target &&
                target.enemy.alive
            ) {
                const toTarget =
                    target.enemy.position
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
            // Player projectiles
            // ------------------------------------------------

            for (
                let i =
                    projectiles.length -
                    1;
                i >= 0;
                i--
            ) {
                const projectile =
                    projectiles[i];

                projectile.update(
                    dt
                );

                const mesh =
                    projectileMeshes[i];

                mesh.position.copy(
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
                            enemy.position
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
                            destroyEnemy(
                                enemy
                            );
                        }

                        break;
                    }
                }

                if (
                    !projectile.alive
                ) {
                    scene.remove(
                        mesh
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
            // Enemy projectiles
            // ------------------------------------------------

            for (
                let i =
                    enemyProjectiles.length -
                    1;
                i >= 0;
                i--
            ) {
                const projectile =
                    enemyProjectiles[i];

                projectile.update(
                    dt
                );

                const mesh =
                    enemyProjectileMeshes[i];

                mesh.position.copy(
                    projectile.position
                );

                const damage =
                    enemyProjectileDamages[i] ??
                    10;

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
                        damage
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
                        mesh
                    );

                    enemyProjectiles.splice(
                        i,
                        1
                    );

                    enemyProjectileMeshes.splice(
                        i,
                        1
                    );

                    enemyProjectileDamages.splice(
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
                target &&
                target.enemy.alive
            ) {
                const targetEnemy =
                    target.enemy;

                const relativePosition =
                    targetEnemy.position
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
                            targetEnemy.quaternion
                        )
                        .multiplyScalar(
                            targetEnemy.speed
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

                let interceptTime =
                    0;

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
                        targetEnemy.position
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

                        hud.showLeadIndicator(
                            screenX,
                            screenY
                        );
                    } else {
                        hud.hideLeadIndicator();
                    }
                } else {
                    hud.hideLeadIndicator();
                }
            } else {
                hud.hideLeadIndicator();
            }

            // ------------------------------------------------
            // Player missiles
            // ------------------------------------------------

            for (
                let i =
                    missiles.length -
                    1;
                i >= 0;
                i--
            ) {
                const missile =
                    missiles[i];

                missile.update(
                    dt
                );

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
                        trail.length -
                        1;
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
                }

                trail[0].position.copy(
                    missile.position
                );

                trail[0].scale.setScalar(
                    1
                );

                for (
                    let j = 1;
                    j < trail.length;
                    j++
                ) {
                    const age =
                        j /
                        trail.length;

                    trail[j].scale.setScalar(
                        Math.max(
                            0.85 -
                            age *
                            0.6,
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
                            enemy.position
                        ) <
                        enemy.collisionRadius
                    ) {
                        missile.alive =
                            false;

                        destroyEnemy(
                            enemy
                        );

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
                    enemyMissiles.length -
                    1;
                i >= 0;
                i--
            ) {
                const missile =
                    enemyMissiles[i];

                missile.update(
                    dt
                );

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
                        trail.length -
                        1;
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
                }

                trail[0].position.copy(
                    missile.position
                );

                trail[0].scale.setScalar(
                    1
                );

                for (
                    let j = 1;
                    j < trail.length;
                    j++
                ) {
                    const age =
                        j /
                        trail.length;

                    trail[j].scale.setScalar(
                        Math.max(
                            0.85 -
                            age *
                            0.6,
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

            const incomingMissiles =
                enemyMissiles.filter(
                    missile =>
                        missile.alive &&
                        missile.target === player.position
                );

            hud.updateMissileWarning(
                incomingMissiles.map(
                    missile => missile.position
                ),
                player.position,
                player.quaternion
            );

            // ------------------------------------------------
            // Explosions
            // ------------------------------------------------

            for (
                let i =
                    explosions.length -
                    1;
                i >= 0;
                i--
            ) {
                const explosion =
                    explosions[i];

                explosion.update(
                    dt
                );

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
            // Player rendering
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
                    .copy(
                        chaseOffset
                    )
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
                    .copy(
                        chaseOffset
                    )
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

            // --------------------------------------------------
// Target HUDs
// --------------------------------------------------

            for (
                const targetEntry of
                targets
                ) {
                const enemy =
                    targetEntry.enemy;

                if (
                    player.alive &&
                    enemy.alive
                ) {
                    hud.updateTargetHud(
                        enemy,
                        targetEntry.name,
                        target?.enemy === enemy,
                        locked &&
                        target?.enemy === enemy,
                        camera,
                        player.position
                    );
                } else {
                    hud.hideTargetHud(
                        enemy
                    );
                }
            }

            // ------------------------------------------------
            // Selected-target 3D arrow
            // ------------------------------------------------

            if (
                player.alive &&
                target &&
                target.enemy.alive
            ) {
                const arrowPosition =
                    camera.position.clone();

                const cameraForward =
                    new THREE.Vector3(
                        0,
                        0,
                        -1
                    ).applyQuaternion(
                        camera.quaternion
                    );

                const cameraRight =
                    new THREE.Vector3(
                        1,
                        0,
                        0
                    ).applyQuaternion(
                        camera.quaternion
                    );

                const cameraUp =
                    new THREE.Vector3(
                        0,
                        1,
                        0
                    ).applyQuaternion(
                        camera.quaternion
                    );

                arrowPosition.addScaledVector(
                    cameraForward,
                    6
                );

                arrowPosition.addScaledVector(
                    cameraRight,
                    2.2
                );

                arrowPosition.addScaledVector(
                    cameraUp,
                    -0.5
                );

                targetArrow.position.copy(
                    arrowPosition
                );

                const toTarget =
                    target.enemy.position
                        .clone()
                        .sub(
                            arrowPosition
                        );

                if (
                    toTarget.lengthSq() >
                    0.000001
                ) {
                    toTarget.normalize();

                    targetArrow.quaternion.setFromUnitVectors(
                        new THREE.Vector3(
                            0,
                            0,
                            1
                        ),
                        toTarget
                    );

                    targetArrow.visible =
                        true;
                } else {
                    targetArrow.visible =
                        false;
                }
            } else {
                targetArrow.visible =
                    false;
            }

            // ------------------------------------------------
            // Target box
            // ------------------------------------------------

            if (
                player.alive &&
                target &&
                target.enemy.alive
            ) {
                const projected =
                    target.enemy.position
                        .clone()
                        .project(
                            camera
                        );

                const halfWidth =
                    window.innerWidth /
                    2;

                const halfHeight =
                    window.innerHeight /
                    2;

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

                    const margin =
                        40;

                    const radius =
                        Math.min(
                            halfWidth,
                            halfHeight
                        ) -
                        margin;

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

            hud.destroy()

            targetBox.remove();
            radar.remove();

            scene.remove(
                targetArrow
            );

            targetArrowHead.geometry.dispose();
            targetArrowShaft.geometry.dispose();
            targetArrowMaterial.dispose();

            for (
                const object of
                levelObjects
                ) {
                object.traverse(
                    child => {
                        if (
                            child instanceof
                            THREE.Mesh
                        ) {
                            child.geometry.dispose();
                        }
                    }
                );

                scene.remove(
                    object
                );
            }

            objectMaterials.tent.dispose();
            objectMaterials.container.dispose();
            objectMaterials.fuelTank.dispose();
            objectMaterials.building.dispose();
            objectMaterials.crate.dispose();

            ground.geometry.dispose();
            terrainMaterial.dispose();

            missileGeometry.dispose();
            missileMaterial.dispose();

            trailParticleGeometry.dispose();
            trailParticleMaterial.dispose();

            projectileGeometry.dispose();
            projectileMaterial.dispose();

            renderer.dispose();

            controls.dispose();

            if (
                renderer.domElement
                    .parentElement ===
                container
            ) {
                container.removeChild(
                    renderer.domElement
                );
            }
        };
    }, [level, onExit, resetKey]);

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
            <ScenarioPanel description={level.description}/>

            <div
                ref={hudRef}
                style={{
                    display: "none",
                }}
            />
        </main>
    );
}