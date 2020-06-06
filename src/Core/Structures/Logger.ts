import signale from "signale";

function error(name: string, message: string, subprefix?: string): void{
    if(subprefix){
        message = `[${subprefix}] [${new Date().toLocaleTimeString()}] ${message}`;
    }
    signale.error({
        prefix: `[${name}]`,
        message: message
    });
}

function fatal(name: string, message: string, subprefix?: string): void{
    if(subprefix){
        message = `[${subprefix}] [${new Date().toLocaleTimeString()}] ${message}`;
    }
    signale.fatal({
        prefix: `[${name}]`,
        message: message
    });
}

function debug(name: string, message: string, subprefix?: string): void{
    if(subprefix){
        message = `[${subprefix}] [${new Date().toLocaleTimeString()}] ${message}`;
    }
    signale.debug({
        prefix: `[${name}]`,
        message: message
    });
}

function warn(name: string, message: string, subprefix?: string): void{
    if(subprefix){
        message = `[${subprefix}] [${new Date().toLocaleTimeString()}] ${message}`;
    }
    signale.warn({
        prefix: `[${name}]`,
        message: message
    });
}

function info(name: string, message: string, subprefix?: string): void{
    if(subprefix){
        message = `[${subprefix}] [${new Date().toLocaleTimeString()}] ${message}`;
    }
    signale.info({
        prefix: `[${name}]`,
        message: message
    });
}

function success(name: string, message: string, subprefix?: string): void{
    if(subprefix){
        message = `[${subprefix}] [${new Date().toLocaleTimeString()}] ${message}`;
    }
    signale.success({
        prefix: `[${name}]`,
        message: message
    });
}




export const logger = {
    debug: debug,
    error: error,
    fatal: fatal,
    info: info,
    success: success,
    warn: warn
};
