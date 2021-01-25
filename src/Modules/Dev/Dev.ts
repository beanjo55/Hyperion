import Module, { configKey } from "../../Structures/Module";
import hyperion from "../../main";
interface devConfig {sally: number; friends: Array<string>}

const keys: {[key: string]: configKey} = {
    "sally": {
        name: "sally",
        array: false,
        default: 3,
        key: "sally",
        langName: "sally",
        aliases: ["sal cute"],
        type: "number"
    },
    "friends": {
        name: "friends",
        array: true,
        default: [],
        key: "friends",
        langName: "friends",
        type: "user"
    }
};
const config = (data: Partial<devConfig>): devConfig => {
    const out: Partial<devConfig> = {};
    out.friends = data.friends ?? [];
    out.sally = data.sally ?? 3;
    return out as devConfig;
};
export default class Dev extends Module<devConfig> {
    constructor(Hyperion: hyperion){
        const configKeys = new Map<string, configKey>(Object.entries(keys));

        super({
            name: "dev",
            dir: __dirname,
            path: __dirname + "/Dev.js",
            hasCommands: true,
            config,
            save: (data: Partial<devConfig>): devConfig => {
                const template = config({});
                for(const key of Object.keys(data) as Array<keyof devConfig>){
                    if(data[key] === template[key]){
                        delete data[key];
                    }
                }
                return data as devConfig;
            },
            configKeys,
            private: true
        }, Hyperion);
    }

    async onLoad(){
        return true;
    }
}