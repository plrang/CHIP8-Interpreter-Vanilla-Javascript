
import { arrays_equal, listArrayAsHEX, hex_dec, toHex, doBeep } from './base-utils.js';
import { add_to_Vlog, add_to_Vstatus, clear_Vlog, interfaceShow } from './app-utils-cfg.js';


// PERFORMANCE TEST variables
let testCPUCycleTime_start, testCPUCycleTime_end, testTime

// CONSTANTS // CHIP8 definition

const DISPLAY_WIDTH = 64
const DISPLAY_HEIGHT = 32                      // COLS / ROWS
const DEVICE_SCREEN_IN_PIXELS = DISPLAY_WIDTH * DISPLAY_HEIGHT

const SCREEN_SCALE = 8

const CLS_BG = "#040"

const MEMORY_SIZE = 4096;
const REGISTERS_NUM = 0x10
const STACK_SIZE = 0x10


export const FONTSET =
    [0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5  
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80] // F


// CHIP8

//PC NUMPAD

export class Keyboard {
    constructor() {

        add_to_Vlog("KEYBOARD CONSTRUCTOR");
        this.keydown = ''

        this.KEY_MAP = {

            // -3 = NUMPAD -0 = MAIN
            // y2020

            '0-3': 0x0,    // Num 0
            '7-3': 0x1,   // ... 7
            '8-3': 0x2,   // 8
            '9-3': 0x3,   // 9
            '4-3': 0x4,   // 4
            '5-3': 0x5,   // 5
            '6-3': 0x6,   // 6
            '1-3': 0x7,    // 1
            '2-3': 0x8,    // 2
            '3-3': 0x9,    // 3
            'a-0': 0xA,    // a
            'b-0': 0xB,    // b
            'c-0': 0xC,    // c
            'd-0': 0xD,    // d
            'e-0': 0xE,    // e
            'f-0': 0xF     // f
        };


        this.keysPressed = new Array(16);
        this.keysPressed.fill(0)
        this.onNextKeyPress = null;

        // Handle keyboard controls

        window.addEventListener("keydown", this.onKeyDown.bind(this), false);
        window.addEventListener("keyup", this.onKeyUp.bind(this), false);

    }


    isKeyPressed(keyCode) {
        return this.keysPressed[keyCode];
    }


    onKeyDown(e) {

        let keyID = e.key + '-' + e.location
        let key = this.KEY_MAP[keyID];    //e.which - deprec.

        this.keydown = key
        this.keysPressed[key] = 1;

        //console.log( 'E.KEY: ' + e.key + ' ' + e.location );    // location 3 means NUMPAD
        // Make sure onNextKeyPress is initialized and the pressed key is actually mapped to a Chip-8 key
        //console.log("onKeyDown: key= ", key)

        if (this.onNextKeyPress !== null && key) {
            this.onNextKeyPress(parseInt(key));
            this.onNextKeyPress = null;
        }


    }

    onKeyUp(e) {
        let keyID = e.key + '-' + e.location
        let key = this.KEY_MAP[keyID]; // event.which

        this.keysPressed[key] = 0;


    }

}


// DEVICE SCREEN OPS

export class Display_Screen {
    constructor(canvas, scale) {
        this.VRAM = new Array(DISPLAY_WIDTH * DISPLAY_HEIGHT);
        this.VRAM.fill(0)

        this.canvas = canvas;
        console.log(this.canvas);

        this.canvas.width = DISPLAY_WIDTH * SCREEN_SCALE;
        this.canvas.height = DISPLAY_HEIGHT * SCREEN_SCALE;

        this.canvasCtx = this.canvas.getContext('2d');

    }


    fillWith(bgColor) {

        this.canvasCtx.fillStyle = bgColor ?? '#000';
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }




    draw() {
        this.fillWith('black')
        this.canvasCtx.fillStyle = '#0b0'

        let i, x, y

        for (i = 0; i < DEVICE_SCREEN_IN_PIXELS; i++) {
            x = (i % DISPLAY_WIDTH);
            y = Math.floor(i / DISPLAY_WIDTH);

            if (this.VRAM[i] == 1) {
                //this.canvasCtx.fillStyle = '#'+(i*20)%255
                this.canvasCtx.fillRect(x * SCREEN_SCALE, y * SCREEN_SCALE, SCREEN_SCALE, SCREEN_SCALE);
            }
            //else
            //    this.canvasCtx.fillStyle = '#000';

        }
    }

