const timeout = async (seconds, fnc=()=>{}) => {
    if(typeof(seconds) !== 'number' || isNaN(seconds) || seconds < 0){
        throw new TypeError(`Invalid type: seconds. Must be type: number(positive). Provided: ${seconds}. Type: ${typeof(seconds)}`)
    }
    if(typeof(fnc) !== 'function'){
        throw new TypeError(`Invalid type: fnc. Must be a function. Provided: ${fnc}. Type: ${typeof(fnc)}`)
    }

    return new Promise(resolve => setTimeout(async () => {
        await fnc()

        resolve()
    }, Math.floor(seconds * 1000)))
}

module.exports = {timeout}
