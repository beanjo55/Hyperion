import hyperion from "../main";
import {default as fs} from "fs";
import {default as path} from "path";

export default class LangManager{
    langs = new Map<string, {[key: string]: string}>()
    Hyperion: hyperion;
    constructor(Hyperion: hyperion){
        this.Hyperion = Hyperion;
        this.init();
    }

    private getLangFiles(): Array<string> {
        try {
            return fs.readdirSync(path.resolve(__dirname, "../Lang/"));
        }catch(err){
            this.Hyperion.logger.error("Hyperion", `Failed to read language files, err: ${err.message}`, "Lang");
            return [];
        }
    }

    reloadAll(): void{
        try {
            const files = this.getLangFiles();
            for(const file of files){
                try{
                    const name = file.substring(0, file.length - 3);
                    delete require.cache[require.resolve(`${__dirname}/../Lang/${file}`)];
                    const newlang = require(`${__dirname}/../Lang/${file}`).default;
                    this.langs.set(name, newlang);
                }catch(err){
                    this.Hyperion.logger.error("Hyperion", `Failed to reload ${file}, err: ${err.message}`, "Lang");
                }
            }
        }catch(err){
            this.Hyperion.logger.error("Hyperion", `Failed to reload languages, err: ${err.message}`, "Lang");
        }
    }

    init(): void {
        try {
            const files = this.getLangFiles();
            for(const file of files){
                try{
                    const name = file.substring(0, file.length - 3);
                    const newlang = require(`${__dirname}/../Lang/${file}`).default;
                    this.langs.set(name, newlang);
                }catch(err){
                    this.Hyperion.logger.error("Hyperion", `Failed to load ${file}, err: ${err.message}`, "Lang");
                }
            }
        }catch(err){
            this.Hyperion.logger.error("Hyperion", `Failed to load languages, err: ${err.message}`, "Lang");
        }
    }

    getLang(input: string){
        const lang = this.langs.get(input) ?? this.langs.get("en")!;
        return {
            format: (resp: string, replace?: Array<string>) => {
                let temp = lang[resp] ?? resp;
                if(temp === resp){return resp;}
                if(replace){
                    replace.forEach((rep, ind) => {
                        const rx = new RegExp(`{[${ind+1}]}`, "gmi");
                        temp = temp.replace(rx, rep);
                    });
                }
                return temp;
            }
        };
    }
}

