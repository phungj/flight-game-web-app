import * as THREE from "three";

import {
    Enemy,
    type EnemyControls,
    type EnemyOptions,
} from "../enemy";
import { Aircraft } from "../../aircraft";
import { GunProjectile } from "../../gunProjectile";
import { Missile } from "../../missile";

export type AircraftEnemyType =
    | "fighter"
    | "bomber";

export type AircraftEnemyOptions =
    EnemyOptions & {
    countermeasures: number;
};

type Flare = {
    mesh: THREE.Mesh;
    trail: THREE.Line;
    trailPoints: THREE.Vector3[];
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
};

export class AircraftEnemy extends Enemy {
    readonly aircraft: Aircraft;

    readonly type: AircraftEnemyType;

    gunFireRate = 15;
    gunMuzzleSpeed = 500;
    gunCooldown = 0;

    missileCooldown = 0;
    missileReloadTime = 8;

    countermeasures: number;
    countermeasureCooldown = 0;
    countermeasureCooldownTime = 2;

    private flares: Flare[] = [];

    private pendingFlares = 0;
    private flareSpawnCooldown = 0;

    private contrailLeft:
        THREE.Line | null = null;

    private contrailRight:
        THREE.Line | null = null;

    private contrailLeftPoints:
        THREE.Vector3[] = [];

    private contrailRightPoints:
        THREE.Vector3[] = [];

    private contrailLength = 40;

    constructor(
        type: AircraftEnemyType,
        position: THREE.Vector3,
        options: AircraftEnemyOptions
    ) {
        const health =
            type === "fighter"
                ? options.health ?? 100
                : options.health ?? 200;

        const speed =
            type === "fighter"
                ? options.speed ?? 140
                : options.speed ?? 75;

        const collisionRadius =
            type === "fighter"
                ? 5
                : 8;

        super(
            position,
            collisionRadius,
            {
                health,
                speed,
                team:
                options.team,
            }
        );

        this.type = type;

        this.countermeasures =
            options.countermeasures;

        this.aircraft =
            new Aircraft();

        this.aircraft.position.copy(
            this.position
        );

        this.aircraft.speed =
            speed;

        if (type === "fighter") {
            this.aircraft.throttle =
                0.5;

            this.aircraft.pitchRate =
                THREE.MathUtils.degToRad(30);

            this.aircraft.rollRate =
                THREE.MathUtils.degToRad(65);

            this.aircraft.yawRate =
                THREE.MathUtils.degToRad(14);

            this.quaternion.setFromEuler(
                new THREE.Euler(
                    0,
                    Math.PI,
                    0,
                    "YXZ"
                )
            );

            this.aircraft.quaternion.copy(
                this.quaternion
            );

            this.createFighter();
            this.createContrails();
        } else {
            this.aircraft.throttle =
                0;

            this.quaternion.setFromEuler(
                new THREE.Euler(
                    0,
                    0,
                    0,
                    "YXZ"
                )
            );

            this.aircraft.quaternion.copy(
                this.quaternion
            );

            this.createBomber();
        }

        this.syncTransform();
    }

