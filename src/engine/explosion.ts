import * as THREE from "three";

export class Explosion {
    group = new THREE.Group();

    alive = true;

    life = 0;
    duration = 0.7;

    private core: THREE.Mesh;

    private fragments: {
        mesh: THREE.Mesh;
        velocity: THREE.Vector3;
    }[] = [];

    constructor(
        position: THREE.Vector3
    ) {
        this.group.position.copy(
            position
        );

        // ------------------------------------------------
        // Core
        // ------------------------------------------------

        const coreGeometry =
            new THREE.SphereGeometry(
                1,
                12,
                12
            );

        const coreMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xffdd88,
                transparent: true,
                opacity: 1,
            });

        this.core =
            new THREE.Mesh(
                coreGeometry,
                coreMaterial
            );

        this.group.add(
            this.core
        );

        // ------------------------------------------------
        // Fragments
        // ------------------------------------------------

        const fragmentGeometry =
            new THREE.SphereGeometry(
                0.12,
                6,
                6
            );

        const fragmentMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xffaa44,
            });

        for (
            let i = 0;
            i < 10;
            i++
        ) {
            const mesh =
                new THREE.Mesh(
                    fragmentGeometry,
                    fragmentMaterial
                );

            const direction =
                new THREE.Vector3(
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1
                ).normalize();

            const speed =
                15 +
                Math.random() * 35;

            this.fragments.push({
                mesh,
                velocity:
                    direction.multiplyScalar(
                        speed
                    ),
            });

            this.group.add(
                mesh
            );
        }
    }

    update(dt: number) {
        if (!this.alive) {
            return;
        }

        this.life += dt;

        const progress =
            this.life /
            this.duration;

        if (
            progress >= 1
        ) {
            this.alive = false;
            return;
        }

        // ------------------------------------------------
        // Core
        // ------------------------------------------------

        const coreScale =
            1 +
            progress * 8;

        this.core.scale.setScalar(
            coreScale
        );

        const coreMaterial =
            this.core.material as
                THREE.MeshBasicMaterial;

        coreMaterial.opacity =
            1 - progress;

        // ------------------------------------------------
        // Fragments
        // ------------------------------------------------

        for (
            const fragment of
            this.fragments
            ) {
            fragment.mesh.position
                .addScaledVector(
                    fragment.velocity,
                    dt
                );

            fragment.velocity.multiplyScalar(
                Math.pow(0.15, dt)
            );

            fragment.mesh.scale.setScalar(
                1 - progress
            );
        }
    }
}