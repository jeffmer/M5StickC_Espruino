
lcd.setColor(0x07E0);
lcd.setRotation(0);
var time;
var started = false;
setWatch(()=>
   {
      if (!started){
        time = Date.now();
        started = true;
        lcd.fillRect(0,0,79,159);
        lcd.flip();
        time = Math.floor(Date.now()-time);
        console.log("Time to Draw Rectangle: "+time+"ms");
      } else {
         lcd.clear();
         started = false;
      }
   },M5C.BTNA,{repeat:true,edge:-1,debounce:200});