    clearVRAM() {

        //this.VRAM.fill(0)
        for (let i = 0; i < DISPLAY_WIDTH * DISPLAY_HEIGHT; i++)
            this.VRAM[i] = 0;

        //this.screen.fillWith()    
        console.log("CLEAR CLEAR CLEAR")
    }
}







export class Chip8CPU {
    constructor(keyboard, fontset, screen, memory) {     // initialize()

        add_to_Vlog('INITIALIZE Chip8CPU');

        this.keyboard = keyboard;
        this.screen = screen;
        this.memory = new Uint8Array(MEMORY_SIZE).fill(0);  // up to 4096

        for (let i = 0; i < fontset.length; i++) {
            this.memory[i] = fontset[i];
        }

        add_to_Vlog('FONTS LOAD @ 0x000');
        //add_to_Vlog(`FONT codes<BR>${listArrayAsHEX(this.memory, 5)}`);

        //console.log(hex_dec('fontset.length', fontset.length))
        //console.log(this.memory)


        this.SP = 0
        this.stack = new Uint16Array(STACK_SIZE).fill(0);

        this.opcode = 0
        this.opc_mnemo = ''

        this.PC = 0x200                                 // program counter

        this.I = 0                                      // pointer register
        this.V = new Uint8Array(REGISTERS_NUM).fill(0)

        // TIMERS

        this.time = 0
        this.tone = 0

        this.draw_flag = false

        this.opcode_lookup = {}

        this.ROMloaded = ''
        this.cycle_num = 0
        this.cycle_num_prev = 0

        this.PC_prev = this.PC
        this.I_prev = this.I
        this.paused = false

        this.tickFWD = false
        this.tickBCK = false


        add_to_Vlog('chip8CPU REGISTERS ALL SET<BR>')


        // OPCODE LOOKUP TABLE

        this.opcode_lookup = {

            0x0000: () => this.op_CLS_RET_RCA_1802(),
            0x00E0: () => this.op_CLS(),
            0x00EE: () => this.op_RTS(),

            0x1000: () => this.op_JMP(),
            0x2000: () => this.op_SUB(),

            0x3000: () => this.op_SE_vx_nn(),
            0x4000: () => this.op_SNE_vx_nn(),

            0x5000: () => this.op_SE_vx_vy(),

            0x6000: () => this.op_LD_vx_nn(),
            0x7000: () => this.op_ADD_vx_nn(),

            0x8000: () => this.op_LD_vx_vy(),

            0x8001: () => this.op_LD_vx_vx_or_vy(),
            0x8002: () => this.op_LD_vx_vx_and_vy(),
            0x8003: () => this.op_LD_vx_vx_xor_vy(),
            0x8004: () => this.op_LD_vx_vx_add_vy(),
            0x8005: () => this.op_LD_vx_vx_sub_vy(),
            0x8006: () => this.op_SHR_vx(),
            0x8007: () => this.op_SUBn_vx_vy(),
            0x800E: () => this.op_SHL_vx(),

            0x9000: () => this.op_SNE_vx_vy(),

            0xA000: () => this.op_LOAD_I_nnn(),

            0xB000: () => this.op_JP_v0_nnn(),

            0xC000: () => this.op_RND_vx_nn(),

            0xD000: () => this.op_D_XYN(),

            0xE09E: () => this.op_SKP_vx(),
            0xE0A1: () => this.op_SKNP_vx(),

            0xF007: () => this.op_LD_VX_dt(),
            0xF00A: () => this.op_LD_VX_n(),
            0xF015: () => this.op_LD_dt_VX(),
            0xF018: () => this.op_LD_st_VX(),
            0xF01E: () => this.op_ADD_i_VX(),
            0xF029: () => this.op_LD_f_VX(),
            0xF033: () => this.op_LD_b_VX(),
            0xF055: () => this.op_LD_i_VX(),
            0xF065: () => this.op_LD_VX_i()

        }

        // | biBwise OR
        this.switchLookUp = {
            0x0000: () => { // add_to_Vlog( `SUB 0x0000 ${this.opcode.toString(16)}`);      // TEST
                return (0x0000 | this.opcode & 0xF0FF)
            },
            0x8000: () => { return (0x8000 | this.opcode & 0xF00F) },
            0xE000: () => { return (0xE000 | this.opcode & 0xF0FF) },
            0xF000: () => { return (0xF000 | this.opcode & 0xF0FF) }
        }
    }



