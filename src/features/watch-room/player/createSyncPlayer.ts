/**
 * Фабрика SyncPlayer по VideoUrl комнаты.
 */
import type { SyncPlayer } from "./SyncPlayer";
import { AllPlayPlayerAdapter } from "./allplay/AllPlayPlayerAdapter";
import { resolveVideoInput } from "./resolveVideoInput";
import { YouTubePlayerAdapter } from "./youtube/YouTubePlayerAdapter";

export function createSyncPlayer(
    container: HTMLElement,
    videoUrl: string
): SyncPlayer {
    const resolved = resolveVideoInput(videoUrl);
    if (!resolved) {
        throw new Error("Неподдерживаемый VideoUrl для плеера комнаты.");
    }

    if (resolved.kind === "youtube") {
        return new YouTubePlayerAdapter(container);
    }

    return new AllPlayPlayerAdapter(container);
}
