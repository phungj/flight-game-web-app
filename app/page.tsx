"use client";

import {
    useEffect,
    useState,
} from "react";

import Game from "@/components/Game";
import {
    MissionSelect,
} from "@/components/MissionSelect";
import {
    OptionsMenu,
} from "@/components/OptionsMenu";

import {
    LEVELS,
} from "@/src/levels/levels";

import type {
    LevelDefinition,
} from "@/src/levels/types";

import {
    ControlBindings,
    getDefaultBindings,
} from "@/src/engine/controls";

type Screen =
    | "missions"
    | "options";

const CONTROL_BINDINGS_STORAGE_KEY =
    "arcade-flight-game";

export default function Home() {
    const [
        selectedLevel,
        setSelectedLevel,
    ] =
        useState<LevelDefinition | null>(
            null
        );

    const [
        bindings,
        setBindings,
    ] =
        useState<ControlBindings>(
            getDefaultBindings()
        );

    const [
        bindingsLoaded,
        setBindingsLoaded,
    ] =
        useState(false);

    useEffect(() => {
        const stored =
            localStorage.getItem(
                CONTROL_BINDINGS_STORAGE_KEY
            );

        if (stored) {
            try {
                const parsed =
                    JSON.parse(
                        stored
                    ) as ControlBindings;

                setBindings(parsed);
            } catch {
                // Ignore invalid saved bindings.
            }
        }

        setBindingsLoaded(true);
    }, []);

    useEffect(() => {
        if (!bindingsLoaded) {
            return;
        }

        localStorage.setItem(
            CONTROL_BINDINGS_STORAGE_KEY,
            JSON.stringify(bindings)
        );
    }, [
        bindings,
        bindingsLoaded,
    ]);

    const [
        screen,
        setScreen,
    ] =
        useState<Screen>(
            "missions"
        );

    if (selectedLevel) {
        return (
            <Game
                level={selectedLevel}
                bindings={bindings}
                onExit={() => {
                    setSelectedLevel(
                        null
                    );
                }}
            />
        );
    }

    if (
        screen === "options"
    ) {
        return (
            <OptionsMenu
                bindings={bindings}
                setBindings={
                    setBindings
                }
                onBack={() =>
                    setScreen(
                        "missions"
                    )
                }
            />
        );
    }

    return (
        <MissionSelect
            levels={LEVELS}
            onSelectLevel={
                setSelectedLevel
            }
            onOpenOptions={() =>
                setScreen(
                    "options"
                )
            }
        />
    );
}
