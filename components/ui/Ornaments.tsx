export function OrnamentDivider() {
    return (
        <div className="flex items-center justify-center gap-4 my-12" aria-hidden>
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#556B2F]" />
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="3" stroke="#D4AF37" strokeWidth="1" />
                <path d="M9 0V4M9 14V18M0 9H4M14 9H18" stroke="#D8A1A1" strokeWidth="0.6" />
            </svg>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#556B2F]" />
        </div>
    );
}

export function CornerFrame({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden
        >
            <path
                d="M2 20V6C2 3.79086 3.79086 2 6 2H20"
                stroke="#D4AF37"
                strokeWidth="1"
                strokeOpacity="0.6"
            />
            <circle cx="2" cy="2" r="1.5" fill="#D8A1A1" />
        </svg>
    );
}

export function ThreadLine({ progress }: { progress: number }) {
    return (
        <div
            className="thread-line"
            style={{ transform: `scaleY(${progress})` }}
            aria-hidden
        />
    );
}