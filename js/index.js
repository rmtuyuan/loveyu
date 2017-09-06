game = {
    /**
     * cxt1 画布1在上 大鱼 小鱼 特效 浮动物品
     * cxt2 画布1在下 背景、海葵、果实、
     * cWidth 画布宽度
     * cHeight 画布高度
     * bgPic 背景图片
     * mx my 鼠标的在画布中移动的时候的 坐标
     * startTime 开始时间 用来记录 deltaTime
     * deltaTime 绘制间隔 变化的
     */
    cxt1: '',
    cxt2: '',
    cWidth: 0,
    cHeight: 0,
    bgPic:new Image(),
    startTime: Date.now(),
    deltaTime: 0,
    mx: 0,
    my: 0,
    /**
     * 初始化变量
     */
    init: function() {
        var can1 = document.getElementById('canvasOne');
        var can2 = document.getElementById('canvasTwo');
        this.cWidth = can1.offsetWidth;
        this.cHeight = can1.offsetHeight;
        this.mx = this.cWidth / 2 - 30;
        this.my = this.cHeight / 2;
        this.cxt1 = can1.getContext('2d');
        this.cxt2 = can2.getContext('2d');
        // 添加鼠标移动检测
        can1.addEventListener('mousemove',this.mouseMove,false)

        this.bgPic.src = './images/background.jpg';
        var that = this;
        this.bgPic.onload = function() {
            that.ane.init();
            that.fruit.init();
            that.mom.init();
            that.baby.init();
            that.floater.init();
            that.gloop();
        }
    },
    // 获取画布鼠标移动监测 （如果 game 已经结束 mx my 将不在更新）
    mouseMove: function(event) {
        if (game.data.gameOver) {
            return ;
        }
        game.mx = event.offSetX || event.layerX;
        game.my = event.offSetY || event.layerY;
    },
    /**
     * 游戏渲染
     */
    gloop: function() {
        // 更新 deltaTime 
        this.deltaTime = Date.now() - this.startTime;
        this.startTime = Date.now();
        this.deltaTime = Math.min(16, 20);
        // 画布2
        game.cxt2.clearRect(0, 0, game.cWidth, game.cHeight);
        game.drawBg();
        game.ane.darw();
        game.fruit.draw();
        // 画布1
        game.cxt1.clearRect(0, 0, game.cWidth, game.cHeight);
        // 判断碰撞
        game.momFruitCol();
        game.momBabyCol();
        game.floater.draw();
        game.mom.draw();
        game.baby.draw();
        game.wave.draw();
        game.data.draw();
        // 重复渲染
        window.requestAnimFrame(game.gloop);
    },
    /**
     * drawBg
     * 绘制背景
     */
    drawBg: function() {
        this.cxt2.drawImage(this.bgPic,0, 0, this.cWidth,this.cHeight);  
    },
    // 海葵
    ane: {
        /**
         * @parmas {Number} num 海葵数量
         * @parmas {Array} arr 海葵数组
         * @parmas {Nuber} 角度 海葵正弦摆弄所需角度
         */
        arr:[],
        num: 50,
        angle:0,
        /**
         * 初始化各个海葵的位置和长度
         */
        init: function(){
            var h = game.cHeight;
            var num = this.num;
            for (var index = 0; index < num; index++) {
                var rootx = index * 16 + Math.random() * 10
                var obj = {
                    rootx: rootx, // 海葵开始位置 x 坐标 ， Y坐标是 cheight
                    headx: rootx, // 海葵结束位置 x 坐标 
                    heady: h - 250 + Math.random() * 50, // 海葵结束位置 y 坐标 
                    amp: 50 + Math.random() * 50 // 振幅
                }
                this.arr.push(obj);
            }
        },
        /**
         * 绘制海葵
         */
        darw: function() {
            // 利用正切 和振幅获得 真正的结束点位置
            this.angle += game.deltaTime * 0.001;
            var l = Math.sin(this.angle);

            var context = game.cxt2;
            context.save(); 
            context.globalAlpha=0.6;
            context.lineWidth="20";
            context.strokeStyle='#3b154e';
            context.lineCap='round';
            var cHeight = game.cHeight;
            for (var index = 0; index < this.num; index++) {
                var ane = this.arr[index];
                context.beginPath();
                // 结束点x坐标
                ane['hx'] = ane.headx + l * ane.amp;
                // 贝塞尔曲线 开始点 控制点 结束点 
                context.moveTo(ane.rootx, cHeight);
                context.quadraticCurveTo(ane.rootx, cHeight - 150, ane.hx, ane.heady);
                context.stroke();
            }
            context.restore();
        }
    },
    // 果实
    fruit: {
        /**
         * @parmas {Number} num 屏幕中果实的最大数量
         * @parmas {Array} arr 果实数组
         * @parms  {Image()} orange / blue 两种不同的果实
         */
        arr: [],
        num: 3,
        orange: new Image(),
        blue: new Image(),
        /**
         * 初始化数据
         */
        init: function() {
            this.orange.src = './images/fruit.png';
            this.blue.src = './images/blue.png';
            var num = this.num;
            for(var i = 0 ; i < num; i ++) {
                this.add(i);
            }
        },
        /**
         * 绘制果实
         * 因为要居中 所以绘制的坐标要减去图片的一半
         */
        draw: function() {
            var context = game.cxt2;
            for (var index = 0,length = this.arr.length; index < length; index++) {
                var fruit = this.arr[index];
                // 果实成长阶段 
                if(fruit.l < this.orange.width) {
                    // x 随附着海葵摆动 宽度变大 
                    fruit.x = game.ane.arr[fruit.aneId].hx;
                    fruit.l += game.deltaTime *  fruit.speed;
                } else {
                    // 上升阶段
                    fruit.y -= game.deltaTime * fruit.speed * 3;  
                }
                if(fruit.imgType == 'blue') {
                    fruit['img'] = this.blue;
                } else {
                    fruit['img'] = this.orange;
                }
                context.drawImage(fruit.img, 
                    fruit.x - fruit.l / 2, 
                    fruit.y - fruit.l / 2,
                    fruit.l,
                    fruit.l
                );
                /**
                 * 判断边界 超出边界删除，然后在添加一个
                 */
                if(fruit.y < 10) {
                   this.dead(index);
                }
            }
        },
        /**
         * 添加果实
         */
        add: function(i) {
            var obj = {
                    x: 0, // x 坐标
                    y: 0, // y 坐标
                    l: 0, // 宽度
                    imgType: Math.random() < 0.3 ? 'blue' : 'orange', // 果实类型
                    speed: Math.random() * 0.07 + 0.02,  // [0.01, 0.07) // 生长和移动速度
                }
            this.arr.push(obj);
            this.find(i);
        },
        /**
         * 设置 果实的x , y 坐标 
         * 果实附着在海葵上，随机找一个海葵, 获得它的 结束点 坐标 就是成了果实的坐标
         * @param {Number} i 果实数组下标 
         */
        find: function(i) {
            var aneId = Math.floor(Math.random() * game.ane.num);
            this.arr[i]['aneId'] = aneId;
            var ane = game.ane.arr[aneId];
            this.arr[i].x = ane.rootx;
            this.arr[i].y = ane.heady;
        },
        /**
         * 消除 数组下标 删除之后在添加一个新的
         */
        dead: function(i){
             this.arr.splice(i, 1);
             this.add(this.arr.length);
        }
    },
    // 大鱼
    mom: {
        /**
         * @params {Number} x y坐标
         * @params angle 旋转角度
         * @params {Array } tailArr 尾巴图片数组 
         * @params {Number} tailIndex 当前尾巴图片下标 最大值 7
         * @params {Array } eyeArr 眼睛图片数组
         * @params {Number} eyeIndex 当前眼睛图片下标 最大值 1
         * @params {Array} bodyBlue / bodyOrange 两种身体图片数组 
         * @params {Number} bodyIndex 当前身体图片下标 最大值 7
         */
        x: 0,
        y: 0,
        angle: 20,
        tailArr: [],
        tailIndex: 0,
        eyeArr: [],
        eyeTimer: 1000,
        eyeIndex: 0,
        timer: 0,
        bodyBlue: [],
        bodyOrange: [],
        bodyIndex: 0,

        init: function() {
            this.x = game.cWidth / 2 - 30;
            this.y = game.cHeight / 2;
            for (var i = 0 ; i < 8 ; i ++ ) {
                this.tailArr[i] = new Image();
                this.tailArr[i].src = './images/bigTail' + i + '.png';
                this.bodyBlue[i] = new Image();
                this.bodyBlue[i].src = './images/bigSwimBlue' + i + '.png';
                this.bodyOrange[i] = new Image();
                this.bodyOrange[i].src = './images/bigSwim' + i + '.png';
            } 
            for (var i = 0 ; i < 2; i ++) {
                this.eyeArr[i] = new Image();
                this.eyeArr[i].src = './images/bigEye' + i + '.png';
            }
        },
        draw: function() {
            var context = game.cxt1;
            // 大鱼坐标变换
            if(game.data.start) {
                this.x = lerpDistance(game.mx, this.x, 0.97);
                this.y = lerpDistance(game.my, this.y, 0.97);
            }
            // 大鱼旋转变
            var deltaY = game.my - this.y;
            var deltaX = game.mx - this.x;
            var beta = Math.atan2(deltaY,deltaX) + Math.PI; // 2π-0;
            this.angle = lerpAngle(beta, this.angle, 0.6);
            // 尾巴切换每次加1  最大值为 7
            this.tailIndex = (this.tailIndex + 1) % 8;

            // 眨眼
            this.timer += game.deltaTime;
            if (this.timer > this.eyeTimer) {
                this.timer = 0;
                this.eyeIndex = (this.eyeIndex + 1) % 2;
                if( this.eyeIndex === 1) {
                    this.eyeTimer = 200;
                } else {
                    this.eyeTimer = 3000 + Math.random() * 1500;
                }
            }

            context.save();
            // 平移坐标 旋转
            context.translate(this.x, this.y);
            context.rotate(this.angle);

            var tail = this.tailArr[this.tailIndex];
            context.drawImage(tail, -tail.width / 2 + 23, -tail.height / 2);

            var body;
            if(game.data.double == 2) {
                body = this.bodyBlue[this.bodyIndex]; 
            } else {
                body = this.bodyOrange[this.bodyIndex];
            }
            context.drawImage(body, -body.width / 2, -body.height / 2);

            var eye = this.eyeArr[this.eyeIndex];
            context.drawImage(eye, -eye.width / 2, -eye.height / 2);
            context.restore();
        }
    },
    // 小鱼 几乎与大鱼相同
    baby: {
        /**
         * @params {Number} x x坐标
         * @params {number} y y坐标
         * @params angle 旋转角度
         * eye 眼睛 body 身体 tail 尾巴
         * @params tailArr 尾巴图片数组【0】 tailIndex 当前尾巴下标 0
         */
        x: 0,
        y: 0,
        angle: 0,
        bodyArr:[],
        bodyTimer: 0,
        bodyIndex: 0,

        tailArr: [],
        tailIndex: 0,

        eyeArr: [],
        eyeTimer: 1000,
        eyeIndex: 0,
        timer: 0,

        init: function() {
            this.x = game.cWidth / 2;
            this.y = game.cHeight / 2;
            for (var i = 0; i < 20; i++) {
                this.bodyArr[i] = new Image();
                this.bodyArr[i].src = './images/babyFade' + i + '.png';
            }
            for (var i = 0 ; i < 8 ; i ++ ) {
                this.tailArr[i] = new Image();
                this.tailArr[i].src = './images/babyTail' + i + '.png';
            }
            for (var i = 0 ; i < 2; i ++) {
                this.eyeArr[i] = new Image();
                this.eyeArr[i].src = './images/babyEye' + i + '.png';
            }
        },
        draw: function() {
            var context = game.cxt1;
            // 小鱼坐标变换
            if(game.data.start) {
                this.x = lerpDistance(game.mom.x, this.x, 0.97);
                this.y = lerpDistance(game.mom.y, this.y, 0.97);
            }

            // 小鱼旋转变
            var deltaY = game.mom.y - this.y;
            var deltaX = game.mom.x - this.x;
            var beta = Math.atan2(deltaY,deltaX) + Math.PI; // 2π-0;
            this.angle = lerpAngle(beta, this.angle, 0.6);

            // 尾巴切换每次加1 %8
            this.tailIndex = (this.tailIndex + 1) % 8;

            // 眨眼
            this.timer  += game.deltaTime;
            if (this.timer > this.eyeTimer) {
                this.timer = 0;
                this.eyeIndex = (this.eyeIndex + 1) % 2;
                if( this.eyeIndex === 1) {
                    this.eyeTimer = 200;
                } else {
                    this.eyeTimer = 3000 + Math.random() * 1500;
                }
            }
            // 身体变色 添加gameover 判断
            this.bodyTimer += game.deltaTime * 0.6;
            if(this.bodyTimer > 100 && !game.data.gameOver) {
                this.bodyTimer = 0;
                this.bodyIndex +=1;
                if(this.bodyIndex > 19) {
                    this.bodyIndex = 19;
                    game.data.gameOverfunc();
                }
            }

            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            var tail = this.tailArr[this.tailIndex];
            context.drawImage(tail, -tail.width / 2 + 23, -tail.height / 2);
            var body = this.bodyArr[this.bodyIndex];
            context.drawImage(body, -body.width / 2, -body.height / 2);
            var eye = this.eyeArr[this.eyeIndex];
            context.drawImage(eye, -eye.width / 2, -eye.height / 2);
            context.restore();
        }
    },
    // 特效 圆圈
    wave: {
        arr:[], // 数组
        draw: function () {
            var context = game.cxt1;
            context.save();
            context.lineWidth=2;
            context.shadowBlur = 10;
            for(var i = 0, len = this.arr.length; i < len; i++){
                var arc = this.arr[i];
                arc.r += game.deltaTime * 0.08;
                // 透明度与 与半径成反比
                var alpha = 1 -arc.r / arc.maxR;
                // 大于最大半径就删除 
                if( arc.r > arc.maxR ) {
                    this.devare(i);
                    break;
                }
                context.beginPath();
                context.strokeStyle = arc.color;
                context.shadowColor = arc.color;
                context.globalAlpha = alpha;
                // 画圆 一定要context.stroke();
                context.arc(arc.x, arc.y, arc.r, Math.PI * 2,false);
                context.stroke();
                context.closePath();
            }
            context.restore();
        },
        /**
         * 添加特效圆
         * @param {Number} x 位置 x 坐标 
         * @param {Number} y 位置 y 坐标 
         * @param {String} color 颜色
         * @param {Number} maxR 最大半径
         */
        add: function(x, y, color, maxR) {
            obj = {
                x: x, 
                y: y,
                r: 20, 
                color: color, 
                maxR: maxR, 
            }
            this.arr.push(obj);
        },
        /**
         * 删除特效 
         * @param {number} i 数组下标
         */
        devare: function(i) {

            this.arr.splice(i, 1);
        }
    },
    // 大鱼和果实之间的碰撞检测 game over 之后不碰撞
    momFruitCol: function() {
        if (this.data.gameOver) {
            return;
        }
        var arr = this.fruit.arr;
        for (var i = 0; i < arr.length; i++) {
            var col = calLength2(arr[i].x, arr[i].y, this.mom.x, this.mom.y);
            if (col < 900) {
                // 加分
                this.data.fruitNum ++;
                this.mom.bodyIndex ++;

                if(this.mom.bodyIndex > 7) {
                    this.mom.bodyIndex = 7
                }
                // 判断果实类型
                if(arr[i].imgType == 'blue') {
                    this.data.double = 2;
                } else {
                    this.data.double = 1;
                }
                // 添加碰撞特效 果实消失
                game.wave.add(arr[i].x, arr[i].y,"#fff",50);
                this.fruit.dead(i);
            }
        }
    },
    // 漂浮物
    floater: {
        /**
         * @parmas {Array} arr 漂浮物数组
         * @parmas {Number} num 漂浮物最大数量 30
         * @picArr {Array} picArr 漂浮物图片数组 最大数量 7
         */
        arr: [],
        num: 30,
        angle: 0,
        picArr: [],
        init: function() {
            var picArr = this.picArr;
            for(var i = 0 ; i < 7 ; i ++) {
                picArr[i] = new Image();
                picArr[i].src = './images/dust' + i + '.png';
            }
            var num = this.num;
            var cWidth = game.cWidth;
            var cHeight = game.cHeight;
            var arr = this.arr;
            for(var i = 0 ; i < num ; i ++ ) {
                var obj = {
                    x: Math.random() * cWidth,
                    y: Math.random() * cHeight,
                    amp: Math.random() * 25 + 20, // 振幅
                    img: picArr[Math.floor(Math.random() * 7)] // 随便找张图片
                };
                arr.push(obj);
            }
        },
        draw: function() {
            // 跟随海葵的摆动规律
            this.angle += game.deltaTime * 0.001;
            var l = Math.sin(this.angle);

            var context = game.cxt1;
            var num = this.num;
            context.save();
            for(var i = 0; i < num; i ++ ) {
                var obj =  this.arr[i];
                context.drawImage(obj.img, obj.x + l * obj.amp, obj.y);
            }
            context.restore();
        }
    },
    // 大鱼和小鱼的碰撞 游戏结束或者没有吃到果实是不能碰撞的
    momBabyCol: function() {
        if (this.data.gameOver || !this.data.fruitNum) {
            return;
        }
        var col = calLength2(this.mom.x, this.mom.y, this.baby.x, this.baby.y);
        if(col< 900) {
            // 加分 加特效
            this.wave.add(this.baby.x,this.baby.y,"#f60",100);
            this.data.addScore();
        }
    },
    // 分数相关
    data: {
        /**
         * @parmas {Number} fruitNum 吃到的果实数量 喂给小于后加分
         * @parmas {Number} double 判断是否是吃到了 绿色果实,吃到绿色后变成 2 （以后可以加判断 加分）
         * @parmas {Number} score 总分数
         * @parmas {Boolean} gameOver 游戏是否结束 true
         * @params {Number} globalAlpha 透明度 
         */
        fruitNum: 0,
        double: 1,
        score: 0,
        gameOver: true,
        start: false,
        globalAlpha: 0,
        draw: function() {
            var x = game.cWidth / 2;
            var y = game.cHeight;
            var context = game.cxt1;
            context.save();
            context.fillStyle='#fff';
            // context.fillText('num:' + this.fruitNum, x, y);
            // context.fillText('double:' + this.double, x, y + 30);
            context.font='20px sans-serif';
            context.textAlign='center';
            context.shadowBlur=10;
            context.shadowColor='#fff';
            context.globalAlpha = 1;
            context.fillText('score: ' + this.score, x, y - 30);
            if(this.gameOver && this.start) {
                this.globalAlpha += game.deltaTime * 0.002;
                if (this.globalAlpha > 1) {
                    this.globalAlpha = 1;
                    var btngroup = document.getElementsByClassName('btngroup')[0];
                    btngroup.style.display = 'block';
                }
                context.fillStyle='#f60';
                context.font='40px sans-serif';
                context.globalAlpha = this.globalAlpha;
                context.fillText('GAME OVER', x, game.cHeight / 2);
            }
            context.restore();
        },
        // 加分 回归初始值
        addScore: function() {
            game.baby.bodyIndex = 0;
            game.mom.bodyIndex = 0;
            this.double = 1;
            this.score += this.fruitNum * 100;
            this.fruitNum = 0;
        },
        startFuc: function() {
            this.start = true;
            this.gameOver = false;
            this.score = 0;
            this.fruitNum = 0;
            game.baby.bodyIndex = 0;
        },
        gameOverfunc: function() {
            this.gameOver = true;
            game.baby.bodyIndex = 0;
            game.mx = game.cWidth / 2;
            game.my = game.cHeight / 2;
        }
    }
},
dom = {
    startId: 'start',
    introduce: 'introduce',
    init: function() {
        var startDom = document.getElementById(this.startId);
        startDom.addEventListener('click',this.start,false);
        var introduce = document.getElementById(this.introduce);
        introduce.addEventListener('click',this.gameIntroduce,false);
        var close1 = document.getElementsByClassName('close')[0]; 
        close1.addEventListener('click',this.close,false);
    },
    start: function() {
        var btngroup = document.getElementsByClassName('btngroup')[0];
        btngroup.style.display = 'none';
        game.data.startFuc();
    },
    gameIntroduce: function() {
        var gameIntroduce = document.getElementsByClassName('gameIntroduce')[0];
        gameIntroduce.style.display = 'block';
    },
    close: function(event) {
        event.target.parentNode.parentNode.style.display = 'none';
    }
}
window.onload = function() {
    dom.init();
    game.init();
}