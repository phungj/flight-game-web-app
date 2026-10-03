import * as THREE from "three";

import { Aircraft } from "@/src/engine/aircraft";
import { Enemy } from "@/src/engine/enemy/enemy";
import { Player } from "@/src/engine/player";

export type Target = {
    enemy: Enemy;
    name: string;
};

type TargetCandidate = {
    target: Target;
    angle: number;
    distance: number;
    screenX: number;
    screenY: number;
};

const MAX_TARGET_ANGLE =
    THREE.MathUtils.degToRad(120);

/**
 * Returns the full 3D angular distance between
 * the aircraft's forward direction and the target.
 *
 * This operates on generic target positions, so
 * the target can be an aircraft, ship, or anything
 * else represented by Enemy.
 */
function getTargetAngle(
    aircraft: Aircraft,
    targetPosition: THREE.Vector3
): number {
    const toTarget =
        targetPosition
            .clone()
            .sub(aircraft.position);

    if (
        toTarget.lengthSq() <
        0.000001
    ) {
        return 0;
    }

    toTarget.normalize();

    const forward =
        new THREE.Vector3(
            0,
            0,
            -1
        ).applyQuaternion(
            aircraft.quaternion
        );

    forward.normalize();

    return Math.acos(
        THREE.MathUtils.clamp(
            forward.dot(toTarget),
            -1,
            1
        )
    );
}

/**
 * Projects a target into normalized device coordinates
 * using the camera.
 *
 * X:
 *   -1 = left edge
 *    0 = center
 *   +1 = right edge
 *
 * Y:
 *   -1 = bottom
 *    0 = center
 *   +1 = top
 */
function getScreenPosition(
    camera: THREE.Camera,
    targetPosition: THREE.Vector3
): THREE.Vector2 {
    const projected =
        targetPosition
            .clone()
            .project(camera);

    return new THREE.Vector2(
        projected.x,
        projected.y
    );
}

/**
 * Build candidates for target cycling.
 */
function getCandidates(
    playerAircraft: Aircraft,
    camera: THREE.Camera,
    targets: Target[],
    currentTarget?: Target
): TargetCandidate[] {
    return targets
        .filter(
            target =>
                target.enemy.alive &&
                target !== currentTarget
        )
        .map(target => {
            const position =
                target.enemy.position;

            const distance =
                playerAircraft.position.distanceTo(
                    position
                );

            const angle =
                getTargetAngle(
                    playerAircraft,
                    position
                );

            const screen =
                getScreenPosition(
                    camera,
                    position
                );

            return {
                target,
                angle,
                distance,
                screenX: screen.x,
                screenY: screen.y,
            };
        });
}

/**
 * Select the target that is most directly in front
 * of the player's aircraft.
 *
 * Used for initial target selection and recovery
 * after the current target is destroyed.
 */
export function selectBestTarget(
    player: Player,
    targets: Target[]
): Target | undefined {
    const candidates =
        targets
            .filter(
                target =>
                    target.enemy.alive
            )
            .map(target => ({
                target,
                angle: getTargetAngle(
                    player.aircraft,
                    target.enemy.position
                ),
                distance:
                    player.aircraft.position.distanceTo(
                        target.enemy.position
                    ),
            }));

    if (
        candidates.length === 0
    ) {
        return undefined;
    }

    const visibleCandidates =
        candidates.filter(
            candidate =>
                candidate.angle <=
                MAX_TARGET_ANGLE
        );

    const pool =
        visibleCandidates.length > 0
            ? visibleCandidates
            : candidates;

    pool.sort(
        (a, b) => {
            const angleDifference =
                a.angle - b.angle;

            if (
                Math.abs(
                    angleDifference
                ) >
                THREE.MathUtils.degToRad(1)
            ) {
                return angleDifference;
            }

            return (
                a.distance -
                b.distance
            );
        }
    );

    return pool[0].target;
}

/**
 * Select the next target by moving rightward
 * across the player's screen.
 */
export function selectNextTarget(
    player: Player,
    camera: THREE.Camera,
    targets: Target[],
    currentTarget?: Target
): Target | undefined {
    const candidates =
        getCandidates(
            player.aircraft,
            camera,
            targets,
            currentTarget
        );

    if (
        candidates.length === 0
    ) {
        return currentTarget;
    }

    const visibleCandidates =
        candidates.filter(
            candidate =>
                candidate.angle <=
                MAX_TARGET_ANGLE
        );

    const pool =
        visibleCandidates.length > 0
            ? visibleCandidates
            : candidates;

    let currentScreenX = -1;

    if (
        currentTarget &&
        currentTarget.enemy.alive
    ) {
        currentScreenX =
            getScreenPosition(
                camera,
                currentTarget.enemy.position
            ).x;
    }

    const toRight =
        pool
            .filter(
                candidate =>
                    candidate.screenX >
                    currentScreenX
            )
            .sort(
                (a, b) =>
                    a.screenX -
                    b.screenX
            );

    if (
        toRight.length > 0
    ) {
        return toRight[0].target;
    }

    pool.sort(
        (a, b) =>
            a.screenX -
            b.screenX
    );

    return pool[0].target;
}

/**
 * Select the previous target by moving leftward
 * across the player's screen.
 */
export function selectPreviousTarget(
    player: Player,
    camera: THREE.Camera,
    targets: Target[],
    currentTarget?: Target
): Target | undefined {
    const candidates =
        getCandidates(
            player.aircraft,
            camera,
            targets,
            currentTarget
        );

    if (
        candidates.length === 0
    ) {
        return currentTarget;
    }

    const visibleCandidates =
        candidates.filter(
            candidate =>
                candidate.angle <=
                MAX_TARGET_ANGLE
        );

    const pool =
        visibleCandidates.length > 0
            ? visibleCandidates
            : candidates;

    let currentScreenX = 1;

    if (
        currentTarget &&
        currentTarget.enemy.alive
    ) {
        currentScreenX =
            getScreenPosition(
                camera,
                currentTarget.enemy.position
            ).x;
    }

    const toLeft =
        pool
            .filter(
                candidate =>
                    candidate.screenX <
                    currentScreenX
            )
            .sort(
                (a, b) =>
                    b.screenX -
                    a.screenX
            );

    if (
        toLeft.length > 0
    ) {
        return toLeft[0].target;
    }

    pool.sort(
        (a, b) =>
            b.screenX -
            a.screenX
    );

    return pool[0].target;
}