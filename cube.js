
var pal1color = new Uint16Array([0x0000,0xFFFF]);
var g = Graphics.createArrayBuffer(80,80,1,{msb:true});
g.setRotation(0);
g.setColor(1);

function flip(){
   lcd.setRotation(0);
   lcd.drawImage({width:80,height:80,bpp:1,buffer:buf.buffer, palette:pal1color},0,0).flip();
   g.clear();
}
// rotation
var rx = 0, ry = 0;

// Draw the cube at rotation rx and ry
function draw() {
  // precalculate sin&cos for rotations
  var rcx=Math.cos(rx), rsx=Math.sin(rx);
  var rcy=Math.cos(ry), rsy=Math.sin(ry);
  // Project 3D into 2D
  function p(x,y,z) {
    var t;
    t = x*rcy + z*rsy;
    z = z*rcy - x*rsy;
    x=t;
    t = y*rcx + z*rsx;
    z = z*rcx - y*rsx;
    y=t;
    z += 4;
    return [40 + 40*x/z, 40 + 40*y/z];
  }

  var a,b;
  // -z
  a = p(-1,-1,-1);
  b = p(1,-1,-1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(1,1,-1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  b = p(-1,1,-1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(-1,-1,-1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  // z
  a = p(-1,-1,1);
  b = p(1,-1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(1,1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  b = p(-1,1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(-1,-1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  // edges
  a = p(-1,-1,-1);
  b = p(-1,-1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(1,-1,-1);
  b = p(1,-1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(1,1,-1);
  b = p(1,1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
  a = p(-1,1,-1);
  b = p(-1,1,1);
  g.drawLine(a[0],a[1],b[0],b[1]);
}

function step() {
  rx += 0.1;
  ry += 0.1;
  draw();
  flip();
}

var iRef;
var started = false;
setWatch(()=>
   {
      if (!started){
      iRef = setInterval(step,200);
      started = true;
      } else {
         if(iRef) clearInterval(iRef);
         started = false;
      }
   },M5C.BTNA,{repeat:true,edge:-1,debounce:200});
   