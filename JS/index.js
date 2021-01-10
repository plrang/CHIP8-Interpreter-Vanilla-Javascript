
import {Keyboard, Display_Screen, Chip8CPU, FONTSET} from './chip8CPUmod.js';
import {add_to_Vlog, add_to_Vstatus, clear_Vlog, clear_Vstatus} from './base-utils.js';

//console.log('ENTERING JS')
clear_Vlog()
add_to_Vlog('<BR>ENTERING JS')



function OnLoadFunction() {

    add_to_Vstatus("STATUS FIELD OK");

    const keyboard = new Keyboard();
    
    const CHIP8 = new Chip8CPU(keyboard, FONTSET)  // Initialize
    
    const CHIP8_Screen = new Display_Screen(document.getElementById("screen"), 20);
    
    CHIP8_Screen.test()

    const ROM_dir = "./ROMs/"
    const ROM_filename = "Chip8Picture.ch8"

    CHIP8.ROMload( ROM_dir + ROM_filename )

    add_to_Vlog('After CHIP8.ROMload')

    //add_to_Vlog('FONTSET:', CHIP8.fontset)
    





    
    // MAIN LOOP

    var FPS = 60
    var FPScurrent_show = 0;

    var loop_monitor = 0

    function MainLoop() {

        let fpsInterval, deltaTime, FPScurrent; 

        clear_Vstatus();

        fpsInterval = 1000/FPS

        // now = Date.now();        // deprec.
        let now = performance.now();

        let elapsed = now - lastTime;
        deltaTime = elapsed/1000

        add_to_Vstatus("<BR>Elapsed time:" + elapsed + ' Delta time: ' + deltaTime + '<BR>');

        FPScurrent = 1/ deltaTime
        

        // CPU TICK

        if(elapsed > fpsInterval){
            //chip8.RUNcycle();
            loop_monitor++;


        }


        
        if(loop_monitor%30==29)
            FPScurrent_show = Math.round(FPScurrent)

        lastTime = now;
        
        add_to_Vstatus(
            lastTime 
            + ' Loop: ' + loop_monitor 
            + ' FPS interval: ' 
            + fpsInterval + ' FPS current: ' + FPScurrent_show
            + '<BR>KB: ' + CHIP8.keyboard.keysPressed.toString()
        );


                

        if(loop_monitor%300==299)
            clear_Vlog()

        loop = requestAnimationFrame( MainLoop );

        
    }


    //then = Date.now();
    var lastTime = performance.now();
    var loop = requestAnimationFrame( MainLoop ) ;


}



window.onload = OnLoadFunction();