    ROMload(filename) {
        add_to_Vlog('ROM Load: ' + filename);

        this.PC = 0x200
        let program_offset = this.PC
        this.ROMloaded = false

        //window.cancelAnimationFrame(loop);

        fetch(filename).then(function (response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            console.log(`FETCH OK > ${filename}`);
            return response;
        })
            .then(response => response.arrayBuffer())
            .then(buffer => {

                this.ROMloaded = filename

                //console.log(buffer.byteLength);
                const program = new Uint8Array(buffer);

                this.memory.set(program, program_offset);

                // let k = 0
                // for (const byte of program)
                //     {
                //     this.memory[k+program_offset] = byte
                //     console.log(byte)
                //     k++
                //     }




                add_to_Vlog(`CODE SIZE: ${buffer.byteLength} bytes @ ${hex_dec(' PC:', program_offset)}`);

                add_to_Vlog(`CODE: ${listArrayAsHEX(program)}`);


                // display only the CODE part after 0x200
                let RAM_test = this.memory.slice(program_offset, program_offset + buffer.byteLength);
                // add_to_Vlog(`In RAM<BR>${listArrayAsHEX(RAM_test, 5)}`);

                // display all memory to check if the 0x200 is preserved
                //add_to_Vlog(`In RAM<BR>${listArrayAsHEX(this.memory, 5)}`);


                if (arrays_equal(program, this.memory.slice(program_offset, program_offset + buffer.byteLength)))
                    add_to_Vlog("RAM vs ROM: <B>EQUAL</b>");
                else
                    add_to_Vlog("RAM vs ROM: NOT EQUAL");



                // VISUALIZE CHIP8 memory
                if (interfaceShow.Monitor) {

                    let HTML_CHIP8_Monitor = ''
                    for (let k = 0; k < this.memory.length - 0; k++) {
                        HTML_CHIP8_Monitor += `<div class="ch8MonCell" id="ch8MonCell-${k}" title="${hex_dec('ADDR', k)}">${this.memory[k].toString(16).toUpperCase()}</div>`
                    }

                    document.getElementById("chip8_monitor").innerHTML = HTML_CHIP8_Monitor
                }


                this.createProgramListing(program)


            })
            .catch(function (error) {
                console.log('ROM FETCH PROBLEM: \n', error);

            });

    }





    createProgramListing(program) {

        if (!interfaceShow.ProgramListing) return

        let HTML_CHIP8_Listing = `<B>PROGRAM LISTING</B><BR>`
        let lookup, opcode, op_test

        for (let k = 0; k < program.length; k += 2) {

            //this.opcode = ( this.memory[ this.PC ] << 8 ) | this.memory[ this.PC + 1 ]
            opcode = (program[k] << 8) | program[k + 1]
            op_test = opcode & 0xF000

            if (op_test in this.switchLookUp) {
                lookup = this.switchLookUp[op_test]()

            }
            else   // found direct opcode, no need for switching
            {
                lookup = opcode & 0xF000


            }

            //HTML_CHIP8_Listing += `<div class="ch8MonCell" id="ch8MonCell-${k}" title="${hex_dec('ADDR',k)}">${this.memory[k].toString(16).toUpperCase()}</div>`
            //HTML_CHIP8_Listing += toHex(program[k]) + toHex(program[k+1]) + '<BR>'
            //HTML_CHIP8_Listing += toHex(opcode) + '<BR>'
            let lineNumber = k
            HTML_CHIP8_Listing += `${lineNumber} - ${toHex(opcode)} - ` + this.opcode_lookup[lookup] + '<BR>'

        }

        document.getElementById("chip8_program_listing").innerHTML = HTML_CHIP8_Listing
    }







