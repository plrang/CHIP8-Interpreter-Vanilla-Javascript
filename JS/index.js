
import {Keyboard, Display_Screen, Chip8CPU, FONTSET} from './chip8CPUmod.js';
import {add_to_Vlog, add_to_Vstatus, clear_Vlog, clear_Vstatus, hex_dec} from './base-utils.js';

//console.log('ENTERING JS')
clear_Vlog()
add_to_Vlog('<BR>ENTERING JS')




function OnLoadFunction() {

    add_to_Vstatus("STATUS FIELD OK");

    const keyboard = new Keyboard();
    const CHIP8_Screen = new Display_Screen(document.getElementById("screen"), 20);
   
    CHIP8_Screen.test()
    
    const CHIP8 = new Chip8CPU(keyboard, FONTSET, CHIP8_Screen)  // Initialize
    
   

    const ROM_dir = "./ROMs/"
    //const ROM_filename = "Chip8Picture.ch8"
    //const ROM_filename = "Clock.ch8"
    //const ROM_filename = "BC_test.ch8"
    const ROM_filename = "random_number_test.ch8"

    //const ROM_filename = "Tetris.ch8"
    //const ROM_filename = "Maze.ch8"
    //const ROM_filename = "Breakout.ch8"
    
    //const ROM_filename = "Invaders.ch8"
    //const ROM_filename = "Airplane.ch8"
    //const ROM_filename = "Blinky.ch8"
    //const ROM_filename = "Brix.ch8"
    //const ROM_filename = "DelayTimerTest.ch8"
    //const ROM_filename = "Life.ch8"
    //const ROM_filename = "Sierpinski.ch8"
    //const ROM_filename = "Stars.ch8"
    //const ROM_filename = "Trip8.ch8"
    //const ROM_filename = "UFO.ch8"
    
    //const ROM_filename = "IBMLogo.ch8"

    CHIP8.ROMload( ROM_dir + ROM_filename )

    add_to_Vlog('After CHIP8.ROMload')

    //add_to_Vlog('FONTSET:', CHIP8.fontset)
    



    console.log(hex_dec( 'STARTUP CHIP8.PC state:', CHIP8.PC))



    // MAIN LOOP

    var FPS = 1     // required framerate
    var FPS_measured = 0   // measured CHIP8 framerate
    var FPS_measured_show = 0   // measured CHIP8 framerate
    var FPScurrent_show = 0

    var elapsed_for_loops_per_FPS = 0
    var loop_monitor = 0
    var time_passed = 0

    function MainLoop() {

        let fpsInterval, deltaTime, FPScurrent; 

        clear_Vstatus();

        fpsInterval = 1000/FPS

        // now = Date.now();        // deprec.
        let now = performance.now();

        let elapsed = now - lastTime;
        deltaTime = elapsed/1000

        add_to_Vstatus(`<BR>Elapsed time: ${elapsed} Delta time: ${deltaTime} time_passed: ${time_passed} <BR>`);

        FPScurrent = 1/ deltaTime
        
        time_passed += deltaTime;
        // CPU TICK

       

        if(time_passed > 1/FPS){
        //if(elapsed > fpsInterval){
            CHIP8.RUNcycle()

            loop_monitor++;
            time_passed = 0;
            FPS_measured = Math.round(1/elapsed_for_loops_per_FPS*1000);
            
            elapsed_for_loops_per_FPS = 0;


        }

        elapsed_for_loops_per_FPS += elapsed;    
       

        if(loop_monitor%20==19)
            {
            FPScurrent_show = Math.round(FPScurrent);
            FPS_measured_show = FPS_measured;
            }

        lastTime = now;
        
        
        

        add_to_Vstatus(
            lastTime 
            + ' Loop: ' + loop_monitor 
            + ' FPS interval: ' 
            + fpsInterval + ' FPS HW current: ' + FPScurrent_show
            + "<BR>Measured FPS: " + FPS_measured_show
            + '<BR>KB: ' + CHIP8.keyboard.keysPressed.toString()
            + '<BR><BR>CHIP STATE'
            + '<BR>SP: ' + CHIP8.SP
            + '<BR>PC: ' + CHIP8.PC
            + '<BR>OPC: ' + CHIP8.opcode.toString(16)
            + '<BR>I: ' + CHIP8.I
            + '<BR>STACK: ' + CHIP8.stack
            + '<BR>V: ' + CHIP8.V
            + '<BR>DTime: ' + CHIP8.time
            + '<BR>DTone: ' + CHIP8.tone
            + '<BR>Draw Flag: ' + CHIP8.draw_flag
            + '<BR>VRAM:' + CHIP8.screen.VRAM
            + '<BR>RND:' + Math.floor(Math.random() * 0xFF)
            
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





