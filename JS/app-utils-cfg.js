
// App interface display config

export const interfaceShow = {
    'ProgramListing' : true,
    'Monitor' : true,
    'Vstatus' : true,
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
