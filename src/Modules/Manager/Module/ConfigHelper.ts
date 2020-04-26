/* eslint-disable no-unused-vars */
import {Collection} from "eris";
import {Module} from "../../../Core/Structures/Module";






export enum ConfigOp{
    show = 0,
    view = 0,
    get = 0,
    set = 1,
    add = 2,
    remove = 3,
    clear = 4,
    reset = 5
}

export namespace ConfigKeys{
    export type starboard = "selfstar" | "starchannel" | "ignoredchannels" | "ignoredroles" | "customstar" | "starcount";
}


function configurableModules(modules: Collection<Module>): Array<Module>{
    return modules.filter((m: Module) => !m.private && m.hasCfg);
}


function toggleableModules(modules: Collection<Module>): Array<Module> {
    return modules.filter((m: Module) => !m.private && !m.alwaysEnabled);
}














export {configurableModules as configurableModules};
export {toggleableModules as toggleableModules};