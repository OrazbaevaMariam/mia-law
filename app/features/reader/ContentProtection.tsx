"use client";

import { useEffect } from "react";

export function ContentProtection() {
    useEffect(() => {
        const preventContextMenu = (e: MouseEvent) => e.preventDefault();
        const preventSelection = (e: Event) => e.preventDefault();
        const preventCopy = (e: ClipboardEvent) => e.preventDefault();
        const preventKeyShortcuts = (e: KeyboardEvent) => {
            // Блокируем Ctrl/Cmd + C, S, P, U (копировать/сохранить/печать/просмотр кода)
            if ((e.ctrlKey || e.metaKey) && ["c", "s", "p", "u"].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
            // Блокируем F12 и DevTools shortcuts
            if (e.key === "F12" || ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))) {
                e.preventDefault();
            }
        };

        document.addEventListener("contextmenu", preventContextMenu);
        document.addEventListener("selectstart", preventSelection);
        document.addEventListener("copy", preventCopy);
        document.addEventListener("keydown", preventKeyShortcuts);

        return () => {
            document.removeEventListener("contextmenu", preventContextMenu);
            document.removeEventListener("selectstart", preventSelection);
            document.removeEventListener("copy", preventCopy);
            document.removeEventListener("keydown", preventKeyShortcuts);
        };
    }, []);

    return null;
}