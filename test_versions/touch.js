I2C2.setup({scl:32,sda:23,bitrate:400000});

var TOUCH_PIN = D38;

var FT5206 = {
    _data: new Uint8Array(16),
    writeByte:(a,d) => { 
        I2C2.writeTo(0x35,a,d);
    }, 
    readBytes:(a,n) => {
        I2C2.writeTo(0x38, a);
        return I2C2.readFrom(0x38,n); 
    },
    threshold:(v) => {
        FT5206.writeByte(0x80,v);
    },
    touched:()=>{
        var b = FT5206.readBytes(0x02,1)[0];
        return b>2?0:b;
    },
    getXY:()=>{
        this._data = FT5206readBytes(0x00,16);
        var t = this._data[2];
        if (t>2 || t==0) return;
        return { x:((this._data[3]&0x0F)<<8)|this._data[4],
                 y:((this._data[5]&0x0F)<<8)|this._data[6]
               };
    },
    sleep:()=>{writeByte(0x87,0x03);},
    monitor:()=>{writeByte(0x87,0x01);}
};