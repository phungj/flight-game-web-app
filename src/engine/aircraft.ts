import * as THREE from "three";

export class Aircraft {
    position = new THREE.Vector3(0, 100, 0);

    rotation = new THREE.Euler(0, 0, 0, "YXZ");
    quaternion = new THREE.Quaternion();

    speed = 100;
    throttle = 0.5;

    pitchRate = THREE.MathUtils.degToRad(60);
    rollRate = THREE.MathUtils.degToRad(120);
    yawRate = THREE.MathUtils.degToRad(30);

    acceleration = 50;

    update(
        dt: number,
        controls: {
            pitch: number;
            roll: number;
            yaw: number;
            throttle: number;
        }
    ) {
        const pitch =
            controls.pitch *
            this.pitchRate *
            dt;

        const roll =
            controls.roll *
            this.rollRate *
            dt;

        const yaw =
            controls.yaw *
            this.yawRate *
            dt;

        const pitchRotation =
            new THREE.Quaternion()
                .setFromAxisAngle(
                    new THREE.Vector3(1, 0, 0),
                    pitch
                );

        const rollRotation =
            new THREE.Quaternion()
                .setFromAxisAngle(
                    new THREE.Vector3(0, 0, 1),
                    roll
                );

        const yawRotation =
            new THREE.Quaternion()
                .setFromAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    yaw
                );

        this.quaternion
            .multiply(pitchRotation)
            .multiply(rollRotation)
            .multiply(yawRotation);

        this.quaternion.normalize();

        this.rotation.setFromQuaternion(
            this.quaternion,
            "YXZ"
        );

        /*
         * Throttle is an absolute target.
         */

        const targetThrottle =
            THREE.MathUtils.clamp(
                controls.throttle,
                0,
                1
            );

        this.throttle =
            THREE.MathUtils.damp(
                this.throttle,
                targetThrottle,
                3,
                dt
            );

        const targetSpeed =
            50 +
            this.throttle * 200;

        this.speed =
            THREE.MathUtils.damp(
                this.speed,
                targetSpeed,
                3,
                dt
            );

        const forward =
            new THREE.Vector3(
                0,
                0,
                -1
            ).applyQuaternion(
                this.quaternion
            );

        this.position.addScaledVector(
            forward,
            this.speed * dt
        );
    }
}