    RUNcycle() {
        //console.log("running")
        // PERFORMANCE TEST
        //if(this.cycle_num%20==19)
        // testCPUCycleTime_start = performance.now()

        // Decode & Execute
        this.OPCdecode()

        // TIMERS update

        if (this.tone > 0) {
            //add_to_Vlog('SOUND');

            setTimeout(() => doBeep(20, 0), 10)
            // setTimeout( ()=> doBeep(1, 0), 250 )
            // setTimeout( ()=> doBeep(0.1, 40), 500 )
            // setTimeout( ()=> doBeep(0.005, 0), 800 )

            this.tone--
        }

        if (this.cycle_num % 20 == 0) {
            if (this.time > 0)
                this.time--
        }

        this.cycle_num_prev = this.cycle_num
        this.cycle_num += 1     //just for us
        //this.PC += 2

        // PERFORMANCE TEST
        //if(this.cycle_num%20==19)
        // {
        //     testCPUCycleTime_end = performance.now()
        //     testTime = testCPUCycleTime_end - testCPUCycleTime_start
        //     console.log('OPC EXECUTION TIME: ', testTime)
        //     }

    }



    // OPCODEs DECODE & EXECUTE

    OPCdecode() {

        // CODE MONITOR DISPLAY - configure in "app-utils-cfg.js" 
        let monitor = this.monitorBegin()

        //// EXTRACT operands and data    http://devernay.free.fr/hacks/chip8/C8TECH10.HTM//1.0

        this.opcode = (this.memory[this.PC] << 8) | this.memory[this.PC + 1]

        // // weird BISQWIT code 
        // //this.opcode = this.memory[ this.PC & 0xFFF ] *0x100 + this.memory[ (this.PC + 1) & 0xFFF ]

        this.X = ((this.opcode & 0x0F00) >> 8) & 0xF                // // move it right to fit the V index
        this.Y = ((this.opcode & 0x00F0) >> 4) & 0xF
        this.n = this.opcode & 0x000F
        this.nn = this.opcode & 0x00FF
        this.nnn = this.opcode & 0x0FFF


        //this.opcode = 0x00E0       // TEST

        let op_test = this.opcode & 0xF000
        let lookup

        if (op_test in this.switchLookUp) {
            lookup = this.switchLookUp[op_test]()
            // add_to_Vlog( `MAIN OPC: ${this.opcode.toString(16)}`)
        }
        else   // found direct opcode, no need for switching
        {
            lookup = this.opcode & 0xF000
            // add_to_Vlog(`SUB OPC: <B>${this.opcode.toString(16)}</b>`)
        }

        try {
            // add_to_Vlog(  `<span class="hard-space" style=" white-space: pre">     </span>` +
            // `${this.cycle_num} Try: ${this.opcode.toString(16)} : ${lookup.toString(16)} : <B>${this.opcode_lookup[ lookup ]}</b>`)

            this.opcode_lookup[lookup]()  // run the choosen method
        }
        catch (error) {
            // add_to_Vlog( `OPC lookup error: ${lookup.toString(16)}, ${error}`)
        }


        // CODE MONITOR DISPLAY END
        this.monitorEnd(monitor)


        this.PC_prev = this.PC
        this.I_prev = this.I


        //return `this.opcode.toString(16)} : ${lookup.toString(16)} : <B>${this.opcode_lookup[ lookup ]}`

    }   // OPCdecode() {





    // # ***************
    // # *** OPCODES ***
    // # ***************

    // # 0x0000
    op_CLS_RET_RCA_1802() {
        this.PC += 2
    }

    // # 0x00E0                                clear screen
    op_CLS() {
        this.PC += 2
        this.screen.clearVRAM()
        this.screen.draw()
        console.log('OP: op_CLS')

    }

    // # 0x00EE                                return from a subroutine
    op_RTS() {
        this.PC = this.stack[this.SP-- % 16]
        this.PC += 2

    }

    // # 0x1nnn                                jump to address NNN
    op_JMP() {
        this.PC = this.nnn
    }

    // # 0x2nnn         call a SUBroutine at nnn. STORE STACK[++SP] = PC & PC = nnn
    // # increment stack pointer SP + 1 and put there current PC / program counter on the stack
    op_SUB() {
        this.stack[++this.SP % 16] = this.PC
        this.PC = this.nnn                      // # new program counter PC
    }

    // # 3Xnn              skip the next instruction if VX == NN
    op_SE_vx_nn() {
        let X = this.X
        this.PC += 2
        if (this.nn == this.V[X])
            this.PC += 2

    }

