import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("mx-auto w-full max-w-7xl px-6 md:px-10", className)}
            {...props}
        />
    );
}