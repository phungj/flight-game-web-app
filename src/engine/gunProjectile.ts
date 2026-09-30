import * as THREE from "three";

export class GunProjectile {
    position = new THREE.Vector3();
    velocity = new THREE.Vector3();

    life = 0;
    maxLife = 2;

    alive = true;

    muzzleSpeed = 500;

    constructor(
        position: THREE.Vector3,
        direction: THREE.Vector3,
        parentVelocity: THREE.Vector3
    ) {
        this.position.copy(
            position
        );

        this.velocity
            .copy(direction)
            .normalize()
            .multiplyScalar(
                this.muzzleSpeed
            )
            .add(
                parentVelocity
            );
    }

    update(dt: number) {
        if (!this.alive) {
            return;
        }

        this.life += dt;

        if (
            this.life >=
            this.maxLife
        ) {
            this.alive = false;
            return;
        }

        this.position.addScaledVector(
            this.velocity,
            dt
        );
    }
}