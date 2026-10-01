import * as THREE from "three";

import { Aircraft } from "./aircraft";
import { GunProjectile } from "./gunProjectile";
import { Missile } from "./missile";

export type EnemyType =
    | "fighter"
    | "bomber";

export type EnemyControls = {
    pitch: number;
    roll: number;
    yaw: number;
    throttle: number;
};

type Flare = {
    mesh: THREE.Mesh;
    trail: THREE.Line;
    trailPoints: THREE.Vector3[];
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
};

export class Enemy {
    aircraft: Aircraft;

    type: EnemyType;

    health: number;
    maxHealth: number;

    collisionRadius: number;

    group = new THREE.Group();

    alive = true;

    gunFireRate = 15;
    gunMuzzleSpeed = 500;
    gunCooldown = 0;

    missileCooldown = 0;
    missileReloadTime = 8;

    countermeasures = 2;
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
        type: EnemyType,
        position: THREE.Vector3
    ) {
        this.type = type;

        this.aircraft =
            new Aircraft();

        this.aircraft.position.copy(
            position
        );

        if (type === "fighter") {
            this.health = 100;
            this.collisionRadius = 5;

            /*
             * Enemy fighter has slightly worse
             * handling than the player's aircraft.
             */
            this.aircraft.speed = 140;
            this.aircraft.throttle = 0.5;

            this.aircraft.pitchRate =
                THREE.MathUtils.degToRad(30);

            this.aircraft.rollRate =
                THREE.MathUtils.degToRad(65);

            this.aircraft.yawRate =
                THREE.MathUtils.degToRad(14);

            this.aircraft.quaternion.setFromEuler(
                new THREE.Euler(
                    0,
                    Math.PI,
                    0,
                    "YXZ"
                )
            );

            this.createFighter();
        } else {
            this.health = 200;
            this.collisionRadius = 8;

            this.aircraft.speed = 75;
            this.aircraft.throttle = 0;

            this.aircraft.quaternion.setFromEuler(
                new THREE.Euler(
                    0,
                    0,
                    0,
                    "YXZ"
                )
            );

            this.createBomber();
        }

        this.maxHealth =
            this.health;

        this.group.position.copy(
            this.aircraft.position
        );

        this.group.quaternion.copy(
            this.aircraft.quaternion
        );

        if (type === "fighter") {
            this.createContrails();
        }
    }

    private createFighter() {
        const fuselage =
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
                    color: 0xcc2222,
                })
            );

        wings.position.z =
            0.5;

        this.group.add(
            wings
        );
    }

    private createBomber() {
        const body =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    3,
                    2,
                    10
                ),
                new THREE.MeshStandardMaterial({
                    color: 0xff4444,
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
                    color: 0xcc2222,
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
                    color: 0xcc2222,
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

        /*
         * These are children of the enemy group.
         * Their positions are therefore local to
         * the aircraft and don't depend on the
         * group having a parent yet.
         */
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

        /*
         * Contrail points are stored in local
         * aircraft coordinates.
         */
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

        this.group.position.copy(
            this.aircraft.position
        );

        this.group.quaternion.copy(
            this.aircraft.quaternion
        );

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

                this.flares.splice(i, 1);

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

            /*
             * Keep the flare visually intense
             * throughout most of its lifetime.
             */
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

        /*
         * Alternate between the left and right
         * dispenser positions.
         *
         * 0 = left
         * 1 = right
         * 2 = left
         * 3 = right
         * etc.
         */
        const side =
            flareNumber % 2 === 0
                ? -1
                : 1;

        /*
         * Group the eight flares into four
         * left/right pairs.
         *
         * Pair 0 = front
         * Pair 1 = behind it
         * Pair 2 = behind that
         * Pair 3 = rearmost
         */
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
                    this.aircraft.quaternion
                )
                .add(
                    this.aircraft.position
                );

        /*
         * Bright red-orange flare core.
         *
         * Additive blending makes the flare
         * accumulate light visually instead of
         * looking like an ordinary red sphere.
         */
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

        /*
         * White smoke trail behind the flare.
         */
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
                this.aircraft.quaternion
            );

        const right =
            new THREE.Vector3(
                1,
                0,
                0
            ).applyQuaternion(
                this.aircraft.quaternion
            );

        const up =
            new THREE.Vector3(
                0,
                1,
                0
            ).applyQuaternion(
                this.aircraft.quaternion
            );

        /*
         * Flares are ejected behind, downward,
         * and outward from the aircraft.
         */
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
                this.aircraft.quaternion
            );

        const launchPosition =
            this.aircraft.position
                .clone()
                .addScaledVector(
                    forward,
                    4
                );

        const parentVelocity =
            forward
                .clone()
                .multiplyScalar(
                    this.aircraft.speed
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
                this.aircraft.quaternion
            );

        const launchPosition =
            this.aircraft.position
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

    canUseCountermeasure() {
        return (
            this.alive &&
            this.countermeasures > 0 &&
            this.countermeasureCooldown <= 0
        );
    }

    useCountermeasure(
        missile: Missile
    ) {
        if (!this.canUseCountermeasure()) {
            return false;
        }

        missile.loseTarget();

        this.countermeasures--;

        this.countermeasureCooldown =
            this.countermeasureCooldownTime;

        /*
         * Deploy eight individual flares:
         * four from each side.
         */
        this.pendingFlares = 8;
        this.flareSpawnCooldown = 0;

        return true;
    }

    takeDamage(
        amount: number
    ) {
        if (!this.alive) {
            return;
        }

        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0;
            this.destroy();
        }
    }

    destroy() {
        if (!this.alive) {
            return;
        }

        this.health = 0;
        this.alive = false;

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

        this.group.visible =
            false;
    }
}