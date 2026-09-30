import * as THREE from "three";

export class Missile {
    position = new THREE.Vector3();
    quaternion = new THREE.Quaternion();

    speed = 250;

    turnRate =
        THREE.MathUtils.degToRad(180);

    life = 5;

    target: THREE.Vector3 | null = null;

    alive = true;

    constructor(
        position: THREE.Vector3,
        direction: THREE.Vector3,
        target: THREE.Vector3
    ) {
        this.position.copy(position);

        this.target = target;

        const forward =
            new THREE.Vector3(
                0,
                0,
                -1
            );

        this.quaternion.setFromUnitVectors(
            forward,
            direction.clone().normalize()
        );
    }

    update(dt: number) {
        if (
            !this.alive ||
            !this.target
        ) {
            return;
        }

        // --------------------------------------------
        // Lifetime
        // --------------------------------------------

        this.life -= dt;

        if (this.life <= 0) {
            this.alive = false;
            return;
        }

        // --------------------------------------------
        // Current forward direction
        // --------------------------------------------

        const forward =
            new THREE.Vector3(
                0,
                0,
                -1
            ).applyQuaternion(
                this.quaternion
            );

        // --------------------------------------------
        // Desired direction
        // --------------------------------------------

        const desired =
            this.target
                .clone()
                .sub(this.position);

        const distance =
            desired.length();

        if (distance > 0.001) {
            desired.normalize();
        }

        // --------------------------------------------
        // Turn toward target
        // --------------------------------------------

        const angle =
            forward.angleTo(
                desired
            );

        if (angle > 0.0001) {
            const axis =
                new THREE.Vector3()
                    .crossVectors(
                        forward,
                        desired
                    );

            if (axis.lengthSq() > 0.000001) {
                axis.normalize();

                const turn =
                    Math.min(
                        angle,
                        this.turnRate * dt
                    );

                const rotation =
                    new THREE.Quaternion()
                        .setFromAxisAngle(
                            axis,
                            turn
                        );

                this.quaternion
                    .premultiply(
                        rotation
                    );

                this.quaternion.normalize();
            }
        }

        // --------------------------------------------
        // Movement
        // --------------------------------------------

        const newForward =
            new THREE.Vector3(
                0,
                0,
                -1
            ).applyQuaternion(
                this.quaternion
            );

        this.position.addScaledVector(
            newForward,
            this.speed * dt
        );
    }
}