import type { ReactNode } from "react";

interface AdvertisementAdminPageHeaderProps {
    title: string;
    description: string;
    actions?: ReactNode;
}

/** Presentation-only header shared by Advertisement Administration pages. */
export default function AdvertisementAdminPageHeader({
    title,
    description,
    actions,
}: AdvertisementAdminPageHeaderProps) {
    return (
        <header className="flex w-full flex-col gap-5 rounded-2xl bg-[#008236] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-9 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white sm:text-base">{description}</p>
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 [&_button]:border-white/70 [&_button]:bg-white [&_button]:text-[#008236] [&_button:hover]:bg-green-50 [&_a]:border-white/70 [&_a]:bg-white [&_a]:text-[#008236] [&_a:hover]:bg-green-50">{actions}</div>}
        </header>
    );
}
