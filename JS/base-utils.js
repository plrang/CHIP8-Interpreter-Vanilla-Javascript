

export function add_to_Vstatus(text) {
    document.getElementById("Vstatus_field").innerHTML= document.getElementById("Vstatus_field").innerHTML + ' ' + text;
}

export function add_to_Vlog(text) {
    document.getElementById("Vlog_field").innerHTML= document.getElementById("Vlog_field").innerHTML + ' ' + text + '<BR>';
}


export function clear_Vlog() {
    document.getElementById("Vlog_field").innerHTML= '';
}

export function clear_Vstatus() {
    document.getElementById("Vstatus_field").innerHTML= '';
}

// Compare 2 arrays
// https://www.30secondsofcode.org/blog/s/javascript-array-comparison
// Might want to try that https://lodash.com/

export const arrays_equal = (a, b) =>
a.length === b.length &&
a.every((v, i) => v === b[i]);