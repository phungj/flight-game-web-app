"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Controls,
    ControlAction,
    ControlBindings,
    getDefaultBindings,
} from "@/src/engine/controls";
import {formatBindings} from "@/src/engine/controls/formatBinding";

type ControlSettingsProps = {
    bindings: ControlBindings;
    setBindings: React.Dispatch<
        React.SetStateAction<ControlBindings>
    >;
    onRebindingChange: (
        rebinding: boolean
    ) => void;
};
type ControlRow = {
    action: ControlAction;
    label: string;
};

const CONTROL_ROWS: ControlRow[] = [
    {
        action: "pitchUp",
        label: "Pitch Up",
    },
    {
        action: "pitchDown",
        label: "Pitch Down",
    },
    {
        action: "rollLeft",
        label: "Roll Left",
    },
    {
        action: "rollRight",
        label: "Roll Right",
    },
    {
        action: "yawLeft",
        label: "Yaw Left",
    },
    {
        action: "yawRight",
        label: "Yaw Right",
    },
    {
        action: "throttleUp",
        label: "Throttle Up",
    },
    {
        action: "throttleDown",
        label: "Throttle Down",
    },
    {
        action: "fireGun",
        label: "Fire Gun",
    },
    {
        action: "launchMissile",
        label: "Launch Missile",
    },
    {
        action: "nextTarget",
        label: "Change Target",
    },
    {
        action: "reset",
        label: "Restart Mission",
    },
    {
        action: "exit",
        label: "Mission Select",
    },
];

export function ControlSettings({
    bindings,
    setBindings,
    onRebindingChange
}: ControlSettingsProps) {
    const controlsRef =
        useRef<Controls | null>(
            null
        );

    const [
        rebindingAction,
        setRebindingAction,
    ] =
        useState<ControlAction | null>(
            null
        );

    useEffect(() => {
        const controls =
            new Controls(bindings);

        controlsRef.current =
            controls;

        return () => {
            controls.dispose();

            controlsRef.current =
                null;
        };
    }, []);

    function startRebinding(
        action: ControlAction
    ) {
        const controls =
            controlsRef.current;

        if (!controls) {
            return;
        }

        setRebindingAction(
            action
        );

        onRebindingChange(
            true
        );

        controls.startRebinding(
            action,
            code => {
                setBindings(
                    current => ({
                        ...current,
                        [action]: [
                            code,
                        ],
                    })
                );

                setRebindingAction(
                    null
                );

                onRebindingChange(
                    false
                );
            },
            () => {
                setRebindingAction(
                    null
                );

                onRebindingChange(
                    false
                );
            }
        );
    }

    function resetBindings() {
        const controls =
            controlsRef.current;

        if (!controls) {
            return;
        }

        controls.resetBindings();

        setBindings(
            getDefaultBindings()
        );

        setRebindingAction(
            null
        );

        onRebindingChange(
            false
        );
    }

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    flexDirection:
                        "column",
                    gap: "8px",
                }}
            >
                {CONTROL_ROWS.map(
                    row => {
                        const isRebinding =
                            rebindingAction ===
                            row.action;

                        return (
                            <div
                                key={
                                    row.action
                                }
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    gap: "20px",
                                    padding:
                                        "10px 12px",
                                    background:
                                        "#1c1c1c",
                                    border:
                                        "1px solid #333",
                                }}
                            >
                                <span>
                                    {
                                        row.label
                                    }
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        startRebinding(
                                            row.action
                                        )
                                    }
                                    style={{
                                        minWidth:
                                            "120px",
                                        padding:
                                            "7px 10px",
                                        background:
                                            isRebinding
                                                ? "#333"
                                                : "#111",
                                        color:
                                            "white",
                                        border:
                                            "1px solid #555",
                                        cursor:
                                            "pointer",
                                        fontFamily:
                                            "monospace",
                                    }}
                                >
                                    {isRebinding
                                        ? "PRESS KEY"
                                        : formatBindings(
                                              bindings[
                                                  row.action
                                              ]
                                          )}
                                </button>
                            </div>
                        );
                    }
                )}
            </div>

            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    justifyContent:
                        "flex-end",
                }}
            >
                <button
                    type="button"
                    onClick={
                        resetBindings
                    }
                    style={{
                        padding:
                            "10px 16px",
                        background:
                            "#1c1c1c",
                        color: "white",
                        border:
                            "1px solid #444",
                        cursor: "pointer",
                        fontFamily:
                            "monospace",
                    }}
                >
                    RESET DEFAULTS
                </button>
            </div>

            {rebindingAction && (
                <div
                    style={{
                        marginTop: "12px",
                        color: "#999",
                        fontSize: "13px",
                    }}
                >
                    Press a key to assign it.
                    Press ESC to cancel.
                </div>
            )}
        </div>
    );
}
