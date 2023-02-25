
// Compare 2 arrays
// https://www.30secondsofcode.org/blog/s/javascript-array-comparison
// Might want to try that https://lodash.com/



export const arrays_equal = (a, b) =>
    a.length === b.length
    && a.every((v, i) => v === b[i]);


export const listArrayAsHEX = (ar, cols) => {
    let str = ''
    let cnt = 1
    for (const k of ar) {
        str += k.toString(16) + ', ';
        if (cnt % cols == 0)
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





const a = new AudioContext()
export function beep(vol, freq, duration) {
    let v = a.createOscillator()
    let u = a.createGain()
    v.connect(u)
    v.frequency.value = freq
    v.type = "square"
    u.connect(a.destination)
    u.gain.value = vol * 0.01
    v.start(a.currentTime)
    v.stop(a.currentTime + duration * 0.001)
}




export const doBeep = (vol, decay) => {
    // setTimeout(()=> beep(vol, 4150, 50+decay ), 10)
    // setTimeout(()=> beep(vol, 2000, 140+decay ), 20)
    setTimeout(() => beep(vol, 1000, 100 + decay), 30)
}

