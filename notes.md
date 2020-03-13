command/handler status codes:
    0: success!
    1: pre command error
    2: in command error
    3: post command error
    4: command failure (not an error. bad input, user not found, etc)
    5: unauthorized (dev/internal commands, blacklisted, no perms)
    6: no command
    7: on cooldown (global or command)

command return:
    {
        status: {
            code: number (required)
            error: err (optional, not present if no error)
        }

        payload: data (message or data to return. not always present on error, unless there is a friendly error message to return)
    }