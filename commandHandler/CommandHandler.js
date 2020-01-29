





function findCommand(search, Hyperion){
    return Hyperion.commands.find(com => (com.name === search) || (com.aliases.includes(search)));
}

function checkInternal(member, command){

}



async function commandHandler(msg, args, Hyperion){

}



async function devCommandHandler(msg, args, Hyperion){

}


async function _preHandle(msg, Hyperion){

}

async function _prefixHandle(msg, Hyperion){

}

async function _mentionPrefixHandle(msg, Hyperion){
    
}
