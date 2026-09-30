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
                THREE.MathUtils.degToRad(45);

            this.aircraft.rollRate =
                THREE.MathUtils.degToRad(90);

            this.aircraft.yawRate =
                THREE.MathUtils.degToRad(20);

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

        this.group.visible =
            false;
    }
}