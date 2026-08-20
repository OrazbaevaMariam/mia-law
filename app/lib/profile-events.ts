export const PROFILE_UPDATED_EVENT = "profile-updated";

export function emitProfileUpdated(fullName: string) {
    window.dispatchEvent(
        new CustomEvent(PROFILE_UPDATED_EVENT, { detail: { fullName } })
    );
}