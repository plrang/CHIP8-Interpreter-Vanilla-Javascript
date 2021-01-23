
import {Keyboard, Display_Screen, Chip8CPU, FONTSET} from './chip8CPUmod.js';
import { hex_dec, beep} from './base-utils.js';
import { add_to_Vlog, add_to_Vstatus, clear_Vlog, interfaceShow, clear_Vstatus} from './app-utils-cfg.js';

clear_Vlog()
add_to_Vlog('<BR>ENTERING JS')
   

let UpCycle = 1    // boost the clock ticks per frame


function OnLoadFunction() {

    add_to_Vstatus("STATUS FIELD OK");

    const keyboard = new Keyboard();
    const screen = new Display_Screen(document.getElementById("screen"), 20);
    
    const CHIP8 = new Chip8CPU(keyboard, FONTSET, screen)  // Initialize

    
    CHIP8.paused = true

    let ROM_dir = "./ROMs/"
    let ROM_filename
    
    //ROM_filename = "Chip8Picture.ch8"
    ROM_filename = "IBMLogo.ch8"
    //ROM_filename = "Maze.ch8"
    //ROM_filename = "random_number_test.ch8"
    //ROM_filename = "Breakout.ch8"
    //ROM_filename = "Invaders.ch8"
     //ROM_filename = "SPACE-INVADER.ch8"
    //ROM_filename = "Brix.ch8"
    //ROM_filename = "ZeroDemo.ch8"       // ok
     
    //ROM_filename = "Syzygy.ch8"       // ~
    
    //ROM_filename = "Sierpinski.ch8" 
    
    //ROM_filename = "Airplane.ch8"
    //ROM_filename = "UFO.ch8"
    //ROM_filename = "DelayTimerTest.ch8"
    //ROM_filename = "Life.ch8"
    //ROM_filename = "Stars.ch8"    
    //ROM_filename = "ParticleDemo.ch8"  
    //ROM_filename = "Missile.ch8"       // ~~

    //ROM_filename = "LunarLander.ch8"       // ok



    //ROM_filename = "Paddles.ch8"       
    
    //ROM_filename = "Trip8.ch8"

    //ROM_filename = "Clock.ch8"
    //ROM_filename = "Tetris.ch8"
    
    //ROM_filename = "Blinky.ch8"
    //ROM_filename = "Blitz.ch8"
    
    //ROM_filename = "Landing.ch8"       // ~~
    //ROM_filename = "KeypadTest.ch8"       // good for keypad checking
    //ROM_filename = "Kaleid.ch8"       // ~
    //ROM_filename = "AstroDodge.ch8"    
    //ROM_filename = "AnimalRace.ch8"    // weird 
    
    //ROM_filename = "plrangTest.ch8"



    CHIP8.ROMload( ROM_dir + ROM_filename )

    add_to_Vlog('After CHIP8.ROMload')

    //add_to_Vlog('FONTSET:', CHIP8.fontset)

    console.log(hex_dec( 'STARTUP CHIP8.PC state:', CHIP8.PC))

    // PREPARE the MAIN LOOP

    var FPS = 60                // required framerate
    var FPS_measured = 0        // measured CHIP8 framerate
    var FPS_measured_show = 0   
    var FPScurrent_show = 0
    var elapsed_for_loops_per_FPS = 0
    var time_passed = 0

    let deltaTime, FPScurrent, testCPUCycleTime_start, testCPUCycleTime_end, testTime

   
    function MainLoop() {

                if(interfaceShow.Vstatus)
                    clear_Vstatus();

        // now = Date.now();        // deprec.
        let now = performance.now();

        let elapsed = now - lastTime;
        deltaTime = elapsed/1000

                // if(interfaceShow.Vstatus) add_to_Vstatus(`<BR>Elapsed time: ${elapsed} Delta: ${deltaTime} Passed: ${time_passed} <BR>`);

        FPScurrent = 1/ deltaTime
        time_passed += deltaTime;
        // CPU TICK


        // PERFORMANCE TEST
        // let c_num = CHIP8.cycle_num%20==19
        // if(c_num)
            //  testCPUCycleTime_start = performance.now()

            

    if(CHIP8.paused===false)    
        {

        for(let k=0; k< UpCycle; k++)              // SI - 10, UFO - 5
            {
            CHIP8.RUNcycle()
            //if(k%5==0)  CHIP8.screen.draw()
            }

        }
        else 
        {
        if(CHIP8.tickFWD)   
            {
                //console.log('TICK FORWARD')
            //CHIP8.PC+=2    
            CHIP8.RUNcycle() 
            CHIP8.paused = true
            CHIP8.tickFWD = false
            }
        
        if(CHIP8.tickBCK)   
            {
                //console.log('TICK BACK')
            
            CHIP8.PC-=4
            CHIP8.RUNcycle() 
            CHIP8.paused = true
            CHIP8.tickBCK = false
            }      
        }  
        
    //CHIP8.screen.draw()



        // PERFORMANCE TEST
        //  if(c_num)
            // {
            // testCPUCycleTime_end = performance.now()
            // testTime = testCPUCycleTime_end - testCPUCycleTime_start
            // console.log('EXECUTION TIME: CHIP8.RUNcycle()', testTime)
            // }

        // PERFORMANCE TEST showed that each CPU opcode has a different execution time, 
        // which is obvious, but it is worth remembering

        
        


        // REQUIRED FPS - not used ATM

        //  if(time_passed > 1/FPS ){

        //     time_passed = 0;
        //     FPS_measured = Math.round(1/elapsed_for_loops_per_FPS*1000);
        //     elapsed_for_loops_per_FPS = 0;
        // }

        // elapsed_for_loops_per_FPS += elapsed;    

        // if(interfaceShow.Vstatus)
        //     if(CHIP8.cycle_num%20==19)
        //         {
        //         FPScurrent_show = Math.round(FPScurrent);
        //         FPS_measured_show = FPS_measured;
        //         }

        // lastTime = now;
        
        
        if(interfaceShow.Vstatus)        
            add_to_Vstatus(
                lastTime 
                + ' CPU cycle: ' + CHIP8.cycle_num
                + ' FPS interval: ' 
                + ' FPS HW current: ' + FPScurrent_show
                + "<BR>Real / set FPS: " + FPS_measured_show
                + '<BR>KB: ' + CHIP8.keyboard.keysPressed.toString()
                + '<BR><BR>CHIP STATE'
                + '<BR>SP: ' + CHIP8.SP
                + '<BR>PC: ' + hex_dec('', CHIP8.PC)
                + '<BR>OPC: ' + hex_dec('', CHIP8.opcode)
                + '<BR>I: ' + hex_dec('', CHIP8.I)
                + '<BR>STACK: ' + CHIP8.stack
                + '<BR>V: ' + CHIP8.V
                + '<BR>DTime: ' + CHIP8.time
                + '<BR>DTone: ' + CHIP8.tone
                + '<BR>Draw Flag: ' + CHIP8.draw_flag
                + '<BR>VRAM: ' + CHIP8.screen.VRAM
                + '<BR>RND: ' + Math.floor(Math.random() * 0xFF)
                + '<BR>CHIP PAUSED: ' + CHIP8.paused
            );

        // if(interfaceShow.Vlog)                
        //     if(CHIP8.cycle_num%1300==1299)
        //         clear_Vlog()


        loop = requestAnimationFrame( MainLoop );

    }


    var lastTime
    var loop
    let waitingTimer  

    let checkROMLoaded = new Promise( function(resolve, reject) {
      
        waitingTimer = setInterval(()=>{
            console.log('WAITING FOR ROM', CHIP8.ROMloaded) 
            if(CHIP8.ROMloaded) {
                clearInterval( waitingTimer)
                resolve('RESOLVE: ROM LOADED')
            }
            else reject('REJECT: WAITING FOR ROM...');
            
        }, 1000);

    })


    checkROMLoaded.then((msg)=>{
        console.log(`${msg} : START the LOOP`);
        lastTime = performance.now();

        loop = requestAnimationFrame( MainLoop ) 
    })
   







    // PAUSE EXECUTION

    const onKeyDown_app = (event) => {
        let keyId = event.key +'-' +event.location
        
        if(keyId=='Pause-0')
        {
            //console.log('KEY: ', event.key +'-' +event.location)
            CHIP8.paused = true
        }
    }
    
    const onKeyUp_app = (event) => {
        let keyId = event.key +'-' +event.location
        
        if(keyId=='Pause-0')
        {
            //console.log('KEY: ', event.key +'-' +event.location)
            CHIP8.paused = false
        }

        if(keyId=='p-0')
            CHIP8.paused = true

        if(keyId==']-0'){
            CHIP8.tickFWD = true
        }

        if(keyId=='[-0')
            CHIP8.tickBCK = true



        

    }

    window.addEventListener("keydown", onKeyDown_app.bind(), false)
    window.addEventListener("keyup", onKeyUp_app.bind(), false)
    




}

window.onload = OnLoadFunction();