    // # 4Xnn                                 skip the next instruction if VX != NN
    op_SNE_vx_nn() {
        let X = this.X
        this.PC += 2
        if (this.V[X] != this.nn)
            this.PC += 2
    }

    // # 5XY0                                  skip the next instruction if VX == VY
    op_SE_vx_vy() {
        let X = this.X
        let Y = this.Y
        this.PC += 2
        if (this.V[X] == this.V[Y])
            this.PC += 2
    }


    // # 6Xnn                                        LD set VX to NN
    op_LD_vx_nn() {
        let X = this.X
        this.V[X] = this.nn
        this.PC += 2
    }

    // # 7Xnn                                        to VX add nn
    op_ADD_vx_nn() {
        let X = this.X
        this.V[X] = (this.V[X] + this.nn) & 0xFF  // # need to take care of BYTES
        // #this.V[X] = (this.V[X] + this.nn) % 256
        this.PC += 2
    }

    // # 8XY0                                           set to VX load VY
    op_LD_vx_vy() {
        let X = this.X
        let Y = this.Y

        this.V[X] = this.V[Y]
        this.PC += 2
    }

    // # 8XY1                                            or vX,vY    VX = VX or VY
    op_LD_vx_vx_or_vy() {
        let X = this.X
        let Y = this.Y

        this.V[X] = (this.V[X] | this.V[Y]) & 0xFF  // # byte
        this.PC += 2
    }


    // # 8XY2                                            to VX load (VX and & VY)
    op_LD_vx_vx_and_vy() {
        let X = this.X
        let Y = this.Y

        this.V[X] = (this.V[X] & this.V[Y]) & 0xFF      // # byte
        this.PC += 2
    }

    // # 8XY3                                            to VX load (VX xor ^ VY)
    op_LD_vx_vx_xor_vy() {
        let X = this.X
        let Y = this.Y

        // # byte       # xor vX,vY    VX = VX ^ VY
        this.V[X] = (this.V[X] ^ this.V[Y]) & 0xFF
        this.PC += 2
    }


    // # 8XY4                                        to VX add VY - if Carry , set  vF to 1, else 0
    op_LD_vx_vx_add_vy() {
        let X = this.X
        let Y = this.Y

        let val = this.V[X] + this.V[Y]
        if (val > 255)
            this.V[0xF] = 0x1  // # (val >> 8) & 0xff
        else
            this.V[0xF] = 0x0

        this.V[X] = val & 0xFF
        this.PC += 2
    }


    // # 8XY5                                        VX =  VX sub VY ; VF is set to 0 when there's a borrow, and 1 when there isn't
    op_LD_vx_vx_sub_vy() {
        let X = this.X
        let Y = this.Y

        let val = this.V[X] - this.V[Y]

        if (this.V[X] > this.V[Y])
            this.V[0xF] = 0x1
        else {
            this.V[0xF] = 0x0
        }

        this.V[X] = val & 0xFF              //# take care of BYTES
        //# this.V[0xF] = (~(val >> 8)) & 0xFF
        //# something is not right here wven with ~
        this.PC += 2
    }

    // # 8XY7    set VX to VY minus VX.
    // #         VF is set to 0 when there's a borrow, and 1 when there isn't.
    op_SUBn_vx_vy() {
        let X = this.X
        let Y = this.Y

        let val = this.V[Y] - this.V[X]

        if (this.V[Y] > this.V[X])
            this.V[0xF] = 0x1
        else
            this.V[0xF] = 0x0

        this.V[X] = val & 0xFF              // # take care of BYTES
        this.PC += 2
    }

    // # 8XY6                 shift VX right by 1.     VF is set to value of
    // #                      least significant bit of VX before the shift
    op_SHR_vx() {
        let X = this.X
        let Y = this.Y

        this.V[0xF] = this.V[X] & 0x01
        this.V[X] = (this.V[X] >> 1) & 0xFF
        this.PC += 2
    }

    // # 8XYE                shift VX left by one.
    // #                     VF is set to the value of the most significant bit of VX before the shift.
    op_SHL_vx() {
        let X = this.X
        let Y = this.Y
        this.V[0xF] = (this.V[X] >> 7) & 0x01
        this.V[X] = (this.V[X] << 1) & 0xFF
        this.PC += 2
    }


