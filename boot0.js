// Inital boot file for M5Stick-C


I2C1.setup({scl:22,sda:21,bitrate:400000});

function initAXP192(){
    function Write1Byte(a,d) { I2C1.writeTo(0x34,a,d);}
    // Set LDO2 & LDO3(TFT_LED & TFT) 3.0V
    Write1Byte(0x28, 0xcc);  
    // Set ADC to All Enable
    Write1Byte(0x82, 0xff);
    // Bat charge voltage to 4.2, Current 100MA
    Write1Byte(0x33, 0xc0);
    // Enable Bat,ACIN,VBUS,APS adc
    Write1Byte(0x82, 0xff);
    // Enable Ext, LDO3, DCDC1
    // Close DCDC2 output
    // with out LD02 LCD light it is 0x49 
    Write1Byte(0x12, 0x49);        
    // 128ms power on, 4s power off
    Write1Byte(0x36, 0x0C);
    // Set RTC voltage to 3.3V
    Write1Byte(0x91, 0xF0); 
    // Set GPIO0 to LDO
    Write1Byte(0x90, 0x02);
    // Disable vbus hold limit
    Write1Byte(0x30, 0x80);
    // Set temperature protection
    Write1Byte(0x39, 0xfc);
    // Enable RTC BAT charge 
    Write1Byte(0x35, 0xa2);
    // Enable bat detection
    Write1Byte(0x32, 0x46);
}

global.M5C = {
    BTNA: D37,
    BTNB: D39,
    LED: D10,
    IR: D9,
    backlight:(state) => {
        I2C1.writeTo(0x34, 0x12);
        var buf = I2C1.readFrom(0x34, 0x12, 1)[0];
        if (state)
            I2C1.writeTo(0x34, 0x12, buf | 0x04);
        else
            I2C1.writeTo(0x34, 0x12, buf & ~0x04);
    },
    brightness:(b) => {
       b = b>12?12:b;
       I2C1.writeTo(0x34, 0x28);
       var buf = I2C1.readFrom(0x34, 0x28, 1)[0];
       I2C1.writeTo(0x34, 0x28 , ((buf & 0x0f) | (b << 4)) );
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
    }
}

initAXP192();

if (require("Storage").read("lcd.js")){
  eval(require("Storage").read("lcd.js"));
}






