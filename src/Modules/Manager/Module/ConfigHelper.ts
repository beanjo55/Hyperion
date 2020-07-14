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

export interface KeyInfo{
    format: "string" | "array";
    contentType: "string" | "number" | "user" | "role" | "channel";
}

export interface Key{
    module: string;
    name: string;
    info: KeyInfo;
    description: string;
    ops: Array<ConfigOp>;
}

export interface ModuleKeys{
    keys: Array<Key>;
    description: string;
}


function configurableModules(modules: Collection<Module>): Array<Module>{
    return modules.filter((m: Module) => !m.private && m.hasCfg);
}


function toggleableModules(modules: Collection<Module>): Array<Module> {
    return modules.filter((m: Module) => !m.private && !m.alwaysEnabled && !m.noToggle);
}



export {configurableModules as configurableModules};
export {toggleableModules as toggleableModules};