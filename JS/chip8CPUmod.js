
import {add_to_Vlog, add_to_Vstatus, clear_Vlog, arrays_equal, listArrayAsHEX, hex_dec} from './base-utils.js';





// CONSTANTS // CHIP8 definition

const DISPLAY_WIDTH = 64
const DISPLAY_HEIGHT = 32                      // COLS / ROWS
const DEVICE_SCREEN_IN_PIXELS = DISPLAY_WIDTH * DISPLAY_HEIGHT
//DEVICE_SCREEN_PIXELS_COUNT = DISPLAY_WIDTH * SCREEN_SCALE * DISPLAY_HEIGHT * SCREEN_SCALE


const SCREEN_SCALE = 8

//const CLS_BG = "#0a0"
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

//const REGISTERS_NUM = 0x10

//PC NUMPAD

export class Keyboard {
    constructor() {
        
        add_to_Vlog("KEYBOARD CONSTRUCTOR");
        this.keydown = ''

        this.KEY_MAP = {

            // -3 = NUMPAD -0 = MAIN
            // y2020

            '0-3': 0x0,    // N 0
            '7-3': 0x1,   // 7
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


        // OBSOLETE
        // this.KEY_MAP = {
        //     96: 0x0,    // N 0
        //     103: 0x1,   // 7
        //     104: 0x2,   // 8
        //     105: 0x3,   // 9
        //     100: 0x4,   // 4
        //     101: 0x5,   // 5
        //     102: 0x6,   // 6
        //     97: 0x7,    // 1
        //     98: 0x8,    // 2
        //     99: 0x9,    // 3
        //     65: 0xA,    // a
        //     66: 0xB,    // b
        //     67: 0xC,    // c
        //     68: 0xD,    // d
        //     69: 0xE,    // e
        //     70: 0xF     // f
        // };



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


    onKeyDown(event) {

        let key = this.KEY_MAP[event.key +'-' +event.location];    //event.which - deprec.
        this.keydown = key
        this.keysPressed[key] = 1;

        add_to_Vlog( 'E.KEY: ' + event.key + ' ' + event.location );    // location 3 means NUMPAD
        
        //add_to_Vlog( 'KEY PRESS: ' + key );
        //add_to_Vlog( 'KEY PRESS: ' + event.which );
    
        // Make sure onNextKeyPress is initialized and the pressed key is actually mapped to a Chip-8 key
        if (this.onNextKeyPress !== null && key) {
            this.onNextKeyPress(parseInt(key));
            this.onNextKeyPress = null;
        }
    }

    onKeyUp(event) {
        let key = this.KEY_MAP[event.key +'-' +event.location]; // event.which
        this.keysPressed[key] = 0;
    }

}

//print(KEY_MAP)






// DEVICE SCREEN OPS

export class Display_Screen{
    constructor(canvas, scale){
        this.VRAM = new Array(DISPLAY_WIDTH * DISPLAY_HEIGHT);
        this.VRAM.fill(0)
        
        this.canvas = canvas;
        console.log(this.canvas);

        this.canvas.width = DISPLAY_WIDTH * SCREEN_SCALE;
        this.canvas.height = DISPLAY_HEIGHT * SCREEN_SCALE;

        this.canvasCtx = this.canvas.getContext('2d');
    }


    fill(bgColor) {
       
        this.canvasCtx.fillStyle = bgColor;
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        //this.canvasCtx.fillStyle = CLS_BG;
        //this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.fill(CLS_BG)

        for(let i=0; i < DISPLAY_WIDTH * DISPLAY_HEIGHT; i++) {
            let x = (i % DISPLAY_WIDTH) * SCREEN_SCALE;
            let y = Math.floor(i / DISPLAY_WIDTH) * SCREEN_SCALE;

            if(this.VRAM[i] == 1) {
                this.canvasCtx.fillStyle = '#F0F';
                this.canvasCtx.fillRect(x, y, SCREEN_SCALE, SCREEN_SCALE);
            }
        }
    }

    setPixel(x, y) {
        if(x > DISPLAY_WIDTH)
            x -= DISPLAY_WIDTH;
        else if(x < 0)
            x += DISPLAY_WIDTH;

        if(y > DISPLAY_HEIGHT)
            y -= DISPLAY_HEIGHT;
        else if(y<0)
            y += DISPLAY_HEIGHT;

        // this.VRAM[x + (y * DISPLAY_WIDTH)] ^= 1;

        // return this.VRAM[x + (y * DISPLAY_WIDTH)] != 1;
    }


    test() {
        this.setPixel(0, 0);
        this.setPixel(5, 2);
        this.setPixel(DISPLAY_WIDTH-1, DISPLAY_HEIGHT-1);
        this.draw();
        add_to_Vlog('Screen Test');
        console.log('Screen Test');
    }
    
    clearVRAM() {
            this.VRAM = new Array(DISPLAY_WIDTH * DISPLAY_HEIGHT);
            for(let i=0; i < DISPLAY_WIDTH * DISPLAY_HEIGHT; i++)
                this.VRAM[i] = 0;

                console.log("CLEAR CLEAR CLEAR")
        }
}







export class Chip8CPU{
    constructor( keyboard, fontset, screen, memory) {     // initialize()

        add_to_Vlog('INITIALIZE Chip8CPU');
       
    this.keyboard = keyboard;   
    this.screen = screen;   
    this.memory = new Uint8Array(MEMORY_SIZE).fill(0);  // up to 4096

    //this.fontset = fontset;

    for (let i = 0; i < fontset.length; i++) {
        this.memory[i] = fontset[i];
    }

        add_to_Vlog('FONTS LOAD at 0x000');
        //add_to_Vlog(`FONT codes<BR>${listArrayAsHEX(this.memory, 5)}`);
        
        //console.log(hex_dec('fontset.length', fontset.length))
        //console.log(this.memory)


    this.SP = 0;
    this.stack = new Uint8Array(REGISTERS_NUM).fill(0);
    

    this.opcode = 0;
    
    this.opc_mnemo = ''                 
    //this.opcode_asm = ['']*6       
                       
    this.PC = 0x200                                 // program counter

    
    this.I = 0                                      // pointer register
    this.V = new Uint8Array(STACK_SIZE).fill(0)
    
    // TIMERS
    
    this.time = 0
    this.tone = 0

    this.draw_flag = false
        
    this.opcode_lookup = {}

    this.ROMloaded = ''
    this.cycle_num = 0
    this.PC_prev = this.PC

    this.chip8_HTMLmonitor = true

    add_to_Vlog('chip8CPU REGISTERS ALL SET<BR>')

        


    }
    


    ROMload(filename){
        add_to_Vlog('ROM Load: ' + filename);

        this.PC = 0x200
        let program_offset = this.PC


        //window.cancelAnimationFrame(loop);

        fetch(filename).then( function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
            console.log(`FETCH OK > ${filename}`);
            return response;
            })
            .then( response => response.arrayBuffer())
            .then( buffer => {
                //console.log(buffer.byteLength);
                const program = new Uint8Array(buffer);

                this.memory.set( program, program_offset);

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
                

                if (arrays_equal (program, this.memory.slice(program_offset, program_offset + buffer.byteLength)) )
                    add_to_Vlog("RAM vs ROM: <B>EQUAL</b>");
                    else
                    add_to_Vlog("RAM vs ROM: NOT EQUAL");


                if(this.chip8_HTMLmonitor)    
                {
                    // VISUALIZE CHIP8 memory    
                    let HTML_CHIP8_Monitor = ''
                    for (let k=0; k<this.memory.length-0;k++)    
                        {
                        HTML_CHIP8_Monitor += `<div class="ch8MonCell" id="ch8MonCell-${k}">${this.memory[k].toString(16).toUpperCase()}</div>`
                        }

                    document.getElementById("chip8_monitor").innerHTML = HTML_CHIP8_Monitor                       
                }

  
            })
            .catch(function (error) {
                console.log('ROM FETCH PROBLEM: \n', error);
            });
    
    
            this.ROMloaded = filename


  


    }

    
    
    
    RUNcycle(){
        this.cycle_num += 1     //just for us

        // Decode & Execute
        let asm = this.OPCdecode()

        // TIMERS update
            
        if (this.tone > 0)
            {
            add_to_Vlog('SOUND');
            //winsound.Beep(7000 - this.tone * 200, 5)    
            this.tone -= 1    
            }
            
        if (this.time > 0)
            this.time -= 1     

        this.PC += 2    

    }



    

    // OPCODEs DECODE & EXECUTE
        
    OPCdecode() {
        // // OPCODE Load
        // //     merge both bytes and store them in an unsigned short (2 bytes datatype) 
        // //     then use the bitwise OR operation
        
        let cell_active = document.getElementById(`ch8MonCell-${this.PC_prev}`)

        if(this.chip8_HTMLmonitor)
        {
        

        if(typeof(cell_active) != 'undefined' && cell_active != null)
            {
            cell_active.setAttribute("style", "background-color:#000;color:white; border: 1px solid red;font-weight:normal")
            cell_active = document.getElementById(`ch8MonCell-${this.PC_prev+1}`)
            cell_active.setAttribute("style", "background-color:#000;color:white; border: 1px solid red;font-weight:normal")
            }
      }
    
        // cell_active = document.getElementById(`ch8MonCell-${this.PC}`)
        // cell_active.setAttribute("style", "background-color:#0F0;color:#000; border: 1px solid blue;font-weight:bold")
    
        // cell_active = document.getElementById(`ch8MonCell-${this.PC+1}`)
        // cell_active.setAttribute("style", "background-color:#0F0;color:#000; border: 1px solid blue;font-weight:bold")
        
        
        
        
        //// EXTRACT operands and data    http://devernay.free.fr/hacks/chip8/C8TECH10.HTM//1.0
        
        this.opcode = ( this.memory[ this.PC ] << 8 ) | this.memory[ this.PC + 1 ]
        
        // // weird BISQWIT code 
        // //this.opcode = this.memory[ this.PC & 0xFFF ] *0x100 + this.memory[ (this.PC + 1) & 0xFFF ]
        

        this.X = ((this.opcode & 0x0F00) >> 8) & 0xF                // // move it right to fit the V index
        this.Y = ((this.opcode & 0x00F0) >> 4) & 0xF
        this.n = this.opcode & 0x000F 
        this.nn = this.opcode & 0x00FF
        this.nnn = this.opcode & 0x0FFF  

        
        
        // if CONSOLE_DEBUG_MSG:
        //     print (' PC:' + str(hex(this.PC)),) 

        this.opcode_lookup = {
                              
        0x0000 : ()=>this.op_CLS_RET_RCA_1802() ,      // 0 based opcodes for Clear screen, RTS and Calls RCA 1802 program at address NNN. Not necessary for most ROMs.                                
        0x00E0 : ()=>this.op_CLS() ,                   // Clear VRAM
        0x00EE : ()=>this.op_RTS() ,                   // Return From Subroutine
        
        0x1000 : ()=>this.op_JMP() ,                   // 1nnn JMP to nnn
        0x2000 : ()=>this.op_SUB(),                   // 2nnn call SUBroutine at nnn. STORE STACK[++SP] = PC & PC = nn
        
        0x3000 : ()=>this.op_SE_vx_nn() ,              // 3Xnn SKIP next if VX == nn
        0x4000 : ()=>this.op_SNE_vx_nn() ,             // 4Xnn SKIP next if VX != nn
        
        0x5000 : ()=>this.op_SE_vx_vy() ,              // 5Xnn SKIP next if VX == VY
        
        0x6000 : ()=>this.op_LD_vx_nn() ,              // 6Xnn    to VX load nn
        0x7000 : ()=>this.op_ADD_vx_nn() ,             // 7Xnn    to VX add nn
        
        0x8000 : ()=>this.op_LD_vx_vy() ,              // 8XY0    to VX load VY
        
        0x8001 : ()=>this.op_LD_vx_vx_or_vy() ,        // 8XY1    to VX load (VX or | VY)
        0x8002 : ()=>this.op_LD_vx_vx_and_vy() ,       // 8XY2    to VX load (VX and & VY)
        0x8003 : ()=>this.op_LD_vx_vx_xor_vy() ,       // 8XY3    to VX load (VX xor ^ VY)
        0x8004 : ()=>this.op_LD_vx_vx_add_vy() ,       // 8XY4    to VX add VY - if Carry , set  vF to 1, else 0
        0x8005 : ()=>this.op_LD_vx_vx_sub_vy() ,       // 8XY5    to VX sub VY - VF is set to 0 when there's a borrow, and 1 when there isn't
        0x8006 : ()=>this.op_SHR_vx() ,                // 8XY6    shift VX right by 1.     VF is set to value of  
                                                //         least significant bit of VX before the shift
        
        0x8007 : ()=>this.op_SUBn_vx_vy() ,            // 8XY7    set VX to VY minus VX. 
                                                //         VF is set to 0 when there's a borrow, and 1 when there isn't.                    
        
        0x800E : ()=>this.op_SHL_vx() ,                // 8XYE    Shifts VX left by one. 
                                                //         VF is set to the value of the most significant bit of VX before the shift.
        
        0x9000 : ()=>this.op_SNE_vx_vy() ,             // 9XY0    skips next instruction if VX != VY
        
        
        0xA000 : ()=>this.op_LOAD_I_nnn(),             // Annn    ld I, nnn  - Annn - Sets I to the address nnn
        
        0xB000 : ()=>this.op_JP_v0_nnn(),              // Bnnn    JUMP to nnn + V0
        
        0xC000 :  ()=>this.op_RND_vx_nn(),              // CXnn    VX = result of '&' on random number and NN
        
        
        0xD000 :  ()=>this.op_D_XYN() ,                  // Dxyn    DRAW

        0xE09E :  ()=>this.op_SKP_vx() ,                  // Ex9E    skip next instruction if key stored in VX is pressed
        0xE0A1 :  ()=>this.op_SKNP_vx() ,                 // ExA1    skip next instruction if key stored in VX is NOT pressed
        
        
        0xF007 :  ()=>this.op_LD_VX_dt() ,               // Fx07     VX =  this.time    
        
        0xF00A :  ()=>this.op_LD_VX_n() ,                // Fx0A    Wait for a key press, store the value of the key in Vx.
                                                 //         All execution stops until a key is pressed, 
                                                 //         then the value of that key is stored in Vx
        
        0xF015 :  ()=>this.op_LD_dt_VX() ,               // Fx15      this.time = VX    - delay timer set to VX
        0xF018 :  ()=>this.op_LD_st_VX() ,               // Fx18      this.tune = VX    - sound timer set to VX
        0xF01E :  ()=>this.op_ADD_i_VX() ,               // Fx1E     to I add VX
        
        
        0xF029 :  ()=>this.op_LD_f_VX() ,               // Fx29      Set I = location of sprite for digit Vx
                                                //             The value of I is set to the location for the hexadecimal sprite corresponding to the value of Vx
        0xF033 :  ()=>this.op_LD_b_VX() ,               // Fx33      store BCD representation of Vx in memory locations I, I+1, and I+2
                                                //               The interpreter takes the decimal value of Vx, and places the hundreds digit in memory at location in I, 
                                                //               the tens digit at location I+1, 
                                                //               and the ones digit at location I+2
        
        0xF055 :  ()=>this.op_LD_i_VX() ,               // Fx55        put registers V0 - Vx in memory at location I >
                                                
                                                // Fx65        Fills V0 to VX (including VX) with values from memory starting at address I
                                                //             fill V0 to VX with contents of mem[I]+
    
        0xF065 :  ()=>this.op_LD_VX_i() 
        
                                     
        }
        
        
        

            //this.opcode = 0x00E0       // TEST
        
        let op_test = this.opcode & 0xF000
        
            //op_test = 0x00E0 & 0xF000  // TEST
        

        // | biBwise OR
        let switchLookUp = {
            0x0000: () => { // add_to_Vlog( `SUB 0x0000 ${this.opcode.toString(16)}`);      // TEST
                            return (0x0000 | this.opcode & 0xF0FF) } ,
            0x8000: () => { return (0x8000 | this.opcode & 0xF00F) } ,
            0xE000: () => { return (0xE000 | this.opcode & 0xF0FF) } ,
            0xF000: () => { return (0xF000 | this.opcode & 0xF0FF) } 
            
            // 0x0000: () => { 0x0000 | this.opcode & 0xF0FF },  
            // 0x8000: () => { 0x8000 | this.opcode & 0xF00F },  
            // 0xE000: () => { 0xE000 | this.opcode & 0xF0FF },  
            // 0xF000: () => { 0xF000 | this.opcode & 0xF0FF } 
        }
        
        let lookup

        if (op_test in switchLookUp)
            {
            lookup = switchLookUp[ op_test ]()
               // add_to_Vlog( `MAIN OPC: ${this.opcode.toString(16)}`)
            }
        else   // found direct opcode, no need for switching
            {
            lookup = this.opcode & 0xF000
               // add_to_Vlog(`SUB OPC: <B>${this.opcode.toString(16)}</b>`)

            }

        
    //add_to_Vlog( `LOOKUP OPCODE: ${lookup.toString(16)}`)
        
    //console.log(this.opcode_lookup[ lookup ]())
        
    try{

        add_to_Vlog(  `<span class="hard-space" style=" white-space: pre">     </span>` +
        `Try: ${lookup.toString(16)} : <B>${this.opcode_lookup[ lookup ]}</b>`)
                    //add_to_Vlog( `<span class="hard-space" style=" white-space: pre">     </span>TRY: <B>${lookup.toString(16)}             </b> : <B>${opcode_lookup[ lookup ]}</b>`)
                    //console.log(opcode_lookup[ lookup ])
       
                    this.opcode_lookup[ lookup ]()                // run the choosen method
                                                 // add 0x for a proper hex format
       
        //return str(hex(this.opcode)) + '\t' + this.opc_mnemo
    }
    catch (error)
        {
        add_to_Vlog( `OPC lookup error: ${lookup.toString(16)}, ${error}`)
                    //return str(hex(this.opcode)) + ' Look up error' 
        }
        

     
   






     

    // let cell_active = document.getElementById(`ch8MonCell-${this.PC_prev}`)
    // cell_active.setAttribute("style", "background-color:green;color:white; border: 1px solid red;font-weight:normal")
    // cell_active = document.getElementById(`ch8MonCell-${this.PC_prev+1}`)
    // cell_active.setAttribute("style", "background-color:green;color:white; border: 1px solid red;font-weight:normal")
    if(this.chip8_HTMLmonitor)
    {
        if(typeof(cell_active) != 'undefined' && cell_active != null)
        {
            cell_active = document.getElementById(`ch8MonCell-${this.PC}`)
            cell_active.setAttribute("style", "background-color:#0F0;color:#000; border: 1px solid blue;font-weight:bold")

            cell_active = document.getElementById(`ch8MonCell-${this.PC+1}`)
            cell_active.setAttribute("style", "background-color:#0F0;color:#000; border: 1px solid blue;font-weight:bold")
        }
    }
        
    this.PC_prev = this.PC


    }   // OPCdecode() {









    

    // # ***************
    // # *** OPCODES ***
    // # ***************

    // # 0x0000

    op_CLS_RET_RCA_1802()
        {
                //self.PC = self.nnn
                //self.opc_mnemo = 'unused RCA 1802 ' + str(hex(self.opcode))
        //add_to_Vlog( '*** OP: op_CLS_RET_RCA_1802 ***')
        
        }

    // # 0x00E0                                clear screen

    op_CLS() {
        //clear_Vlog()
        //add_to_Vlog( 'OP: op_CLS')   
        console.log( 'OP: op_CLS')   
        // for (let i = range(len(self.VRAM)))
        //     self.VRAM[i] = 0

        // TESTing with random color
        //this.screen.fill( "#333" )  // max / min
        
        this.screen.clearVRAM()
        


    } 

    // # 0x00EE                                return from a subroutine
    op_RTS(){
        this.SP -= 1
        this.PC = this.stack[this.SP % 12]
    } 

    // # 0x1nnn                                jump to address NNN
    op_JMP(){
        this.PC = this.nnn
        this.PC -= 2                        
   
        // ?? below
        // # HAD TO REMOVE one cycle otherwise it jumped too far
        // # there is a single increment instruction in the main loop
        // # self.PC += 2
        // # so there is no need to repeat it in every other procedure

    } 


    // # 0x2nnn         call a SUBroutine at nnn. STORE STACK[++SP] = PC & PC = nnn
    // # TODO check for ++self.SP % 12 - at BISKWIT
    // # increment stack pointer SP + 1 and put there current PC / program counter on the stack

    op_SUB(){       


                    //console.log(`SUB THIS )
        
        // add_to_Vlog(`op_SUB() before: Stack: ${this.stack}  PC: ${this.PC}`)

        this.stack[this.SP % 12] = this.PC
        this.SP += 1

        this.PC = this.nnn                      // # new program counter PC
        this.PC -= 2

        // add_to_Vlog(`op_SUB() after: Stack: ${this.stack}  PC: ${this.PC}`)

                 //add_to_Vlog( `EXECUTE *** op_SUB ***`)


    }






    // # 3Xnn              skip the next instruction if VX == NN

    op_SE_vx_nn(){
        let X = this.X
        if (this.nn == this.V[X])
            this.PC += 2
    }

    // # 4Xnn                                 skip the next instruction if VX != NN

    op_SNE_vx_nn(){
        let X = this.X
        if (this.V[X] != this.nn)
            this.PC += 2
    }

    // # 5XY0                                  skip the next instruction if VX == VY

    op_SE_vx_vy(){
        let X = this.X
        let Y = this.Y

        if (this.V[X] == this.V[Y])
            this.PC += 2
    }


    // # 6Xnn                                        LD set VX to NN

    op_LD_vx_nn(){
        let X = this.X
        this.V[X] = this.nn
    }
   
    // # 7Xnn                                        to VX add nn
    op_ADD_vx_nn(){
        let X = this.X
        this.V[X] = (this.V[X] + this.nn) & 0xFF  // # need to take care of BYTES
        // #this.V[X] = (this.V[X] + this.nn) % 256
    }

    // # 8XY0                                           set to VX load VY

    op_LD_vx_vy(){
        let X = this.X
        let Y = this.Y

        this.V[X] = this.V[Y]
    }

    // # 8XY1                                            or vX,vY    VX = VX or VY

    op_LD_vx_vx_or_vy(){
        let X = this.X
        let Y = this.Y

        this.V[X] = (this.V[X] | this.V[Y]) & 0xFF  // # byte
    }


    // # 8XY2                                            to VX load (VX and & VY)

    op_LD_vx_vx_and_vy(){
        let X = this.X
        let Y = this.Y

        this.V[X] = (this.V[X] & this.V[Y]) & 0xFF      // # byte
    }

    // # 8XY3                                            to VX load (VX xor ^ VY)

    op_LD_vx_vx_xor_vy(){
        let X = this.X
        let Y = this.Y

        // # byte       # xor vX,vY    VX = VX ^ VY
        this.V[X] = (this.V[X] ^ this.V[Y]) & 0xFF
    }


    // # 8XY4                                        to VX add VY - if Carry , set  vF to 1, else 0

    op_LD_vx_vx_add_vy(){
        let X = this.X
        let Y = this.Y

        let val = this.V[X] + this.V[Y]
        if (val > 255)
            this.V[0xF] = 0x1  // # (val >> 8) & 0xff
        else
            this.V[0xF] = 0x0

        this.V[X] = val & 0xFF
        // #this.V[X] %= 256
    }


    // # 8XY5                                        VX =  VX sub VY ; VF is set to 0 when there's a borrow, and 1 when there isn't

    op_LD_vx_vx_sub_vy(){
        let X = this.X
        let Y = this.Y

        let val = this.V[X] - this.V[Y]

        if (this.V[X] > this.V[Y])
            this.V[0xF] = 0x1
        else {
            this.V[0xF] = 0x0
        }

        //#this.V[X] = val % 256
        this.V[X] = val & 0xFF              //# take care of BYTES
        //# this.V[0xF] = (~(val >> 8)) & 0xFF
        //# something is not right here wven with ~
    }


    // # 8XY7    set VX to VY minus VX.
    // #         VF is set to 0 when there's a borrow, and 1 when there isn't.

    op_SUBn_vx_vy(){
        let X = this.X
        let Y = this.Y

        let val = this.V[Y] - this.V[X]

        if (this.V[Y] > this.V[X])
            this.V[0xF] = 0x1
        else
            this.V[0xF] = 0x0

        this.V[X] = val & 0xFF              // # take care of BYTES
    }


    // # 8XY6                 shift VX right by 1.     VF is set to value of
    // #                      least significant bit of VX before the shift

    op_SHR_vx(){
        let X = this.X
        let Y = this.Y

        this.V[0xF] = this.V[X] & 0x01
        this.V[X] = (this.V[X] >> 1) & 0xFF
    }

    // # 8XYE                shift VX left by one.
    // #                     VF is set to the value of the most significant bit of VX before the shift.
    op_SHL_vx(){
        let X = this.X
        let Y = this.Y
        this.V[0xF] = (this.V[X] >> 7) & 0x01
        this.V[X] = (this.V[X] << 1) & 0xFF
    }


    // # 0x9000                9XY0    skips next instruction if VX != VY

    op_SNE_vx_vy(){
        let X = this.X
        let Y = this.Y

        if (this.V[X] != this.V[Y])
            this.PC += 2
           //add_to_Vlog("EXEC op_SNE_vx_vy: " + X)
    }

    // # Annn                            sets I to the address NNN.

    op_LOAD_I_nnn(){
        this.I = this.nnn
            
            //let tmp = this.nnn.toString(16).toUpperCase()
            // add_to_Vlog(`op_LOAD_I_nnn(${tmp})`)
        
    }

        
    // # Bnnn                            JUMP to nnn + V0

    op_JP_v0_nnn(){
        this.PC = this.nnn + this.V[0]
        this.PC -= 2
    }

    // # 0xC000                            CXnn    VX = result of '&' on random number and NN

    op_RND_vx_nn(){
        let X = this.X
        let nn = this.nn
        let rand = Math.floor(Math.random() * 0xFF)

        this.V[X] = (rand & nn) & 0xFF  // # byte
    }


    // # DRAW *****************************************************************************


    op_D_XYN(){
        let X = this.V[this.X]
        let Y = this.V[this.Y]
        let n = this.n

        this.V[0xF] = 0
       

        for ( let next_pix=0; next_pix < n; next_pix++)
            {
            let pixel = this.memory[this.I + next_pix]

            for (let x_line=0; x_line<8; x_line++)           //# 8 bits per line
                {
                // #x_coord = X % display_width + x_row * 8

                let x_pos = (X + x_line) % DISPLAY_WIDTH
                let y_pos = (Y + next_pix) % DISPLAY_HEIGHT

                let sprite_bit = (pixel >> (7 - x_line)) & 1

                let bit_pos = y_pos * DISPLAY_WIDTH + x_pos
                let VRAM_old = this.screen.VRAM[bit_pos]

                this.screen.VRAM[bit_pos] = VRAM_old ^ sprite_bit

                if (VRAM_old != 0 && this.screen.VRAM[bit_pos] == 0)
                    this.V[0xF] = 1

                let new_x = x_pos * SCREEN_SCALE
                let new_y = y_pos * SCREEN_SCALE

                if (VRAM_old ^ sprite_bit)

                    // if PYGAME_DISPLAY:
                    // this.screen.VRAM[new_x: new_x + screen_scale,
                    //             new_y: new_y + screen_scale] = COL_FG
                    this.screen.setPixel(new_x + SCREEN_SCALE, new_y + SCREEN_SCALE)
                else {
                    if (this.V[0xF])
                        // if PYGAME_DISPLAY:
                        // this.screen.VRAM[new_x: new_x + screen_scale,
                        //             new_y: new_y + screen_scale] = CLS_BG
                        this.screen.setPixel(new_x + SCREEN_SCALE, new_y + SCREEN_SCALE)
                        }

        }


        this.draw_flag = true
        this.screen.draw()
    }

    }


    // # 0xE09E                                    # Ex9E    skip next instruction if key stored in  VX  is pressed
    op_SKP_vx(){
        let X = this.X
        
        if (this.keyboard.keysPressed[this.V[X] & 0xF] == 1)
            {
            this.PC += 2
            add_to_Vlog("op_SKP_vx")
            }

    }

    // # 0xE0A1                                    # ExA1    skip next instruction if key stored in  VX  is NOT pressed
    op_SKNP_vx(){
        let X = this.X

        if (this.keyboard.keysPressed[this.V[X] & 0xF] != 1)
            {
            this.PC += 2
            add_to_Vlog("op_SKNP_vx")
            }

    }

    // # Fx07                                            VX = self.time
    // # DELAY TIMER to VX
    op_LD_VX_dt(){
        let X = this.X
        this.V[X] = this.time
    }

    // # 0xF00A                                    Fx0A    Wait for a key press, store the value of the key in Vx.
    // #       All execution stops until a key is pressed,
    // #       then the value of that key is stored in Vx
    op_LD_VX_n(){
                
                // let tmp = this.n.toString(16).toUpperCase()
                // add_to_Vlog( `op_LD_VX_n(${tmp})` )
                // console.log( `op_LD_VX_n(${tmp})` )
        add_to_Vlog("KB CHECK")        
        let X = this.X

        if( this.keyboard.keysPressed[this.keyboard.KEY_MAP[this.keyboard.key_down]] = 1 )
            {
                //# the NEEDED signal comes from the keyboard pressed
            this.V[X] = this.keyboard.KEY_MAP[this.keyboard.key_down] 
            add_to_Vlog("RRRRRRRRRR"+ this.keyboard.KEY_MAP[this.keyboard.key_down])
            }

        else
            this.PC -= 2

    }

    // # Fx18                                          self.tone = VX    - sound timer set to VX
    // # VX to SOUND TIMER
    op_LD_st_VX(){
        let X = this.X
        this.tone = this.V[X]

        add_to_Vlog( `### SOUND` )
    }

    // # VX to DELAY TIMER
    // # Fx15    self.time = VX    - delay timer set to VX
    op_LD_dt_VX(){
        let X = this.X
        this.time = this.V[X]
        
    }

    // # I + VX
    // # Fx1E      to I add VX    
    op_ADD_i_VX(){
        let X = this.X
        this.I = (this.I & 0xFFF) + this.V[X]
        this.V[0xF] = this.I >> 12

    }

    // # Fx29                                      Set I = location of sprite for digit Vx
    op_LD_f_VX(){
        let X = this.X
            // #    & 0xFF may be unnecessary - just checking
            // # The value of I is set to the location
        this.I = (this.V[X] & 0xFF) * 5
            // #    for the hexadecimal sprite
            // #    corresponding to the value of Vx
    }

    // # Fx33
    // # BCD representation of Vx put to I (hundreds), I+1 (tens) and I+2 (ones)
    op_LD_b_VX(){
        let X = this.X
        let VX = this.V[X]

        this.memory[this.I & 0xFFF] = ((VX / 100) % 10) & 0xFF
        this.memory[(this.I + 1) & 0xFFF] = ((VX / 10) % 10) & 0xFF
        this.memory[(this.I + 2) & 0xFFF] = ((VX / 1) % 10) & 0xFF
    }
    
    // # Fx55
    // # V0 to VX put at mem[I]
    op_LD_i_VX(){
        let X = this.X

        for (let i=0; i< X + 1; i++)
            this.memory[(this.I + i) & 0xFFF] = this.V[i]
    }

    // # Fx65                                        Fills V0 to VX (including VX) with values from memory starting at address I
    // #                                             fill V0 to VX with contents of mem[I]+
    op_LD_VX_i(){
        let X = this.X

        for (let i=0; i< X + 1; i++)
            this.V[i] = this.memory[(this.I + i) & 0xFFF]

    }


}   // chip8CPU class




