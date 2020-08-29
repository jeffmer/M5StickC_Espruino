// display battery current and voltage
var pal1color = new Uint16Array([0x0000,0xFFFF]);
var buf = Graphics.createArrayBuffer(10,60,1,{msb:true});
buf.setRotation(3);
buf.setColor(1);
buf.setFont("6x8");

function drawbuf(x,y){
   lcd.drawImage({width:10,height:60,bpp:1,buffer:buf.buffer, palette:pal1color},x,y);
   buf.clear();
}

function draw() {
   buf.drawString(M5C.batA().toFixed(1)+"ma",0,0);
   drawbuf(0,0);
   buf.drawString(M5C.batV().toFixed(1)+"V",0,0);
   drawbuf(0,100);
}

// display incrementing number
var pal2color = new Uint16Array([0x0000,0xE007]);
var buf2 = Graphics.createArrayBuffer(20,64,1,{msb:true});
buf2.setRotation(3);
buf2.setColor(1);
buf2.setFont("Vector",20);

var N = 0;
function drawNumber() {
   buf2.drawString(N,0,0);
   lcd.drawImage({width:20,height:64,bpp:1,buffer:buf2.buffer, palette:pal2color},30,50);
   buf2.clear();
   ++N;
   if (N>999) N = 0;
}

lcd.clear();
setInterval(draw,2000);
setInterval(drawNumber,200);

