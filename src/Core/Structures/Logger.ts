import signale from "signale";

function error(name: string, subprefix: string, message: string){
    if(subprefix){
        message = `[${subprefix}] ${message}`;
    }
    signale.error({
        prefix: `[${name}]`,
        message: message
    });
}

function fatal(name: string, subprefix: string, message: string){
    if(subprefix){
        message = `[${subprefix}] ${message}`;
    }
    signale.fatal({
        prefix: `[${name}]`,
        message: message
    });
}

function debug(name: string, subprefix: string, message: string){
    if(subprefix){
        message = `[${subprefix}] ${message}`;
    }
    signale.debug({
        prefix: `[${name}]`,
        message: message
    });
}

function warn(name: string, subprefix: string, message: string){
    if(subprefix){
        message = `[${subprefix}] ${message}`;
    }
    signale.warn({
        prefix: `[${name}]`,
        message: message
    });
}

function info(name: string, subprefix: string, message: string){
    if(subprefix){
        message = `[${subprefix}] ${message}`;
    }
    signale.info({
        prefix: `[${name}]`,
        message: message
    });
}

function success(name: string, subprefix: string, message: string){
    if(subprefix){
        message = `[${subprefix}] ${message}`;
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
