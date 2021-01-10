

export function add_to_Vstatus(text) {
    document.getElementById("Vstatus_field").innerHTML= document.getElementById("Vstatus_field").innerHTML + ' ' + text;
}

export function add_to_Vlog(text) {
    document.getElementById("Vlog_field").innerHTML= document.getElementById("Vlog_field").innerHTML + ' ' + text + '<BR>';
}


export function clear_Vlog() {
    document.getElementById("Vlog_field").innerHTML= '';
}

