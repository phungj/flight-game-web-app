import {LevelObjectDefinition} from "@/src/levels/types";
import * as THREE from "three";

export const objectMaterials = {
    tent:
        new THREE.MeshStandardMaterial({
            color: 0x8f9b70,
        }),

    container:
        new THREE.MeshStandardMaterial({
            color: 0x6b7378,
        }),

    fuelTank:
        new THREE.MeshStandardMaterial({
            color: 0xb8b8a0,
        }),

    building:
        new THREE.MeshStandardMaterial({
            color: 0x77736a,
        }),

    crate:
        new THREE.MeshStandardMaterial({
            color: 0x8a633f,
        }),
};

export function createLevelObject(
    definition: LevelObjectDefinition
): THREE.Group {
    const group =
        new THREE.Group();

    switch (
        definition.type
        ) {
        case "tent": {
            /*
             * --------------------------------------------------
             * Field tent
             * --------------------------------------------------
             *
             * Roughly 12 wide, 5 tall, and 18 long.
             */
            const mesh =
                new THREE.Mesh(
                    new THREE.ConeGeometry(
                        6,
                        5,
                        4
                    ),
                    objectMaterials.tent
                );

            mesh.rotation.y =
                Math.PI / 4;

            mesh.scale.set(
                1,
                1,
                1.5
            );

            mesh.position.y =
                2.5;

            group.add(
                mesh
            );

            break;
        }

        case "container": {
            /*
             * --------------------------------------------------
             * Shipping container
             * --------------------------------------------------
             */
            const mesh =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        10,
                        9,
                        25
                    ),
                    objectMaterials.container
                );

            mesh.position.y =
                4.5;

            group.add(
                mesh
            );

            break;
        }

        case "fuel-tank": {
            /*
             * --------------------------------------------------
             * Fuel tank
             * --------------------------------------------------
             *
             * Long horizontal cylindrical tank.
             */
            const mesh =
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        6,
                        6,
                        20,
                        16
                    ),
                    objectMaterials.fuelTank
                );

            mesh.rotation.z =
                Math.PI / 2;

            mesh.position.y =
                6;

            group.add(
                mesh
            );

            break;
        }

        case "building": {
            /*
             * --------------------------------------------------
             * Depot building
             * --------------------------------------------------
             */
            const mesh =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        30,
                        20,
                        40
                    ),
                    objectMaterials.building
                );

            mesh.position.y =
                10;

            group.add(
                mesh
            );

            break;
        }

        case "crate": {
            /*
             * --------------------------------------------------
             * Crate
             * --------------------------------------------------
             */
            const mesh =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        6,
                        6,
                        6
                    ),
                    objectMaterials.crate
                );

            mesh.position.y =
                3;

            group.add(
                mesh
            );

            break;
        }

        default:
            throw new Error(
                `Unknown level object type: ${
                    (
                        definition as
                            LevelObjectDefinition
                    ).type
                }`
            );
    }

    group.position.set(
        ...definition.position
    );

    if (
        definition.rotation !==
        undefined
    ) {
        group.rotation.y =
            definition.rotation;
    }

    if (
        definition.scale
    ) {
        group.scale.set(
            ...definition.scale
        );
    }

    return group;
}
