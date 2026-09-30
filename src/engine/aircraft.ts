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
        // --------------------
        // Orientation
        // --------------------

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

        // These rotations are defined in
        // aircraft-local coordinates.
        //
        // X = aircraft right
        // Y = aircraft up
        // Z = aircraft forward/back

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

        // Post-multiplication applies the rotations
        // around the aircraft's LOCAL axes.
        this.quaternion
            .multiply(pitchRotation)
            .multiply(rollRotation)
            .multiply(yawRotation);

        this.quaternion.normalize();

        // Keep the Euler around for your existing
        // rendering/debugging code.
        this.rotation.setFromQuaternion(
            this.quaternion,
            "YXZ"
        );

        // --------------------
        // Throttle
        // --------------------

        this.throttle +=
            controls.throttle * dt;

        this.throttle = THREE.MathUtils.clamp(
            this.throttle,
            0,
            1
        );

        // --------------------
        // Speed
        // --------------------

        const targetSpeed =
            50 + this.throttle * 200;

        this.speed = THREE.MathUtils.damp(
            this.speed,
            targetSpeed,
            3,
            dt
        );

        // --------------------
        // Movement
        // --------------------

        const forward =
            new THREE.Vector3(0, 0, -1)
                .applyQuaternion(this.quaternion);

        this.position.addScaledVector(
            forward,
            this.speed * dt
        );
    }
}