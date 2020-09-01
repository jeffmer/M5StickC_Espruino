// Inital boot file for M5Stick-C


I2C1.setup({scl:22,sda:21,bitrate:400000});

var AXP192 = {
    writeByte:(a,d) => { 
        I2C1.writeTo(0x34,a,d);
    },
    readByte:(a) => {
        I2C1.writeTo(0x34, a);
        return I2C1.readFrom(0x34,1)[0]; 
    },
    backlight:(state) => {
        var buf = AXP192.readByte(0x12);
        AXP192.writeByte(0x12, state?(buf | 0x04):(buf & ~0x04));
    },
    brightness:(b) => {
       b = b<0?0:b>1?1:b;
       b = Math.floor(b*10)+2;
       var buf = AXP192.readByte(0x28);
       AXP192.writeByte(0x28 , ((buf & 0x0f) | (b << 4)) );
    },
    deepSleep:(usec,pin)=>{
        AXP192.writeByte(0x31 , AXP192.readByte(0x31) | ( 1 << 3));
        AXP192.writeByte(0x90 , AXP192.readByte(0x90) | 0x07);
        AXP192.writeByte(0x82, 0x00);
        AXP192.writeByte(0x12, AXP192.readByte(0x12) & 0xA1);
        ESP32.deepSleep(usec,pin);
    },
    batV:() => {
        I2C1.writeTo(0x34,0x78);
        var d = I2C1.readFrom(0x34,2);
        var v = d[0]*16+d[1];
        const ADCLSB = 1.1 / 1000.0;
        return v * ADCLSB;
    },
    batA:() => {
        function read13(a){
            I2C1.writeTo(0x34,a);
            var d = I2C1.readFrom(0x34,2);
            return d[0]*32+d[1];
        }
        // current in - current out (ma);
        return ( read13(0x7A)-read13(0x7C))/2;
    },
    init:()=>{
        // Set LDO2 & LDO3(TFT_LED & TFT) 3.0V
        AXP192.writeByte(0x28, 0xcc);  
        // Set ADC to All Enable
        AXP192.writeByte(0x82, 0xff);
        // Bat charge voltage to 4.2, Current 100MA
        AXP192.writeByte(0x33, 0xc0);
        // Enable Bat,ACIN,VBUS,APS adc
        AXP192.writeByte(0x82, 0xff);
        // Enable Ext, LDO3, DCDC1
        // Close DCDC2 output
        // with out LD02 LCD light it is 0x49 
        AXP192.writeByte(0x12, 0x49);        
        // 128ms power on, 4s power off
        AXP192.writeByte(0x36, 0x0C);
        // Set RTC voltage to 3.3V
        AXP192.writeByte(0x91, 0xF0); 
        // Set GPIO0 to LDO
        AXP192.writeByte(0x90, 0x02);
        // Disable vbus hold limit
        AXP192.writeByte(0x30, 0x80);
        // Set temperature protection
        AXP192.writeByte(0x39, 0xfc);
        // Enable RTC BAT charge 
        AXP192.writeByte(0x35, 0xa2);
        // Enable bat detection
        AXP192.writeByte(0x32, 0x46);
    }
}

global.M5C = {
    BTNA: D37,
    BTNB: D39,
    LED: D10,
    IR: D9,
    backlight:AXP192.backlight,
    brightness:AXP192.brightness,
    batV:AXP192.batV,
    batA:AXP192.batA,
    deepSleep:AXP192.deepSleep
}

AXP192.init();

if (require("Storage").read("rtc.js")){
    eval(require("Storage").read("rtc.js"));
    var rtc = RTC();
    rtc.setSYS(); //set systemclock from Real-Time Clock;
}

if (require("Storage").read("lcd.js")){
    eval(require("Storage").read("lcd.js"));
    
    M5C.brightness(0.8);
    var lcd = ST7735S();
    
    setTimeout(() => {
        lcd.setRotation(3);
        lcd.setColor(0xFFFF);
        lcd.setFont("6x8");
        lcd.drawString("M5Stick-C Espruino",25,30);
        var d = new Date();
        lcd.drawString(d.toString().substr(0,15),25,40);
        M5C.backlight(1);
        if (M5C.BTNB.read()){
            if (require("Storage").read("app.js"))
                eval(require("Storage").read("app.js"));
        } else {
            setInterval(()=>{
                var d = new Date();
                lcd.drawString(d.toString().split(" ")[4],110,0,true);
                lcd.drawString(M5C.batV().toFixed(1)+"V",130,70,true);
                lcd.drawString(M5C.batA().toFixed(1)+"ma   ",0,70,true);              
            },1000);
        }     
    },200);
}






