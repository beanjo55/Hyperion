import { CategoryChannel, Collection, Embed, Guild, Member, NewsChannel, Role, TextChannel, User, VoiceChannel } from "eris";
import hyperion from "../main";

export interface ack {
    dev: boolean;
    admin: boolean;
    staff: boolean;
    support: boolean;
    contrib: boolean;
    friend: boolean;
    pro: boolean;
    custom?: string;
}
const blankAck: ack = {
    dev: false,
    admin: false,
    staff: false,
    support: false,
    contrib: false,
    friend: false,
    pro: false
};

const ackData: Array<{name: keyof Omit<ack, "custom">, shift: number}> = [
    {name: "dev", shift: 1 << 1},
    {name: "admin", shift: 1 << 2},
    {name: "staff", shift: 1 << 3},
    {name: "support", shift: 1 << 4},
    {name: "contrib", shift: 1 << 5},
    {name: "friend", shift: 1 << 6},
    {name: "pro", shift: 1 << 7}
];

export default class Utils {
    Hyperion: hyperion;
    constructor(Hyperion: hyperion) {
        this.Hyperion = Hyperion;
    }

    input2Boolean(input: string): boolean | undefined {
        if(!input){return;}
        input = input.trim().toLowerCase();
        if(input === "yes" || input === "true"){return true;}
        if(input === "no" || input === "false"){return false;}
    }

    arrayShared(arr1: Array<unknown>, arr2: Array<unknown>): boolean {
        return arr1.some(ele => arr2.includes(ele));
    }

    async gofUser(id: string): Promise<User | undefined> {
        return this.Hyperion.client.users.get(id) ?? await this.Hyperion.client.getRESTUser(id).catch(() => undefined);
    }

    async gofMember(guild: Guild, id: string): Promise<Member | undefined> {
        return guild.members.get(id) ?? await guild.fetchMembers({userIDs: [id]}).then(x => x[0]).catch(() => undefined);
    }

    async getAcks(id: string): Promise<ack>{
        const data = this.Hyperion.redis.get(`acks:${id}`);
        const custom = this.Hyperion.redis.get(`acks:custom:${id}`);
        return await Promise.all([data, custom]).then(results => {
            const out: Partial<ack> = {};
            const baseAcks = Number(results[0] ??= "0");
            for(const val of ackData){
                if(baseAcks & val.shift){
                    out[val.name] = true;
                }else{
                    out[val.name] = false;
                }
            }
            if(results[1]){
                out.custom = results[1];
            }
            return out as ack;
        }).catch(err => {this.Hyperion.logger.warn("Hyperion", `Failed to get acks, err: ${err.message}`, "Acks"); return blankAck;});
    }

    async setAcks(id: string, name: keyof Omit<ack, "custom">, value: boolean): Promise<ack>;
    async setAcks(id: string, name: "custom", value: string): Promise<ack>;
    async setAcks(id: string, name: keyof ack, value: boolean | string): Promise<ack> {
        const data = await this.getAcks(id);
        if(name !== "custom"){
            if(data[name] === value){
                return data;
            }else{
                data[name] = !data[name];
                const bitData = ackData.find(d => d.name === name);
                if(!bitData){throw new Error("Tried to get a non existant ack");}
                let num = Number((await this.Hyperion.redis.get(`acks:${id}`)) ?? 0);
                num ^= bitData.shift;
                await this.Hyperion.redis.set(`acks:${id}`, num);
                return data;
            }
        }else{
            if(value === ""){
                delete data.custom;
                await this.Hyperion.redis.del(`acks:custom:${id}`);
                return data;
            }else{
                data.custom = value as string;
                await this.Hyperion.redis.set(`acks:custom:${id}`, value as string);
                return data;
            }
        }
    }

    multiArg(input: Array<string>, options: Array<string>): undefined | {match: string; offset: number} {
        const matches: Array<string> = [];
        const ogOptions = [...options.values()];
        options.map((option, index) => {
            options[index] = option.split(" ").join("");
        });
        for(const option of options){
            if(option.toLowerCase().startsWith(input[0].toLowerCase())){matches.push(option);}
        }
        if(matches.length === 0){return;}
        for(const match of matches){
            if(match.toLowerCase() === input[0].toLowerCase()){return {match: match, offset: 0};}
            let out: {match: string; offset: number} | undefined = undefined;
            input.forEach((value: string, index: number) => {
                if(index !== 0){
                    if(match.toLowerCase().endsWith(value.toLowerCase())){
                        if(match.toLowerCase() === input.slice(0, index+1).join("").toLowerCase()){
                            out = {match: ogOptions[options.indexOf(match)], offset: index};
                        }
                    }
                }
            });
            if(out !== undefined){return out;}
        }
        return undefined;
    }

    //to appease boss
    toCap(input: string): string {
        return input.charAt(0).toUpperCase() + input.substring(1);
    }
    
    merge<T>(oldData: T, newData: Partial<T>): T {
        for(const key of Object.keys(newData)){
            oldData[key as keyof T] = newData[key as keyof T]!;
        }
        return oldData;
    }

