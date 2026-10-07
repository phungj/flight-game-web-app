"use client";

import {
    ControlBindings,
} from "@/src/engine/controls";

import {
    ControlSettings,
} from "@/components/ControlSettings";
import {useEffect, useState} from "react";

type OptionsMenuProps = {
    bindings: ControlBindings;
    setBindings: React.Dispatch<
        React.SetStateAction<ControlBindings>
    >;
    onBack: () => void;
};

export function OptionsMenu({
    bindings,
    setBindings,
    onBack,
}: OptionsMenuProps) {
    const [
        isRebinding,
        setIsRebinding,
    ] = useState<boolean>(false);

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent
        ) {
            if (
                event.code === "Escape" &&
                !isRebinding
            ) {
                event.preventDefault();
                onBack();
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        isRebinding,
        onBack,
    ]);

    return (
        <main
            style={{
                width: "100vw",
                height: "100vh",
                background: "#111",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "monospace",
                overflow: "auto",
            }}
        >
            <div
                style={{
                    width:
                        "min(700px, 90vw)",
                    padding: "40px 0",
                }}
            >
                <div
                    style={{
                        fontSize: "36px",
                        fontWeight: "bold",
                        letterSpacing: "2px",
                        marginBottom: "6px",
                    }}
                >
                    OPTIONS
                </div>

                <div
                    style={{
                        color: "#777",
                        fontSize: "14px",
                        marginBottom: "32px",
                        letterSpacing: "1px",
                    }}
                >
                    GAME SETTINGS
                </div>

                <div
                    style={{
                        marginBottom: "12px",
                        fontSize: "18px",
                        fontWeight: "bold",
                    }}
                >
                    CONTROLS
                </div>

                <ControlSettings
                    bindings={bindings}
                    setBindings={
                        setBindings
                    }
                    onRebindingChange={setIsRebinding}
                />

                <button
                    type="button"
                    onClick={onBack}
                    style={{
                        marginTop: "24px",
                        padding:
                            "12px 20px",
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
                    BACK
                </button>
            </div>
        </main>
    );
}
