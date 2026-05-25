import { Download } from "lucide-react";
import { landingButtons, type LandingButton } from "./landing-buttons";
import { recentChanges, type ChangeEntry } from "./recent-changes";
import { sampleDownloads, type SampleDownload } from "./sample-downloads";

const Header = () => (
    <header className="flex items-center bg-primary text-primary-foreground p-4">
        <div className="w-1/4 flex items-center">
            <img src="./logo-red.svg" alt="MTA Logo" className="h-10 mr-4" />
        </div>
        <div>
            <h1 className="text-2xl leading-none font-semibold mx-4">MTA Műszaki Tudományok Osztálya</h1>
            <h1 className="text-lg mx-4">MTA doktora pályázat</h1>
        </div>
    </header>
);

const LandingButtonCard = ({ button }: { button: LandingButton }) => {
    const Icon = button.icon;

    const handleClick = () => {
        if (button.enabled) {
            window.open(button.url, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={!button.enabled}
            title={button.tooltip}
            className={`
                flex flex-col items-center justify-center
                aspect-[4/3] w-full
                rounded-lg border border-border bg-background
                p-6 shadow-sm transition-all
                ${
                    button.enabled
                        ? "cursor-pointer hover:shadow-md hover:border-primary hover:scale-[1.02] active:scale-[0.98]"
                        : "cursor-not-allowed opacity-50"
                }
            `}
        >
            <Icon className="h-16 w-16 text-primary mb-4" strokeWidth={1.5} />
            <span className="text-lg font-semibold text-foreground">{button.title}</span>
            <span className="text-sm text-muted-foreground mt-1">{button.subtitle}</span>
        </button>
    );
};

const SampleDownloads = ({ downloads }: { downloads: SampleDownload[] }) => (
    <div className="rounded-lg border border-border bg-background shadow-sm p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Letölthető minták</h3>
        <ul className="divide-y divide-border">
            {downloads.map((item) => (
                <li key={item.path} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <Download className="shrink-0 h-5 w-5 text-primary" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    <a href={item.path} download className="shrink-0 text-xs font-medium text-primary hover:underline">
                        Letöltés
                    </a>
                </li>
            ))}
        </ul>
    </div>
);

const RecentChanges = ({ entries }: { entries: ChangeEntry[] }) => (
    <div className="rounded-lg border border-border bg-background shadow-sm p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Legutóbbi változások</h3>
        <ul className="divide-y divide-border">
            {entries.map((entry) => (
                <li key={entry.date + entry.description} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                    <time className="shrink-0 w-28 text-sm font-medium text-muted-foreground tabular-nums">{entry.date}</time>
                    <span className="text-sm text-foreground">{entry.description}</span>
                </li>
            ))}
        </ul>
    </div>
);

export const App = () => (
    <div className="flex min-h-svh flex-col bg-muted">
        <Header />
        <main className="flex-grow flex items-start justify-center p-8">
            <div className="flex flex-col gap-6 w-full max-w-4xl">
                <h2 className="text-xl font-semibold text-foreground">Kérem válassza ki a megfelelő űrlapot:</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
                    {landingButtons.map((button) => (
                        <LandingButtonCard key={button.title} button={button} />
                    ))}
                </div>
                <SampleDownloads downloads={sampleDownloads} />
                <RecentChanges entries={recentChanges} />
            </div>
        </main>
    </div>
);
