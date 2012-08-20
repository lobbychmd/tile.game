$.tg = {
    state: {},
    setup: function (mainCanvas, size) {
        $.tg.mainCanvas = mainCanvas;
        $.tg.size = size;
    },
    blockIndex: function (length, blockLength) {
        var r = parseInt(length / blockLength);
        return r * blockLength == length ? r - 1 : r;
    },
    canvasRange: function () {
        var Y = $.tg.realY($.tg.size.posY);
        var X = $.tg.size.posX;
        $('canvas.bg').removeClass('cover');
        //alert( X / canvasW);
        for (var i = $.tg.blockIndex(X, $.tg.size.canvasW); i <= $.tg.blockIndex(X + $.tg.size.scrW, $.tg.size.canvasW); i++)
            for (var j = $.tg.blockIndex(Y, $.tg.size.canvasH); j <= $.tg.blockIndex(Y + $.tg.size.scrH, $.tg.size.canvasH); j++) {
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
        if (x == undefined) x = canvas.attr('id').split('_')[1];
        if (y == undefined) y = canvas.attr('id').split('_')[2];
        var translate = 'translate(' + (x * $.tg.size.canvasW - $.tg.size.posX) + 'px, ' + (y * $.tg.size.canvasH - $.tg.realY($.tg.size.posY)) + 'px)';
        canvas.css('-webkit-transform', translate);
        canvas.css('-moz-transform', translate);
    },

    createBG: function () {
        //var j = 0;
        //创建所有canvas
        for (j = 0; j <= $.tg.blockIndex($.tg.size.bgH, $.tg.size.canvasH); j++)
            for (i = 0; i <= $.tg.blockIndex($.tg.size.bgW, $.tg.size.canvasW); i++) {
                var canvas = $("<canvas class='bg'></canvas>").attr('width', $.tg.size.canvasW + "px").attr('height', $.tg.size.canvasH + 'px')
                        .appendTo('#mainSence').attr('id', "bg_" + i + "_" + j).attr('x', i).attr('y', j);
            }
    },

    keyboardInit: function () {
        $('body').keydown(function (event) {
            var pos = { 38: [0, 2], 37: [-2, 0], 39: [2, 0], 40: [0, -2] };
            var p = pos[event.which];
            if (p) {
                if (p[0] > 0) {  //右移
                    $.tg.size.carX += p[0];
                    if (($.tg.size.carX + 48) > $.tg.size.scrW) {
                        $.tg.size.carX = $.tg.size.scrW - 48;
                        $.tg.size.posX += p[0];
                        if (($.tg.size.posX + $.tg.size.scrW) > $.tg.size.bgW) $.tg.size.posX = $.tg.size.bgW - $.tg.size.scrW;
                    }
                } else if (p[0] < 0) {  //左移
                    $.tg.size.carX += p[0];
                    if ($.tg.size.carX < 0) {
                        $.tg.size.carX = 0;
                        $.tg.size.posX += p[0];
                        if ($.tg.size.posX < 0) $.tg.size.posX = 0;
                    }
                } else if (p[1] > 0) {  //上移 
                    $.tg.size.carY += p[1];
                    var Y = $.tg.realY($.tg.size.carY, $.tg.size.scrH, 48);
                    if (Y < 0) {
                        $.tg.size.carY = $.tg.size.scrH - 48;
                        $.tg.size.posY += p[1];
                        var YY = $.tg.realY($.tg.size.posY);
                        if (YY < 0) $.tg.size.posY = $.tg.size.bgH - $.tg.size.scrH;
                    }
                } else if (p[1] < 0) {  //下移
                    $.tg.size.carY += p[1];
                    var Y = $.tg.realY($.tg.size.carY, $.tg.size.scrH, 48);
                    if ((Y + 48) > $.tg.size.scrH) {
                        $.tg.size.carY = 0;
                        $.tg.size.posY += p[1];
                        var YY = $.tg.realY($.tg.size.posY);
                        if ((YY + $.tg.size.scrH) > $.tg.size.bgH) $.tg.size.posY = 0;
                    }
                }
                $.tg.moveBg();
                $.tg.updateFgState();
                $.tg.drawFg();
                return false;
            }

        });
    },
    realY: function (y, bg_H, scr_H) {
        return (bg_H ? bg_H : $.tg.size.bgH) - y - (scr_H ? scr_H : $.tg.size.scrH);
    },

    moveBg: function () {
        $.tg.canvasRange();
        $('canvas.bg.cover').each(function () {
            $.tg.fillBG($(this)[0]);
            $.tg.calcTranslate($(this));
        });
        $('canvas.bg').each(function () {
            //calcTranslate($(this));
        });
    },

    updateFgState: function () {
        var X = $.tg.size.tankX - $.tg.size.posX;
        var Y = $.tg.realY($.tg.size.tankY - $.tg.size.posY, $.tg.size.scrH, 32);
        if ((X > 0) && (Y > 0) && (X < $.tg.size.scrW - 32) && (Y < $.tg.size.scrH - 32)) {
            if (!$.tg.state['tank']) {
                $.tg.state['tank'] = { highlight: true, x: X, y: Y, timeOffset: 0, fireIdx: 1 };
                $.tg.state['bullet1'] = { fire: true, x: X, y: Y, timeOffset: 0, angel: Math.tan(($.tg.realY($.tg.size.carY, $.tg.size.scrH, 48) - Y) / ($.tg.size.carX - X)) };
            }
            else {
                $.tg.state['tank'].x = X;
                $.tg.state['tank'].y = Y;
                if ($.tg.state['tank'].timeOffset == 5) {
                    $.tg.state['tank'].timeOffset = 0;
                    $.tg.state['tank'].fireIdx++;
                    $.tg.state['bullet' + $.tg.state['tank'].fireIdx] = { fire: true, x: X, y: Y, timeOffset: 0, angel: Math.tan(($.tg.realY($.tg.size.carY, $.tg.size.scrH, 48) - Y) / ($.tg.size.carX - X)) };
                } else $.tg.state['tank'].timeOffset++;
            }

        } else if ($.tg.state['tank']) delete $.tg.state['tank'];

        for (var i in $.tg.state) {
            if ($.tg.state[i].fire) {
                $.tg.state[i].timeOffset++;
                $.tg.state[i].x = $.tg.state[i].x + ($.tg.state[i].timeOffset * 1) * Math.cos($.tg.state[i].angel);
                $.tg.state[i].y = $.tg.state[i].y + ($.tg.state[i].timeOffset * 1) * Math.sin($.tg.state[i].angel);
            }
            if (($.tg.state[i].x > 0) && ($.tg.state[i].y > 0) && ($.tg.state[i].x < $.tg.size.scrW - 32) && ($.tg.state[i].y < $.tg.size.scrH - 32)) { }
            else { delete $.tg.state[i]; }
        }

        if (!$.tg.state['car1'])
            $.tg.state['car1'] = { src: '/content/images/moon_bus.PNG', x: $.tg.size.carX, y: $.tg.realY($.tg.size.carY, $.tg.size.scrH, 48) };
        else {
            $.tg.state['car1'].x = $.tg.size.carX; $.tg.state['car1'].y = $.tg.realY($.tg.size.carY, $.tg.size.scrH, 48);
        }

        //console.log($.tg.state);
    },

    drawFg: function () {
        var ctx = $.tg.mainCanvas.getContext('2d');
        ctx.clearRect(0, 0, $.tg.size.scrW, $.tg.size.scrH);
        for (var s in $.tg.state) {
            var ss = $.tg.state[s];
            if (ss.src) {
                var img = new Image();
                img.src = ss.src;
                img.onload = function () {
                    ctx.drawImage(img, ss.x, ss.y);
                }
            } else if (ss.highlight) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = "blue";
                if ((ss.x > 0) && (ss.y > 0) && (ss.x < $.tg.size.scrW - 32) && (ss.x < $.tg.size.scrH - 32))
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
    run: function () {
        var main = setInterval(function () {
            //            for (var s in $.tg.state) {
            //                var ss = $.tg.state[s];
            //                if (ss.fire) {
            //                    ss.timeOffset = ss.timeOffset + 1;
            //                    //if (ss.timeOffset > 5) ss.timeOffset = 0;
            //                }
            //            }
            $.tg.updateFgState();
            $.tg.drawFg();
        }, 500);
        $.tg.createBG();
        $.tg.moveBg();
        $.tg.keyboardInit();
        $.tg.updateFgState();
    }
}