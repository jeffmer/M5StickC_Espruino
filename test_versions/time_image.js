
// display battery current and voltage
lcd.setRotation(0);
var pal1color = new Uint16Array([0x0000,0xF100]);
var buf = Graphics.createArrayBuffer(80,160,1,{msb:true});
buf.setColor(1);
buf.fillRect(0,0,79,159);

var time;
var started = false;
setWatch(()=>
   {
     if (!started){
        time = Date.now();
        started = true;
        lcd.drawImage({width:80,height:160,bpp:1,buffer:buf.buffer, palette:pal1color},0,0);
        lcd.flip();
        time = Math.floor(Date.now()-time);
        console.log("Time to Draw Image: "+time+"ms");
      } else {
         lcd.clear();
         started = false;
      }
   },M5C.BTNA,{repeat:true,edge:-1,debounce:200});
