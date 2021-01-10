import {add_to_Vlog, add_to_Vstatus, clear_Vlog} from './base-utils.js';





// CONSTANTS // CHIP8 definition

const DISPLAY_WIDTH = 64
const DISPLAY_HEIGHT = 32                      // COLS / ROWS
const DEVICE_SCREEN_IN_PIXELS = DISPLAY_WIDTH * DISPLAY_HEIGHT
//DEVICE_SCREEN_PIXELS_COUNT = DISPLAY_WIDTH * SCREEN_SCALE * DISPLAY_HEIGHT * SCREEN_SCALE


const SCREEN_SCALE = 10

const CLS_BG = "#0a0"











// CHIP8

//const REGISTERS_NUM = 0x10

//PC NUMPAD

export class Keyboard {
    constructor() {
        
        add_to_Vlog("KEYBOARD CONSTRUCTOR");
        

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
    this.keysPressed.fill(false) 

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
        this.keysPressed[key] = true;

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
        this.keysPressed[key] = false;
    }

}

//print(KEY_MAP)






// DEVICE SCREEN OPS

export class Display_Screen{
    constructor(canvas, scale){
        this.display = new Array(DISPLAY_WIDTH * DISPLAY_HEIGHT);
        this.display.fill(CLS_BG)
        
        this.canvas = canvas;
        console.log(this.canvas);

        this.canvas.width = DISPLAY_WIDTH * SCREEN_SCALE;
        this.canvas.height = DISPLAY_HEIGHT * SCREEN_SCALE;

        this.canvasCtx = this.canvas.getContext('2d');
    }

    draw() {
        this.canvasCtx.fillStyle = CLS_BG;
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for(let i=0; i < DISPLAY_WIDTH * DISPLAY_HEIGHT; i++) {
            let x = (i % DISPLAY_WIDTH) * SCREEN_SCALE;
            let y = Math.floor(i / DISPLAY_WIDTH) * SCREEN_SCALE;

            if(this.display[i] == 1) {
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

        this.display[x + (y * DISPLAY_WIDTH)] ^= 1;
        return this.display[x + (y * DISPLAY_WIDTH)] != 1;
    }


    test() {
        this.setPixel(0, 0);
        this.setPixel(5, 2);
        this.setPixel(DISPLAY_WIDTH-1, DISPLAY_HEIGHT-1);
        this.draw();
    }

}







export class Chip8CPU{

    constructor(keyboard) {     // initialize()

    add_to_Vlog('INIT KEYBOARD');
   
    this.keyboard = keyboard;

    add_to_Vlog('OK');
    }
    
  
    ROMload(filename){
        add_to_Vlog('ROM Load...: ' + filename);
        //window.cancelAnimationFrame(loop);

        fetch(filename).then( function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
            console.log('FETCH OK > ', filename);
            return response;
            })
            .then( response => response.arrayBuffer())
            .then( buffer => {
                console.log(buffer.byteLength);
                const program = new Uint8Array(buffer);
                add_to_Vlog(program);
  
            })
            .catch(function (error) {
                console.log('ROM FETCH PROBLEM: \n', error);
            });

    }

    // RUNcycle(){

    // }


}

