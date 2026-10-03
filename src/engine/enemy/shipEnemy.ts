import * as THREE from "three";

import {
    Enemy,
    type EnemyControls,
    type EnemyOptions,
} from "./enemy";

export type ShipEnemyOptions =
    EnemyOptions;

export class ShipEnemy extends Enemy {
    constructor(
        position: THREE.Vector3,
        options: ShipEnemyOptions
    ) {
        super(
            position,
            options.collisionRadius ?? 10,
            {
                health:
                    options.health ?? 250,

                speed:
                    options.speed ?? 20,
            }
        );

        this.quaternion.identity();

        this.createShip();

        this.syncTransform();
    }

    private createShip() {
        /*
         * Simple destroyer-like silhouette for now.
         * We'll replace/expand this once naval
         * gameplay is working.
         */

        const hull =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    7,
                    2.5,
                    20
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x555555,
                })
            );

        hull.position.y =
            1.5;

        this.group.add(
            hull
        );

        const deck =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    5,
                    1,
                    12
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x777777,
                })
            );

        deck.position.y =
            3.25;

        deck.position.z =
            1;

        this.group.add(
            deck
        );

        const bridge =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    3.5,
                    2.5,
                    4
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x888888,
                })
            );

        bridge.position.y =
            5;

        bridge.position.z =
            2;

        this.group.add(
            bridge
        );

        /*
         * Forward gun turret.
         */
        const turret =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    1.1,
                    1.1,
                    0.8,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x444444,
                })
            );

        turret.position.y =
            4;

        turret.position.z =
            -6;

        this.group.add(
            turret
        );

        const barrel =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.35,
                    0.35,
                    4
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x333333,
                })
            );

        barrel.position.y =
            4.35;

        barrel.position.z =
            -7.5;

        this.group.add(
            barrel
        );

        const rearStructure =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    3,
                    2,
                    3
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x777777,
                })
            );

        rearStructure.position.y =
            4;

        rearStructure.position.z =
            7;

        this.group.add(
            rearStructure
        );
    }

    private syncTransform() {
        this.group.position.copy(
            this.position
        );

        this.group.quaternion.copy(
            this.quaternion
        );
    }

    update(
        dt: number,
        _controls: EnemyControls
    ) {
        if (!this.alive) {
            return;
        }

        /*
         * Ships currently sail straight ahead.
         *
         * The important thing is that this movement
         * is completely independent of Aircraft.
         */
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

        this.syncTransform();
    }
}