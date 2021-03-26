var cow_skin_frames = cc.Class({
    name: "cow_skin_frames",
    properties: {
        cow_sprite_frames: {
            type: cc.SpriteFrame,
            default: [],
        },
    },
});

cc.Class({
    extends: cc.Component,

    properties: {
        // 牛皮肤集合
        cow_skin_set: {
            type: cow_skin_frames,
            default: [],
        },
        // 牛奔跑的最慢速度，初始为200
        cow_speed_min: 200,
        // 牛奔跑的最快速度，初始为300
        cow_speed_max: 300,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.component_frame_cowRun = this.node.getChildByName("Background").addComponent("frame_cowRun");
        
        // 随机选择一种牛的皮肤
        this.cow_type = Math.floor(Math.random() * 3 + 1);
        // console.log("cow_type: " + this.cow_type);

        // 设置牛奔跑动画帧集合
        this._set_sprite_frames();

        // 设置牛奔跑速度参数
        this.cow_speed_final = -(this.cow_speed_min + Math.random() * (this.cow_speed_max - this.cow_speed_min));
        // console.log("cow_speed_final: " + this.cow_speed_final);
        // 设置判断牛跑出界面的x值
        this.runOut_x = -510;
    },

    // 设置牛奔跑动画帧集合函数
    _set_sprite_frames: function() {
        this.component_frame_cowRun.sprite_frames = this.cow_skin_set[this.cow_type - 1].cow_sprite_frames;
        this.component_frame_cowRun.duration = 0.2;
        this.component_frame_cowRun.change_func_play_loop();    // 循环播放
    },

    start () {
        
    },

    update (dt) {
        // 移动
        var distance = this.cow_speed_final * dt;
        this.node.x += distance;
        // 跑出界面后移除
        if(this.node.x <= this.runOut_x) {
            this.node.removeFromParent();
        }
    },
});