    // # 0x9000                9XY0    skips next instruction if VX != VY
    op_SNE_vx_vy() {
        let X = this.X
        let Y = this.Y

        this.PC += 2
        if (this.V[X] != this.V[Y])
            this.PC += 2
        //add_to_Vlog("EXEC op_SNE_vx_vy: " + X)
    }

    // # Annn                            sets I to the address NNN.
    op_LOAD_I_nnn() {
        this.I = this.nnn
        this.PC += 2
        //let tmp = this.nnn.toString(16).toUpperCase()
        // add_to_Vlog(`op_LOAD_I_nnn(${tmp})`)

    }


    // # Bnnn                            JUMP to nnn + V0
    op_JP_v0_nnn() {
        this.PC = this.nnn + this.V[0]
        // *** this.PC -= 2
    }

    // # 0xC000                            CXnn    VX = result of '&' on random number and NN
    op_RND_vx_nn() {
        let X = this.X
        let nn = this.nn
        let rand = Math.floor(Math.random() * 0xFF)

        this.V[X] = (rand & nn) & 0xFF  // # byte
        this.PC += 2
    }


    // # DRAW *****************************************************************************
    op_D_XYN() {
        let X = this.V[this.X]
        let Y = this.V[this.Y]
        let n = this.n          // rows / bytes as rows of bits

        this.V[0xF] = 0
        this.draw_flag = true

        let byte, sprite_bit, bit_pos, VRAM_old

        for (let row = 0; row < n; row++) {
            byte = this.memory[this.I + row]    // byte "is" a row

            for (let col = 0; col < 8; col++)           //# 8 bits per line
            {

                sprite_bit = (byte >> (7 - col)) & 1
                bit_pos = (col + X) + (row + Y) * DISPLAY_WIDTH
                VRAM_old = this.screen.VRAM[bit_pos]

                this.screen.VRAM[bit_pos] = VRAM_old ^ sprite_bit

                //if (VRAM_old != 0 && this.screen.VRAM[bit_pos] == 0)
                if (this.screen.VRAM[bit_pos] - VRAM_old < 0)
                    this.V[0xF] = 1
            }


        }
        //console.log(this.screen.VRAM)

        this.screen.draw()
        this.PC += 2
        this.draw_flag = false
    }

    // # 0xE09E                                    # Ex9E    skip next instruction if key stored in  VX  is pressed
    op_SKP_vx() {
        let X = this.X
        this.PC += 2
        if (this.keyboard.keysPressed[this.V[X] & 0xF] == 1) {
            this.PC += 2
        }
    }

    // # 0xE0A1                                    # ExA1    skip next instruction if key stored in  VX  is NOT pressed
    op_SKNP_vx() {
        let X = this.X
        this.PC += 2
        if (this.keyboard.keysPressed[this.V[X] & 0xF] != 1) {
            this.PC += 2
        }
    }

    // # Fx07                                            VX = self.time
    // # DELAY TIMER to VX
    op_LD_VX_dt() {
        let X = this.X
        this.V[X] = this.time
        this.PC += 2
    }

    // # 0xF00A                                    Fx0A    Wait for a key press, store the value of the key in Vx.
    // #       All execution stops until a key is pressed,
    // #       then the value of that key is stored in Vx
    op_LD_VX_n() {

        let X = this.X

        let nextKeyPress = (key) => {
            this.V[X] = key;
        }

        this.keyboard.onNextKeyPress = nextKeyPress.bind(this);
        this.PC += 2    // required by Lunar Lander, Clock ...

    }

    // # Fx18                                          self.tone = VX    - sound timer set to VX
    // # VX to SOUND TIMER
    op_LD_st_VX() {
        let X = this.X
        this.tone = this.V[X]
        this.PC += 2
        console.log(`### SOUND`)
    }

    // # VX to DELAY TIMER
    // # Fx15    self.time = VX    - delay timer set to VX
    op_LD_dt_VX() {
        let X = this.X
        this.time = this.V[X]
        this.PC += 2

    }