    async splitText(input: string, channel: TextChannel,  options?: {maxLength?: number; maxSplits?: number; header?: string; footer?: string; codeBlock?: true}): Promise<void> {
        if(!options){options = {};}
        const maxLength = options.maxLength ?? 1990;
        const maxSplits = options.maxSplits ?? 10;
        if(options.header){input = options.header + " " + input;}
        if(options.footer){input = input + " " + options.footer;}
        for(let i = 1; i <= maxSplits; i++){
            let toPost = input.substring(0, maxLength);
            if(options.codeBlock){toPost = "```\n" + toPost + "\n```";}
            input = input.substring(maxLength);
            await channel.createMessage(toPost).catch(() => undefined);
            if(input.length === 0){break;}
        }
    }

    splitEmbed(template: Partial<Embed>, input: string, options?: {maxLength?: number; maxEmbeds?: number, codeBlock?: true}): Array<Partial<Embed>> {
        const output: Array<Partial<Embed>> = [];
        if(!options){options = {};}
        const maxLength = options.maxEmbeds ?? 1990;
        const maxEmbeds = options.maxEmbeds ?? 5;
        if(input.length <= maxLength){
            template.description = options.codeBlock ? "```\n" + input + "\n```" : input;
            return [template];
        }
        const header: Partial<Embed> = Object.fromEntries(Object.entries(template));
        const footer: Partial<Embed> = Object.fromEntries(Object.entries(template));
        delete header.footer;
        delete header.timestamp;
        delete header.image;
        delete footer.title;
        delete footer.thumbnail;
        delete template.title;
        delete template.footer;
        delete template.timestamp;
        delete template.thumbnail;
        delete template.image;

        for(let i = 1; i <= maxEmbeds; i++){
            let toPost = input.substring(0, maxLength);
            if(options.codeBlock){toPost = "```\n" + toPost + "\n```";}
            input = input.substring(maxLength);
            if(i === 1){
                header.description = toPost;
                output.push(header);
                continue;
            }
            if(i === maxEmbeds || input.length === 0){
                footer.description = toPost;
                output.push(footer);
                break;
            }
            template.description = toPost;
            output.push(template);
        }

        return output;
    }

    resolveTextChannel(input: string, guild: Guild): NewsChannel | TextChannel | undefined {
        input = input.trim().replace(new RegExp(" ", "gmi"), "-").toLowerCase();
        let chan = guild.channels.get(input);
        if(chan && ([0, 5].includes(chan.type))){return chan as TextChannel | NewsChannel;}
        if(!chan){
            chan = (guild.channels.find(c => (c.type === 0 || c.type === 5) && c.name === input) as undefined | NewsChannel | TextChannel);
        }
        if(!chan){
            chan = (guild.channels.find(c => (c.type === 0 || c.type === 5) && c.name.startsWith(input)) as undefined | NewsChannel | TextChannel);
        }
        return chan as undefined | TextChannel | NewsChannel;
    }

    resolveVoiceChannel(input: string, guild: Guild): VoiceChannel | undefined {
        input = input.trim().toLowerCase();
        let chan = guild.channels.get(input);
        if(chan?.type === 2){return chan as VoiceChannel;}
        if(!chan){
            chan = (guild.channels.find(c => c.type === 2 && c.name.toLowerCase() === input) as undefined | VoiceChannel);
        }
        if(!chan){
            chan = (guild.channels.find(c => c.type === 2 && c.name.toLowerCase().startsWith(input)) as undefined | VoiceChannel);
        }
        return chan as undefined | VoiceChannel;
    }

    resolveCategoryChannel(input: string, guild: Guild): CategoryChannel | undefined {
        input = input.trim().toLowerCase();
        let chan = guild.channels.get(input);
        if(chan?.type === 4){return chan as CategoryChannel;}
        if(!chan){
            chan = (guild.channels.find(c => c.type === 4 && c.name.toLowerCase() === input) as undefined | CategoryChannel);
        }
        if(!chan){
            chan = (guild.channels.find(c => c.type === 4 && c.name.toLowerCase().startsWith(input)) as undefined | CategoryChannel);
        }
        return chan as undefined | CategoryChannel;
    }

    resolveAnyChannel(input: string, guild: Guild): CategoryChannel | NewsChannel | TextChannel | VoiceChannel | undefined {
        input = input.trim().toLowerCase();
        let chan = guild.channels.get(input);
        if(chan?.type === 4){return chan;}
        if(!chan){
            chan = (guild.channels.find(c => c.type === 4 && c.name.toLowerCase() === input) as undefined | CategoryChannel);
        }
        if(!chan){
            chan = (guild.channels.find(c => c.type === 4 && c.name.toLowerCase().startsWith(input)) as undefined | CategoryChannel);
        }
        return chan as undefined | CategoryChannel;
    }

    sortRoles(userRoles: Array<string>, guildRoles: Collection<Role>): Array<Role>{
        const userRolesObject: Array<Role> = [];
        if(userRoles === undefined){userRoles = [];}
        userRoles.forEach((uRole: string) => {
            const temp = guildRoles.get(uRole);
            if(temp !== undefined){userRolesObject.push(temp);}
        });
        return userRolesObject.sort((a, b) => (b.position - a.position || (b.id as unknown as number) - (a.id as unknown as number)));
    }
    
    getColor(roles: Array<Role>, guildRoles: Collection<Role>): number{
        const colored = roles.filter((r: Role) => r.color !== 0).map((r: Role) => r.id);
        const sorted = this.sortRoles(colored, guildRoles);
        if(!sorted){return 0;}
        if(!sorted[0]){return 0;}
        return this.sortRoles(colored, guildRoles)[0].color;
    }
    
}