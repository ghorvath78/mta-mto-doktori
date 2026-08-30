import { Help } from "./help.tsx";
import { FormPanel } from "./formpanel";
import { ButtonPanel } from "./buttonpanel";
import { useFormInfo } from "./hooks.ts";
import { useInfoState } from "./infostate.ts";

const Header = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <header className="flex items-center bg-primary text-primary-foreground p-4">
        <div className="w-1/4 flex items-center">
            <img src="./logo-red.svg" alt="MTA Logo" className="h-10 mr-4" />
        </div>
        <div>
            <h1 className="text-2xl leading-none font-semibold mx-4">{title}</h1>
            <h1 className="text-lg mx-4">{subtitle}</h1>
        </div>
    </header>
);

export const MainScreen = () => {
    const formInfo = useFormInfo();
    const { panelOpen: infoOpen } = useInfoState();

    return (
        <div className="flex min-h-svh flex-col bg-muted h-screen">
            <Header title={formInfo.title} subtitle={formInfo.subtitle ?? ""} />
            <ButtonPanel formInfo={formInfo} />
            <div className="flex-grow flex min-h-0">
                <FormPanel />
                {infoOpen && <Help />}
            </div>
        </div>
    );
};