    // # I + VX
    // # Fx1E      to I add VX    
    op_ADD_i_VX() {
        let X = this.X
        this.I = (this.I & 0xFFF) + this.V[X]
        this.V[0xF] = this.I >> 12
        this.PC += 2
    }

    // # Fx29                                      Set I = location of sprite for digit Vx
    op_LD_f_VX() {
        let X = this.X
        // #    & 0xFF may be unnecessary - just checking
        // # The value of I is set to the location
        this.I = (this.V[X] & 0xFF) * 5
        // #    for the hexadecimal sprite
        // #    corresponding to the value of Vx
        this.PC += 2
    }

    // # Fx33
    // # BCD representation of Vx put to I (hundreds), I+1 (tens) and I+2 (ones)
    op_LD_b_VX() {
        let X = this.X
        let VX = this.V[X]

        this.memory[this.I & 0xFFF] = ((VX / 100) % 10) & 0xFF
        this.memory[(this.I + 1) & 0xFFF] = ((VX / 10) % 10) & 0xFF
        this.memory[(this.I + 2) & 0xFFF] = ((VX / 1) % 10) & 0xFF

        this.PC += 2
    }

    // # Fx55
    // # V0 to VX put at mem[I]
    op_LD_i_VX() {
        let X = this.X

        for (let i = 0; i < X + 1; i++)
            this.memory[(this.I + i) & 0xFFF] = this.V[i]
        this.PC += 2
    }

    // # Fx65                                        Fills V0 to VX (including VX) with values from memory starting at address I
    // #                                             fill V0 to VX with contents of mem[I]+
    op_LD_VX_i() {
        let X = this.X

        for (let i = 0; i < X + 1; i++)
            this.V[i] = this.memory[(this.I + i) & 0xFFF]
        this.PC += 2
    }






    // MONITOR - LIVE CODE MONITOR DISPLAY GENERATOR

    monitorBegin() {

        let cell_active = document.getElementById(`ch8MonCell-${this.PC_prev}`)

        if (interfaceShow.Monitor) {

            if (typeof (cell_active) != 'undefined' && cell_active != null) {

                cell_active.setAttribute("style", "background-color:#000;color:white; font-weight:normal")
                cell_active = document.getElementById(`ch8MonCell-${this.PC_prev + 1}`)
                cell_active.setAttribute("style", "background-color:#000;color:white; font-weight:normal")

                if (this.cycle_num == 0)   // mark the first cycle in Monitor
                {
                    cell_active = document.getElementById(`ch8MonCell-${this.PC}`)
                    cell_active.setAttribute("style", "background-color:#00F;color:yellow; font-weight:bold")
                    cell_active = document.getElementById(`ch8MonCell-${this.PC + 1}`)
                    cell_active.setAttribute("style", "background-color:#00F;color:yellow; font-weight:bold")
                    //console.log("CYCLE 0", this.PC)
                }



                cell_active = document.getElementById(`ch8MonCell-${this.I_prev}`)
                cell_active.setAttribute("style", "background-color:#000;color:red; border: 1px solid red;font-weight:normal")
                cell_active = document.getElementById(`ch8MonCell-${this.I_prev + 1}`)
                cell_active.setAttribute("style", "background-color:#000;color:red; border: 1px solid red;font-weight:normal")

            }

        }

        return cell_active  // [cell_active] found is passed then to [monitorEnd(cell_active)]

    }

    monitorEnd(cell_active) {
        if (interfaceShow.Monitor) {

            if (typeof (cell_active) != 'undefined' && cell_active != null) {
                cell_active = document.getElementById(`ch8MonCell-${this.PC}`)
                cell_active.setAttribute("style", "background-color:#0F0;color:#000;font-weight:bold;font-size:1em")

                cell_active = document.getElementById(`ch8MonCell-${this.PC + 1}`)
                cell_active.setAttribute("style", "background-color:#0F0;color:#000;font-weight:bold;font-size:1em")


                cell_active = document.getElementById(`ch8MonCell-${this.I}`)
                cell_active.setAttribute("style", "background-color:#eee;color:#000; border: 1px solid blue;font-weight:bold")

                cell_active = document.getElementById(`ch8MonCell-${this.I + 1}`)
                cell_active.setAttribute("style", "background-color:#eee;color:#000; border: 1px solid blue;font-weight:bold")
            }

        }
    }


}   // chip8CPU class

