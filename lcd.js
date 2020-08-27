/* 
Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission.
Modified by Juergen Skrotzky alias Jorgen (JorgenVikingGod@gmail.com)
Updated for use in M5StickC by Jeff Magee
 */

function ST7735S(colorPalette) {
    var LCD_WIDTH = 80;
    var LCD_HEIGHT = 160;
    var YOFF = 26;
    var XOFF = 1;
    var INV = 1;

    function dispinit(spi, dc, ce, rst, callback) {
        function cmd(c,d) {
            dc.reset();
            spi.write(c, ce);
            if (d!==undefined) {
                dc.set();
                spi.write(d, ce);
            }
        }

        if (rst) {
            digitalPulse(rst,0,10);
        } else {
            cmd(0x01); //ST7735_SWRESET: Software reset, 0 args, w/delay: 150 ms delay
        }
        setTimeout(function() {
            cmd(0x11); //ST7735_SLPOUT: Out of sleep mode, 0 args, w/delay: 500 ms delay
            setTimeout(function() {
                cmd(0xB1,[0x01,0x2C,0x2D]); //ST7735_FRMCTR1: Set Frame rate ctrl - normal mode, 3 args: (Rate = fosc/(1x2+40) * (LINE+2C+2D))
                cmd(0xB2,[0x01,0x2C,0x2D]); //ST7735_FRMCTR2: Set Frame rate control - idle mode, 3 args: Rate = fosc/(1x2+40) * (LINE+2C+2D)
                cmd(0xB3,[0x01,0x2C,0x2D,0x01,0x2C,0x2D]); //ST7735_FRMCTR3: Set Frame rate ctrl - partial mode, 6 args: Dot inversion mode + Line inversion mode
                cmd(0xB4,0x07); // ST7735_INVCTR: Set Display inversion ctrl, 1 arg, no delay: No inversion
                cmd(0xC0,[0xA2,0x02,0x84]); //ST7735_PWCTR1: Set Power control, 3 args, no delay: init + -4.6V + AUTO mode
                cmd(0xC1,0xC5); //ST7735_PWCTR2: Set Power control, 1 arg, no delay: VGH25 = 2.4C VGSEL = -10 VGH = 3 * AVDD
                cmd(0xC2,[0x0A,0x00]); //ST7735_PWCTR3: Set Power control, 2 args, no delay: Opamp current small + Boost frequency
                cmd(0xC3,[0x8A,0x2A]); //ST7735_PWCTR4: Set Power control, 2 args, no delay: BCLK/2, Opamp current small & Medium low
                cmd(0xC4,[0x8A,0xEE]); //ST7735_PWCTR5: Set Power control, 2 args, no delay:
                cmd(0xC5,0x0E); //ST7735_VMCTR1: Set Power control, 1 arg, no delay:
                cmd(0x20+INV,0x00); //ST7735_INVON: Don't invert display, no args, no delay
                cmd(0x36,0xC8); //ST7735_MADCTL: Set Memory access control (directions), 1 arg: row addr/col addr, bottom to top refresh
                cmd(0x3A,0x05); //ST7735_COLMOD: Set color mode, 1 arg, no delay: 16-bit color
                cmd(0x2A,[0x00,0x00,0x00,LCD_WIDTH-1]); //ST7735_CASET: Set Column addr set, 4 args, no delay: XSTART = 0 + XEND = 127
                cmd(0x2B,[0x00,0x00,0x00,LCD_HEIGHT-1]); //ST7735_RASET: Set Row addr set, 4 args, no delay: XSTART = 0 + XEND = 127
                cmd(0xE0,[0x02,0x1c,0x07,0x12,0x37,0x32,0x29,0x2d,0x29,0x25,0x2B,0x39,0x00,0x01,0x03,0x10]); //ST7735_GMCTRP1: color and gamma correction
                cmd(0xE1,[0x03,0x1d,0x07,0x06,0x2E,0x2C,0x29,0x2D,0x2E,0x2E,0x37,0x3F,0x00,0x00,0x02,0x10]); //ST7735_GMCTRN1: color and gamma correction
                cmd(0x13); //ST7735_NORON: Set Normal display on, no args, w/delay: 10 ms delay
                cmd(0x29); //ST7735_DISPON: Set Main screen turn on, no args w/delay: 100 ms delay
                if (callback) callback();
            },10);
        } ,100);
    }

    function connect(options, callback) {
        var palette = options.palette, spi=options.spi, dc=options.dc, ce=options.cs, rst=options.rst;
        if (options.height) LCD_HEIGHT=options.height;
        var bits;
        if (palette.length>16) bits=8;
        else if (palette.length>4) bits=4;
        else if (palette.length>2) bits=2;
        else bits=1;
        var g = Graphics.createArrayBuffer(LCD_WIDTH, LCD_HEIGHT, bits, { msb:true });
        g.linebuf = new Uint16Array(LCD_WIDTH*16);
        g.myclear = function() {
            ce.reset();
            spi.write(0x2A,dc);
            spi.write(0,YOFF,0,LCD_WIDTH+YOFF-1);
            spi.write(0x2B,dc);
            spi.write(0,XOFF,0,LCD_HEIGHT+XOFF-1);
            spi.write(0x2C,dc);
            var lines = 16; // size of buffer to use for un-paletting
            for (var y=0;y<LCD_HEIGHT;y+=16) {
                spi.write(linebuf.buffer);
            }
            ce.set();
        };
        g.flip = function() {
            ce.reset();
            spi.write(0x2A,dc);
            spi.write(0,YOFF,0,LCD_WIDTH+YOFF-1);
            spi.write(0x2B,dc);
            spi.write(0,XOFF,0,LCD_HEIGHT+XOFF-1);
            spi.write(0x2C,dc);
            for (var y=0;y<LCD_HEIGHT;y+=16) {
                E.mapInPlace(new Uint8Array(g.buffer, y*LCD_WIDTH*bits/8, linebuf.length), linebuf, palette, bits);
                spi.write(linebuf.buffer);
            }
            ce.set();
        };
        dispinit(spi, dc, ce, rst, callback);
        return g;
    }

    //var spi = new SPI();
    SPI1.setup({sck:D13, mosi:D15, baud: 4000000});

    return connect({
        palette:colorPalette,
        spi:SPI1,
        dc:D23,
        cs:D5,
        rst:D18
        }, function() {
            g.clear();
            g.setRotation(3);
            g.setColor(3);
            g.drawString("Hello",10,10);
            g.setColor(2);
            g.setFontVector(20);
            g.drawString("M5C Espruino",10,30);
            g.flip();
    });
}

M5C.backlight(1);
var g = ST7735S(new Uint16Array([0, 0x03E0, 0x001F, 0xFFFF]));
