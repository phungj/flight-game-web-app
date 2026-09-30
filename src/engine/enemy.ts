import * as THREE from "three";

export class Enemy {
    position = new THREE.Vector3(
        0,
        100,
        -500
    );

    quaternion =
        new THREE.Quaternion();

    speed = 80;

    alive = true;

    private angle = 0;

    update(dt: number) {
        if (!this.alive) {
            return;
        }

        // --------------------------------------------
        // Simple circular flight path
        // --------------------------------------------

        this.angle += dt * 0.15;

        const radius = 500;

        this.position.set(
            Math.sin(this.angle) * radius,
            100,
            -500 +
            Math.cos(this.angle) * radius
        );

        // --------------------------------------------
        // Face along the path
        // --------------------------------------------

        const nextAngle =
            this.angle + 0.01;

        const nextPosition =
            new THREE.Vector3(
                Math.sin(nextAngle) * radius,
                100,
                -500 +
                Math.cos(nextAngle) * radius
            );

        const direction =
            nextPosition
                .sub(this.position)
                .normalize();

        this.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, -1),
            direction
        );
    }
}