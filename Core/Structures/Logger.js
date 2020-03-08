const signale = require("signale");

function error(name, subprefix, message){
    if(subprefix){
        message = `[${subprefix}] ${message}`;
    }
    signale.error({
        prefix: `[${name}]`,
        message: message
    });
}

function fatal(name, subprefix, message){
    if(subprefix){
        message = `[${subprefix}] ${message}`;
    }
    signale.fatal({
        prefix: `[${name}]`,
        message: message
    });
}

function debug(name, subprefix, message){
    if(subprefix){
        message = `[${subprefix}] ${message}`;
    }
    signale.debug({
        prefix: `[${name}]`,
        message: message
    });
}

function warn(name, subprefix, message){
    if(subprefix){
        message = `[${subprefix}] ${message}`;
    }
    signale.warn({
        prefix: `[${name}]`,
        message: message
    });
}

function info(name, subprefix, message){
    if(subprefix){
        message = `[${subprefix}] ${message}`;
    }
    signale.info({
        prefix: `[${name}]`,
        message: message
    });
}

function success(name, subprefix, message){
    if(subprefix){
        message = `[${subprefix}] ${message}`;
    }
    signale.success({
        prefix: `[${name}]`,
        message: message
    });
}




const logger = {
    debug: debug,
    error: error,
    fatal: fatal,
    info: info,
    success: success,
    warn: warn
};
exports.struct = logger;