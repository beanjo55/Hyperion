interface logOptions{
    prefix?: string;
    subprefix?: string;
}
type cConsole = (typeof console) & {
    success(message: unknown, options?: logOptions): void;
    fatal(message: unknown, options?: logOptions): void;
}
function error(name: string, message: string, subprefix?: string): void{
    console.error(message, {prefix: name, subprefix});
}
function fatal(name: string, message: string, subprefix?: string): void{
    (console as cConsole).fatal(message, {prefix: name, subprefix});
}

function debug(name: string, message: string, subprefix?: string): void{
    console.debug(message, {prefix: name, subprefix});
}

function warn(name: string, message: string, subprefix?: string): void{
    console.warn(message, {prefix: name, subprefix});
}

function info(name: string, message: string, subprefix?: string): void{
    console.info(message, {prefix: name, subprefix});
}

function success(name: string, message: string, subprefix?: string): void{
    (console as cConsole).success(message, {prefix: name, subprefix});
}

const logger = {
    debug: debug,
    error: error,
    fatal: fatal,
    info: info,
    success: success,
    warn: warn
};
export default logger;