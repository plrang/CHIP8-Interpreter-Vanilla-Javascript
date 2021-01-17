

export const interfaceShow = {
        
    'ProgramListing' : false,
    'Monitor' : false,
    'Vstatus' : false,
    'Vlog' : false
}



export function add_to_Vstatus(text) {
    if(interfaceShow.Vstatus)
    document.getElementById("Vstatus_field").innerHTML= document.getElementById("Vstatus_field").innerHTML + ' ' + text;
}

export function add_to_Vlog(text) {
    if(interfaceShow.Vlog)
    document.getElementById("Vlog_field").innerHTML= document.getElementById("Vlog_field").innerHTML + ' ' + text + '<BR>';
}


export function clear_Vlog() {
    if(interfaceShow.Vlog)
    document.getElementById("Vlog_field").innerHTML= '';
}

export function clear_Vstatus() {
    if(interfaceShow.Vstatus)
    document.getElementById("Vstatus_field").innerHTML= '';
}

// Compare 2 arrays
// https://www.30secondsofcode.org/blog/s/javascript-array-comparison
// Might want to try that https://lodash.com/

export const arrays_equal = (a, b) =>
a.length === b.length &&
a.every((v, i) => v === b[i]);



export const listArrayAsHEX = (ar, cols) =>
    {
    let str = ''
    let cnt = 1
    for (const k of ar) {
        str += k.toString(16)+', '; 
        if (cnt%cols==0)
            str += "<BR>"
        cnt++    
    }
    return str.toUpperCase()
}


export const hex_dec = (name, val) => {
    return `█ ${name}: #${val.toString(16).toUpperCase()} / ${val} `
}

export const toHex = (val) => {
    return `${val.toString(16).toUpperCase()}`
}