import Module, {configKey} from "../../Structures/Module";
import hyperion, { modLogType } from "../../main";
import { Guild, User } from "eris";


type actions = "ban" | "unban" | "kick" | "softban" | "mute" | "unmute" | "warn" | "lock" | "persist";

interface actionOpts {
    reason?: string
}

interface muteOpts extends actionOpts {
    duration?: number;
    roles?: Array<string>;
}

interface banOpts extends actionOpts {
    duration?: number;
}

interface lockOpts extends actionOpts {
    channels: Array<string>;
    duration?: number;
}

interface persistOpts extends actionOpts {
    roles: Array<string>;
    duration?: number;
    end?: true;
}

interface configType {
    caseNumber: number;
    modRoles: Array<string>;
    protectedRoles: Array<string>;
    muteRole: string;
    manageMuteRole: boolean;
    modLogChannel: string;
    lockdownGroups: {[key: string]: Array<string>}
    dmOnBan: boolean;
    dmOnKick: boolean;
    dmOnMute: boolean;
    dmOnUmute: boolean;
    banLogChannel?: string;
    kickLogChannel?: string;
    muteLogChannel?: string;
    warnLogChannel?: string;
    lockLogChannel?: string;
    persistLogChannel?: string;
    logPersists: boolean;
}

const config = (data: Partial<configType>): configType => {
    data.caseNumber ?? 0;
    data.modRoles ?? [];
    data.protectedRoles ?? [];
    data.muteRole ?? "",
    data.manageMuteRole ?? true;
    data.modLogChannel ?? "",
    data.lockdownGroups ?? {};
    data.dmOnBan ?? false;
    data.dmOnKick ?? false;
    data.dmOnMute ?? false;
    data.dmOnUmute ?? false;
    data.banLogChannel ?? "",
    data.kickLogChannel ?? "",
    data.muteLogChannel ?? "",
    data.warnLogChannel ?? "",
    data.lockLogChannel ?? "",
    data.persistLogChannel ?? "",
    data.logPersists ?? true;
    return data as configType;
};

export default class Mod extends Module<configType>{
    sweepInterval!: NodeJS.Timeout;
    constructor(Hyperion: hyperion){
        const configKeys = new Map<string, configKey>();
        super({
            name: "mod",
            dir: __dirname,
            path: __dirname + "/Mod.js",
            hasCommands: false,
            alwaysEnabled: true,
            subscribedEvents: [],
            friendlyName: "Mod",
            config,
            configKeys
        }, Hyperion);
    }

    async onLoad(){
        this.sweepInterval = setInterval(this.sweep.bind(this), 60000);
        return true;
    }

    async onUnload(){
        clearInterval(this.sweepInterval);
        return true;
    }

    sweep(): void {
        return;
    }

    async makeLog(user: User, guild: Guild, mod: User, action: "ban", options: banOpts): Promise<void>
    async makeLog(user: User, guild: Guild, mod: User, action: "mute", options: muteOpts): Promise<void>
    async makeLog(user: User, guild: Guild, mod: User, action: "lock", options: lockOpts): Promise<void>
    async makeLog(user: User, guild: Guild, mod: User, action: "persist", options: persistOpts): Promise<void>
    async makeLog(user: User, guild: Guild, mod: User, type: actions, options: actionOpts, auto = false): Promise<void> {
        const config = await this.Hyperion.manager.guild(guild.id).get();
        const caseNum = config.mod.caseNumber + 1;
        try{
            await this.Hyperion.manager.guild(guild.id).update({mod: this.updateConfig({caseNumber: caseNum}, config.mod)});
        }catch(err){
            throw new Error("mod.error.caseNumUpFail");
        }
        config.mod.caseNumber++;
        const newcase: Partial<modLogType> = {
            mid: `${guild.id}:${caseNum}`,
            user: user.id,
            guild: guild.id,
            caseNumber: caseNum,
            mod: mod.id,
            name: user.friendlyName,
            action: type,
            autoEnd: auto
        };
        if(options.reason){
            newcase.reason = options.reason;
        }
        if(["ban", "mute", "lock", "persist"].includes(type) && (options as actionOpts & {duration?: number}).duration){
            newcase.length = (options as actionOpts & {duration: number}).duration;
        }

        await this.Hyperion.manager.modlogs(newcase.mid!).create(newcase);
    }

}