function TileGame(mainCanvas, size){
    this.mainCanvas = mainCanvas;
    this.size = size;
    this.state = {};
}

TileGame.prototype = {
    constructor: TileGame,
    blockIndex: function (length, blockLength) {
        var r = parseInt(length / blockLength);
        return r * blockLength == length ? r - 1 : r;
    },
    canvasRange: function () {
        var Y = this.realY(this.size.posY);
        var X = this.size.posX;
        $('canvas.bg').removeClass('cover');
        //alert( X / canvasW);
        for (var i = this.blockIndex(X, this.size.canvasW); i <= this.blockIndex(X + this.size.scrW, this.size.canvasW); i++)
            for (var j = this.blockIndex(Y, this.size.canvasH); j <= this.blockIndex(Y + this.size.scrH, this.size.canvasH); j++) {
                $('#bg_' + i + "_" + j).addClass('cover');
            }
    },

    fillBG: function (canvas) {
        if (!$(canvas).attr('filled')) {
            $(canvas).attr('filled', true);
            var img = new Image();
            img.onload = function () {
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
            }
            x = parseInt($(canvas).attr('x'));
            y = parseInt($(canvas).attr('y'));
            var index = y * 4 + x + 1;
            if (index < 10) index = "0" + index; else index = index.toString();
            //alert(index);
            img.src = '/images/game/Jacal_stage-1_' + index + '.png';
        }
    },

    //设定背景 css的 偏移
    calcTranslate: function (canvas, x, y) {
        //alert(this.size);
        if (x == undefined) x = canvas.attr('id').split('_')[1];
        if (y == undefined) y = canvas.attr('id').split('_')[2];
        var translate = 'translate(' + (x * this.size.canvasW - this.size.posX) + 'px, ' + (y * this.size.canvasH - this.realY(this.size.posY)) + 'px)';
        canvas.css('-webkit-transform', translate);
        canvas.css('-moz-transform', translate);
    },

    createBG: function () {
        //var j = 0;
        //创建所有canvas
        for (j = 0; j <= this.blockIndex(this.size.bgH, this.size.canvasH); j++)
            for (i = 0; i <= this.blockIndex(this.size.bgW, this.size.canvasW); i++) {
                var canvas = $("<canvas class='bg'></canvas>").attr('width', this.size.canvasW + "px").attr('height', this.size.canvasH + 'px')
                        .appendTo('#mainSence').attr('id', "bg_" + i + "_" + j).attr('x', i).attr('y', j);
            }
    },

    keyboardInit: function () {
        var size = this.size;
        var game = this;
        $('body').keydown(function (event) {
            var pos = { 38: [0, 2], 37: [-2, 0], 39: [2, 0], 40: [0, -2] };
            var p = pos[event.which];
            if (p) {
                if (p[0] > 0) {  //右移
                    size.carX += p[0];
                    if ((size.carX + 48) > size.scrW) {
                        size.carX = size.scrW - 48;
                        size.posX += p[0];
                        if ((size.posX + size.scrW) > size.bgW) size.posX = size.bgW - size.scrW;
                    }
                } else if (p[0] < 0) {  //左移
                    size.carX += p[0];
                    if (size.carX < 0) {
                        size.carX = 0;
                        size.posX += p[0];
                        if (size.posX < 0) size.posX = 0;
                    }
                } else if (p[1] > 0) {  //上移 
                    size.carY += p[1];
                    var Y = game.realY(size.carY, size.scrH, 48);
                    if (Y < 0) {
                        size.carY = size.scrH - 48;
                        size.posY += p[1];
                        var YY = game.realY(size.posY);
                        if (YY < 0) size.posY = size.bgH - size.scrH;
                    }
                } else if (p[1] < 0) {  //下移
                    size.carY += p[1];
                    var Y = game.realY(size.carY, size.scrH, 48);
                    if ((Y + 48) > size.scrH) {
                        size.carY = 0;
                        size.posY += p[1];
                        var YY = game.realY(size.posY);
                        if ((YY + size.scrH) > size.bgH) size.posY = 0;
                    }
                }
                game.moveBg();
                game.updateFgState();
                game.drawFg();
                return false;
            }

        });
    },
    realY: function (y, bg_H, scr_H) {
        return (bg_H ? bg_H : this.size.bgH) - y - (scr_H ? scr_H : this.size.scrH);
    },

    moveBg: function () {
        this.canvasRange();
        var game = this;
        var bg = $('canvas.bg.cover').toArray();
        for (var i in bg) {
            this.fillBG(bg[i]);
            //alert(this.size);
            this.calcTranslate($(bg[i]));
        }
        $('canvas.bg').each(function () {
            //calcTranslate($(this));
        });
    },

    updateFgState: function () {
        var X = this.size.tankX - this.size.posX;
        var Y = this.realY(this.size.tankY - this.size.posY, this.size.scrH, 32);
        if ((X > 0) && (Y > 0) && (X < this.size.scrW - 32) && (Y < this.size.scrH - 32)) {
            if (!this.state['tank']) {
                this.state['tank'] = { highlight: true, x: X, y: Y, timeOffset: 0, fireIdx: 1 };
                this.state['bullet1'] = { fire: true, x: X, y: Y, timeOffset: 0, angel: Math.tan((this.realY(this.size.carY, this.size.scrH, 48) - Y) / (this.size.carX - X)) };
            }
            else {
                this.state['tank'].x = X;
                this.state['tank'].y = Y;
                if (this.state['tank'].timeOffset == 5) {
                    this.state['tank'].timeOffset = 0;
                    this.state['tank'].fireIdx++;
                    this.state['bullet' + this.state['tank'].fireIdx] = { fire: true, x: X, y: Y, timeOffset: 0, angel: Math.tan((this.realY(this.size.carY, this.size.scrH, 48) - Y) / (this.size.carX - X)) };
                } else this.state['tank'].timeOffset++;
            }

        } else if (this.state['tank']) delete this.state['tank'];

        for (var i in this.state) {
            if (this.state[i].fire) {
                this.state[i].timeOffset++;
                this.state[i].x = this.state[i].x + (this.state[i].timeOffset * 1) * Math.cos(this.state[i].angel);
                this.state[i].y = this.state[i].y + (this.state[i].timeOffset * 1) * Math.sin(this.state[i].angel);
            }
            if ((this.state[i].x > 0) && (this.state[i].y > 0) && (this.state[i].x < this.size.scrW - 32) && (this.state[i].y < this.size.scrH - 32)) { }
            else { delete this.state[i]; }
        }

        if (!this.state['car1'])
            this.state['car1'] = { src: '/images/moon_bus.PNG', x: this.size.carX, y: this.realY(this.size.carY, this.size.scrH, 48) };
        else {
            this.state['car1'].x = this.size.carX; this.state['car1'].y = this.realY(this.size.carY, this.size.scrH, 48);
        }

        //console.log(this.state);
    },

    drawFg: function () {
        var ctx = this.mainCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.size.scrW, this.size.scrH);
        for (var s in this.state) {
            var ss = this.state[s];
            if (ss.src) {
                var img = new Image();
                img.src = ss.src;
                img.onload = function () {
                    ctx.drawImage(img, ss.x, ss.y);
                }
            } else if (ss.highlight) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = "blue";
                if ((ss.x > 0) && (ss.y > 0) && (ss.x < this.size.scrW - 32) && (ss.x < this.size.scrH - 32))
                    ctx.strokeRect(ss.x, ss.y, 32, 32);
            } else if (ss.fire) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#333";
                //$('input').val(ss.angel);
                ctx.beginPath();
                //ctx.arc(ss.x + 16 + (ss.timeOffset * 5) * Math.cos(ss.angel), ss.y + 16 + (ss.timeOffset * 5) * Math.sin(ss.angel), 3, 0, Math.PI * 2, true);
                ctx.arc(ss.x, ss.y, 3, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.stroke();
            }
        }
    },

    main: function () {
        //            for (var s in this.state) {
        //                var ss = this.state[s];
        //                if (ss.fire) {
        //                    ss.timeOffset = ss.timeOffset + 1;
        //                    //if (ss.timeOffset > 5) ss.timeOffset = 0;
        //                }
        //            }
        this.updateFgState();
        this.drawFg();
    },
    run: function () {
        game = this;
        setInterval("game.main()", 500);
        this.createBG();
        this.moveBg();
        this.keyboardInit();
        this.updateFgState();
    }
}