    private createFighter() {
        const primaryColor =
            this.team === "friendly"
                ? "blue"
                : 0xff4444;

        const secondaryColor =
            this.team === "friendly"
                ? 0x006699
                : 0xcc2222;

        const fuselage =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.7,
                    5,
                    6
                ),
                new THREE.MeshStandardMaterial({
                    color:
                    primaryColor,
                })
            );

        fuselage.rotation.x =
            -Math.PI / 2;

        fuselage.position.z =
            -0.5;

        this.group.add(
            fuselage
        );

        const wings =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    6,
                    0.2,
                    1.2
                ),
                new THREE.MeshStandardMaterial({
                    color:
                    secondaryColor,
                })
            );

        wings.position.z =
            0.5;

        this.group.add(
            wings
        );
    }

    private createBomber() {
        const primaryColor =
            this.team === "friendly"
                ? 0x0088cc
                : 0xff4444;

        const secondaryColor =
            this.team === "friendly"
                ? 0x006699
                : 0xcc2222;

        const body =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    3,
                    2,
                    10
                ),
                new THREE.MeshStandardMaterial({
                    color:
                    primaryColor,
                })
            );

        this.group.add(
            body
        );

        const wings =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    18,
                    0.4,
                    3
                ),
                new THREE.MeshStandardMaterial({
                    color:
                    secondaryColor,
                })
            );

        this.group.add(
            wings
        );

        const tail =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    5,
                    2,
                    2
                ),
                new THREE.MeshStandardMaterial({
                    color:
                    secondaryColor,
                })
            );

        tail.position.z =
            4;

        this.group.add(
            tail
        );
    }

    private createContrails() {
        const material =
            new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.35,
            });

        this.contrailLeft =
            new THREE.Line(
                new THREE.BufferGeometry(),
                material
            );

        this.contrailRight =
            new THREE.Line(
                new THREE.BufferGeometry(),
                material.clone()
            );

        this.group.add(
            this.contrailLeft
        );

        this.group.add(
            this.contrailRight
        );
    }

    private updateContrails() {
        if (
            !this.contrailLeft ||
            !this.contrailRight
        ) {
            return;
        }

        const leftPoint =
            new THREE.Vector3(
                -2.1,
                -0.1,
                2.5
            );

        const rightPoint =
            new THREE.Vector3(
                2.1,
                -0.1,
                2.5
            );

        this.contrailLeftPoints.push(
            leftPoint
        );

        this.contrailRightPoints.push(
            rightPoint
        );

        while (
            this.contrailLeftPoints.length >
            this.contrailLength
            ) {
            this.contrailLeftPoints.shift();
        }

        while (
            this.contrailRightPoints.length >
            this.contrailLength
            ) {
            this.contrailRightPoints.shift();
        }

        this.contrailLeft.geometry.dispose();

        this.contrailLeft.geometry =
            new THREE.BufferGeometry()
                .setFromPoints(
                    this.contrailLeftPoints
                );

        this.contrailRight.geometry.dispose();

        this.contrailRight.geometry =
            new THREE.BufferGeometry()
                .setFromPoints(
                    this.contrailRightPoints
                );
    }

    private syncTransform() {
        this.position.copy(
            this.aircraft.position
        );

        this.quaternion.copy(
            this.aircraft.quaternion
        );

        this.speed =
            this.aircraft.speed;

        this.group.position.copy(
            this.position
        );

        this.group.quaternion.copy(
            this.quaternion
        );
    }

    update(
        dt: number,
        controls: EnemyControls
    ) {
        if (!this.alive) {
            return;
        }

        this.gunCooldown =
            Math.max(
                this.gunCooldown - dt,
                0
            );

        this.missileCooldown =
            Math.max(
                this.missileCooldown - dt,
                0
            );

        this.countermeasureCooldown =
            Math.max(
                this.countermeasureCooldown - dt,
                0
            );

        this.updateFlares(dt);

        this.aircraft.update(
            dt,
            controls
        );

        this.syncTransform();

        if (
            this.type === "fighter"
        ) {
            this.updateContrails();
        }
    }

    private updateFlares(dt: number) {
        if (
            this.pendingFlares > 0
        ) {
            this.flareSpawnCooldown -= dt;

            if (
                this.flareSpawnCooldown <= 0
            ) {
                this.spawnFlare(
                    this.pendingFlares
                );

                this.pendingFlares--;

                this.flareSpawnCooldown =
                    0.1;
            }
        }

        for (
            let i = this.flares.length - 1;
            i >= 0;
            i--
        ) {
            const flare =
                this.flares[i];

            flare.life -= dt;

            if (flare.life <= 0) {
                if (flare.mesh.parent) {
                    flare.mesh.parent.remove(
                        flare.mesh
                    );
                }

                if (flare.trail.parent) {
                    flare.trail.parent.remove(
                        flare.trail
                    );
                }

                flare.mesh.geometry.dispose();
                flare.trail.geometry.dispose();

                const flareMaterial =
                    flare.mesh.material;

                if (
                    flareMaterial instanceof
                    THREE.Material
                ) {
                    flareMaterial.dispose();
                }

                const trailMaterial =
                    flare.trail.material;

                if (
                    trailMaterial instanceof
                    THREE.Material
                ) {
                    trailMaterial.dispose();
                }

                this.flares.splice(
                    i,
                    1
                );

                continue;
            }

            flare.mesh.position.addScaledVector(
                flare.velocity,
                dt
            );

            flare.trailPoints.push(
                flare.mesh.position.clone()
            );

            while (
                flare.trailPoints.length >
                18
                ) {
                flare.trailPoints.shift();
            }

            flare.trail.geometry.dispose();

            flare.trail.geometry =
                new THREE.BufferGeometry()
                    .setFromPoints(
                        flare.trailPoints
                    );

            const lifeRatio =
                THREE.MathUtils.clamp(
                    flare.life /
                    flare.maxLife,
                    0,
                    1
                );

            flare.mesh.scale.setScalar(
                0.9 +
                lifeRatio * 0.5
            );

            const material =
                flare.mesh.material;

            if (
                material instanceof
                THREE.MeshBasicMaterial
            ) {
                material.opacity =
                    Math.min(
                        lifeRatio * 2,
                        1
                    );
            }

            const trailMaterial =
                flare.trail.material;

            if (
                trailMaterial instanceof
                THREE.LineBasicMaterial
            ) {
                trailMaterial.opacity =
                    0.1 +
                    lifeRatio * 0.55;
            }
        }
    }

    private spawnFlare(
        flareNumber: number
    ) {
        const parent =
            this.group.parent;

        if (!parent) {
            return;
        }

        const side =
            flareNumber % 2 === 0
                ? -1
                : 1;

        const pairNumber =
            Math.floor(
                flareNumber / 2
            );

        const longitudinalOffset =
            2 +
            (3 - pairNumber) * 0.8;

        const localPosition =
            new THREE.Vector3(
                side * 2.2,
                -0.8,
                longitudinalOffset
            );

        const worldPosition =
            localPosition
                .applyQuaternion(
                    this.quaternion
                )
                .add(
                    this.position
                );

        const mesh =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    1.2,
                    8,
                    8
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xff2200,
                    transparent: true,
                    opacity: 1,
                    blending:
                    THREE.AdditiveBlending,
                    depthWrite: false,
                    toneMapped: false,
                })
            );

        mesh.position.copy(
            worldPosition
        );

        parent.add(mesh);

        const trailMaterial =
            new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.65,
            });

        const trailPoints = [
            worldPosition.clone(),
        ];

        const trail =
            new THREE.Line(
                new THREE.BufferGeometry()
                    .setFromPoints(
                        trailPoints
                    ),
                trailMaterial
            );

        parent.add(trail);

        const forward =
            new THREE.Vector3(
                0,
                0,
                -1
            ).applyQuaternion(
                this.quaternion
            );

        const right =
            new THREE.Vector3(
                1,
                0,
                0
            ).applyQuaternion(
                this.quaternion
            );

        const up =
            new THREE.Vector3(
                0,
                1,
                0
            ).applyQuaternion(
                this.quaternion
            );

        const velocity =
            forward
                .clone()
                .multiplyScalar(
                    -(35 +
                        Math.random() * 15)
                )
                .addScaledVector(
                    right,
                    side *
                    (15 +
                        Math.random() * 10)
                )
                .addScaledVector(
                    up,
                    -(15 +
                        Math.random() * 10)
                );

        const life =
            2 +
            Math.random() * 0.75;

        this.flares.push({
            mesh,
            trail,
            trailPoints,
            velocity,
            life,
            maxLife: life,
        });
    }

    canFireGun() {
        return (
            this.alive &&
            this.gunCooldown <= 0
        );
    }

    fireGun() {
        if (!this.canFireGun()) {
            return null;
        }

        const forward =
            new THREE.Vector3(
                0,
                0,
                -1
            ).applyQuaternion(
                this.quaternion
            );

        const launchPosition =
            this.position
                .clone()
                .addScaledVector(
                    forward,
                    4
                );

        const parentVelocity =
            forward
                .clone()
                .multiplyScalar(
                    this.speed
                );

        const projectile =
            new GunProjectile(
                launchPosition,
                forward,
                parentVelocity
            );

        this.gunCooldown =
            1 / this.gunFireRate;

        return projectile;
    }

    canFireMissile() {
        return (
            this.alive &&
            this.missileCooldown <= 0
        );
    }

    fireMissile(
        target: THREE.Vector3
    ) {
        if (
            !this.canFireMissile()
        ) {
            return null;
        }

        const forward =
            new THREE.Vector3(
                0,
                0,
                -1
            ).applyQuaternion(
                this.quaternion
            );

        const launchPosition =
            this.position
                .clone()
                .addScaledVector(
                    forward,
                    5
                );

        const missile =
            new Missile(
                launchPosition,
                forward,
                target
            );

        this.missileCooldown =
            this.missileReloadTime;

        return missile;
    }

    // --------------------------------------------------
