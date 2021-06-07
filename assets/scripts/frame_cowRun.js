
cc.Class({
    extends: cc.Component,

    properties: {
        // 牛奔跑动画帧集合
        sprite_frames: {
            type: cc.SpriteFrame,
            default: [],
        },
        // 牛奔跑动画帧的时间间隔
        frame_duration: 0.1,
        // 是否在组件加载时播放
        isPlayOnLoad: false,
        // 是否循环播放
        isLoop: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //console.log("onload函数调用")
        
        // 判断节点上是否拥有Sprite组件
        var component_sprite = this.node.getComponent(cc.Sprite);
        // 没有则添加Sprite组件，因为现实图片一定要有Sprite组件
        if(!component_sprite) {
            component_sprite = this.node.addComponent(cc.Sprite);
        }
        this.sprite = component_sprite;

        // 初始化
        this._init_();
        
        if(this.isPlayOnLoad) { //加载时播放
            this.sprite.spriteFrame = this.sprite_frames[0];
            if(this.isLoop) {   //循环播放
                this.change_func_play_loop();
            } else {    //播放一次
                this.change_func_play_once(null);
            }
        }

    },

    // 初始化函数
    _init_: function() {
        this.startPlaying = false;  // 是否启动播放
        this.startLoop = false;     // 是否启动循环播放 
        this.playTime = 0;          // 播放时长
        this.end_func = null;       // 结束回调函数
    },

    start () {
        this.playTime = 0;
    },

    update (dt) {
        // 不启动播放，不做处理
        if(this.startPlaying === false) {
            return;
        }

        // 累计播放时间
        this.playTime += dt;    

        // 计算时间，计算出应当播放第几帧，而不是随便播放下一帧
        // 否则的话，同样的动画, 有60帧，
        // 你在30FPS的机器上你会播放2秒，而在60FPS的机器上你会播放1秒，动画就不同步;
        var frames_index = Math.floor(this.playTime / this.frame_duration);
        if(this.startLoop === false) {  // 播放一次
            // 超出合理范围则结束播放
            if(frames_index >= this.sprite_frames.length) {
                // 显示最后一帧
                this.sprite.spriteFrame = this.sprite_frames[this.sprite_frames.length - 1];
                // 停止播放
                this.startPlaying = false;
                // 重置播放时间
                this.playTime = 0;
                // 调用回调函数
                if(this.end_func) {
                    this.end_func();
                }
                return;
            } else {
                // 修改动画帧
                this.sprite.spriteFrame = this.sprite_frames[frames_index];
            }
        } else {    // 循环播放
            // 超出合理范围则进行修正
            while(frames_index >= this.sprite_frames.length) {
                frames_index -= this.sprite_frames.length;
                this.playTime -= this.sprite_frames.length * this.frame_duration;
            }
            // 修改动画帧
            this.sprite.spriteFrame = this.sprite_frames[frames_index];
        }
    },

    // 修改变量函数（播放一次）
    change_func_play_once: function(end_func) {
        this.startPlaying = true;
        this.startLoop = false;
        this.playTime = 0;
        this.end_func = end_func;
    },

    // 修改变量函数（循环播放）
    change_func_play_loop: function() {
        this.startPlaying = true;
        this.startLoop = true;
        this.playTime = 0;
        this.end_func = null;
    },

    // 修改变量函数（停止播放）
    change_func_play_stop: function() {
        this.startPlaying = false;
        this.startLoop = false;
        this.playTime = 0;
        this.end_func = null;
    },

});
