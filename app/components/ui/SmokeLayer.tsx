// "use client";
//
// export default function SmokeLayer() {
//     return (
//         <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
//             <div className="absolute inset-0 ambient-glow" />
//             <div
//                 className="absolute -left-1/4 top-1/4 h-[60vh] w-[60vw] rounded-full bg-olive/20 blur-[100px] animate-smoke"
//                 style={{ animationDelay: "0s" }}
//             />
//             <div
//                 className="absolute right-0 top-0 h-[50vh] w-[50vw] rounded-full bg-rose/10 blur-[110px] animate-smoke"
//                 style={{ animationDelay: "-6s" }}
//             />
//             <div
//                 className="absolute bottom-0 left-1/3 h-[45vh] w-[45vw] rounded-full bg-gold/10 blur-[120px] animate-smoke"
//                 style={{ animationDelay: "-12s" }}
//             />
//         </div>
//     );
// }
"use client";

export function SmokeLayer({ className = "" }: { className?: string }) {
    return (
        <div className={`smoke-layer ${className}`} aria-hidden />
    );
}