import { Collection } from "eris";
import {Module} from "../../Core/Structures/Module";
import { IHyperion } from "../../types";

class Manager extends Module{
    constructor(Hyperion: IHyperion){
        super({
            name: "manager",
            friendlyName: "Manager",
            private: false,
            alwaysEnabled: true,
            hasCommands: true,
            needsInit: false,
            needsLoad: false,
            hasCfg: false,
            dirname: __dirname
        }, Hyperion);
    }

    configurableModules(modules: Collection<Module>, pro = false): Array<Module>{
        return modules.filter((m: Module) => !m.private && m.hasCfg && (m.pro ? pro : true));
    }

    toggleableModules(modules: Collection<Module>, pro = false): Array<Module> {
        return modules.filter((m: Module) => !m.private && !m.alwaysEnabled && !m.noToggle && (m.pro ? pro : true));
    }
}
export default Manager;