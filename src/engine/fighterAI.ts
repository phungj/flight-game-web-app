import * as THREE from "three";

import {
    EnemyControls,
} from "./enemy";

import { Player } from "./player";

export type FighterAIOutput = {
    controls: EnemyControls;
    fireGun: boolean;
    fireMissile: boolean;

    debug: {
        interceptPoint: THREE.Vector3;
        horizontalAngle: number;
        verticalAngle: number;
        distance: number;
    };
};

export class FighterAI {
    private target: Player;

    constructor(
        target: Player
    ) {
        this.target = target;
    }

    update(
        fighter: Player["aircraft"]
    ): FighterAIOutput {
        if (!this.target.alive) {
            return {
                controls: {
                    pitch: 0,
                    roll: 0,
                    yaw: 0,
                    throttle: 0,
                },

                fireGun: false,
                fireMissile: false,

                debug: {
                    interceptPoint:
                        fighter.position.clone(),

                    horizontalAngle: 0,
                    verticalAngle: 0,
                    distance: 0,
                },
            };
        }

        // --------------------------------------------------
        // Estimate where the player will be
        // --------------------------------------------------

        const targetForward =
            new THREE.Vector3(
                0,
                0,
                -1
            ).applyQuaternion(
                this.target.quaternion
            );

        const targetVelocity =
            targetForward.multiplyScalar(
                this.target.speed
            );

        const toTarget =
            this.target.position
                .clone()
                .sub(
                    fighter.position
                );

        const distance =
            toTarget.length();

        if (
            distance <
            0.000001
        ) {
            return {
                controls: {
                    pitch: 0,
                    roll: 0,
                    yaw: 0,
                    throttle: 1,
                },

                fireGun: false,
                fireMissile: false,

                debug: {
                    interceptPoint:
                        this.target.position.clone(),

                    horizontalAngle: 0,
                    verticalAngle: 0,
                    distance,
                },
            };
        }

        // --------------------------------------------------
        // Predict target position
        // --------------------------------------------------

        const interceptTime =
            THREE.MathUtils.clamp(
                distance / 300,
                0,
                3
            );

        const interceptPoint =
            this.target.position
                .clone()
                .addScaledVector(
                    targetVelocity,
                    interceptTime
                );

        // --------------------------------------------------
        // Convert target point into fighter-local space
        // --------------------------------------------------

        const desiredDirection =
            interceptPoint
                .clone()
                .sub(
                    fighter.position
                )
                .normalize();

        const localTarget =
            desiredDirection
                .clone()
                .applyQuaternion(
                    fighter.quaternion
                        .clone()
                        .invert()
                );

        const horizontalAngle =
            Math.atan2(
                localTarget.x,
                -localTarget.z
            );

        const verticalAngle =
            Math.atan2(
                localTarget.y,
                Math.sqrt(
                    localTarget.x *
                    localTarget.x +
                    localTarget.z *
                    localTarget.z
                )
            );

        // --------------------------------------------------
        // Steering
        // --------------------------------------------------

        // Deliberately use a wider response range than
        // before. This makes the fighter turn aggressively
        // when badly misaligned without constantly
        // flipping between full-left and full-right
        // corrections near the target.
        const steeringAngle =
            THREE.MathUtils.degToRad(
                35
            );

        const yaw =
            THREE.MathUtils.clamp(
                horizontalAngle /
                steeringAngle,
                -1,
                1
            );

        const pitch =
            THREE.MathUtils.clamp(
                verticalAngle /
                steeringAngle,
                -1,
                1
            );

        // --------------------------------------------------
        // Weapons
        // --------------------------------------------------

        const gunAngle =
            THREE.MathUtils.degToRad(
                8
            );

        const missileAngle =
            THREE.MathUtils.degToRad(
                25
            );

        const fireGun =
            distance < 800 &&
            Math.abs(
                horizontalAngle
            ) < gunAngle &&
            Math.abs(
                verticalAngle
            ) < gunAngle;

        const fireMissile =
            distance < 1500 &&
            Math.abs(
                horizontalAngle
            ) < missileAngle &&
            Math.abs(
                verticalAngle
            ) < missileAngle;

        return {
            controls: {
                pitch,
                roll: 0,
                yaw,
                throttle: 1,
            },

            fireGun,
            fireMissile,

            debug: {
                interceptPoint,
                horizontalAngle,
                verticalAngle,
                distance,
            },
        };
    }
}