// Countermeasures
// --------------------------------------------------

    canUseCountermeasure() {
        return (
            this.alive &&
            this.countermeasures > 0 &&
            this.countermeasureCooldown <= 0
        );
    }

    useCountermeasure(
        missiles: Missile[]
    ) {
        if (
            !this.canUseCountermeasure()
        ) {
            return false;
        }

        let brokeMissile =
            false;

        for (
            const missile of
            missiles
            ) {
            if (
                !missile.alive ||
                missile.target !==
                this.position
            ) {
                continue;
            }

            missile.loseTarget();

            brokeMissile = true;
        }

        if (!brokeMissile) {
            return false;
        }

        this.countermeasures--;

        this.countermeasureCooldown =
            this.countermeasureCooldownTime;

        this.pendingFlares = 8;
        this.flareSpawnCooldown = 0;

        return true;
    }

    override destroy() {
        if (!this.alive) {
            return;
        }

        super.destroy();

        this.pendingFlares = 0;

        for (
            const flare of this.flares
            ) {
            if (flare.mesh.parent) {
                flare.mesh.parent.remove(
                    flare.mesh
                );
            }

            if (flare.trail.parent) {
                flare.trail.parent.remove(
                    flare.trail
                );
            }

            flare.mesh.geometry.dispose();
            flare.trail.geometry.dispose();

            const flareMaterial =
                flare.mesh.material;

            if (
                flareMaterial instanceof
                THREE.Material
            ) {
                flareMaterial.dispose();
            }

            const trailMaterial =
                flare.trail.material;

            if (
                trailMaterial instanceof
                THREE.Material
            ) {
                trailMaterial.dispose();
            }
        }

        this.flares = [];

        if (this.contrailLeft) {
            this.group.remove(
                this.contrailLeft
            );

            this.contrailLeft.geometry.dispose();

            const material =
                this.contrailLeft.material;

            if (
                material instanceof
                THREE.Material
            ) {
                material.dispose();
            }

            this.contrailLeft = null;
        }

        if (this.contrailRight) {
            this.group.remove(
                this.contrailRight
            );

            this.contrailRight.geometry.dispose();

            const material =
                this.contrailRight.material;

            if (
                material instanceof
                THREE.Material
            ) {
                material.dispose();
            }

            this.contrailRight = null;
        }

        this.contrailLeftPoints = [];
        this.contrailRightPoints = [];
    }
}