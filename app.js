// display battery current and voltage
var pal1color = new Uint16Array([0x0000,0xFFFF]);
var buf = Graphics.createArrayBuffer(10,60,1,{msb:true});
buf.setRotation(3);
buf.setColor(1);
buf.setFont("6x8");

function drawbuf(x,y){
   g.drawImage({width:10,height:64,bpp:1,buffer:buf.buffer, palette:pal1color},x,y);
   buf.clear();
}

function draw() {
   buf.drawString(M5C.batA().toFixed(1)+"ma",0,0);
   drawbuf(0,0);
   buf.drawString(M5C.batV().toFixed(1)+"V",0,0);
   drawbuf(0,100);
}

setInterval(draw,2);

var ssid = '';
var password = '';

var wifi = require('Wifi');
wifi.connect(ssid, {password: password}, function() {
    console.log('Connected to Wifi.  IP address is:', wifi.getIP().ip);
    //wifi.save(); // Next reboot will auto-connect
});
