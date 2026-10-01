import * as THREE from "three";

export class Missile {
    position = new THREE.Vector3();
    quaternion = new THREE.Quaternion();

    speed = 500;

    turnRate =
        THREE.MathUtils.degToRad(90);

    life = 5;

    target: THREE.Vector3 | null = null;

    alive = true;

    // Once the target gets farther behind this angle,
    // the missile stops trying to turn around and chase it.
    maxGuidanceAngle =
        THREE.MathUtils.degToRad(110);

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

    loseTarget() {
        this.target = null;
    }

    update(dt: number) {
        if (!this.alive) {
            return;
        }

        this.life -= dt;

        if (this.life <= 0) {
            this.alive = false;
            return;
        }

        const forward =
            new THREE.Vector3(
                0,
                0,
                -1
            ).applyQuaternion(
                this.quaternion
            );

        if (this.target) {
            const desired =
                this.target
                    .clone()
                    .sub(this.position);

            const distance =
                desired.length();

            if (distance > 0.001) {
                desired.normalize();

                const angle =
                    forward.angleTo(
                        desired
                    );

                // Only guide while the target is
                // reasonably far in front of us.
                if (
                    angle <=
                    this.maxGuidanceAngle
                ) {
                    const axis =
                        new THREE.Vector3()
                            .crossVectors(
                                forward,
                                desired
                            );

                    if (
                        axis.lengthSq() >
                        0.000001
                    ) {
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
            }
        }

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