// 组件类定义
cc.Class({
    // cc.Component：组件类的基类
    extends: cc.Component,

    properties: {
        // 套到牛的音乐
        music_niu: {
            type: cc.AudioClip,
            default: null,
        },
        // 绳子
        rope: {
            type: cc.Node,
            default: null,
        },
        // 套到牛的绳子
        ropeCow: {
            type: cc.SpriteFrame,
            default: [],
        },
        // 预制体（牛）
        prefab_cow: {
            type: cc.Prefab,
            default: null,
        },
        // 预制体（牛）的父节点
        node_cow_ALL: {
            type: cc.Node,
            default: null,
        },
        // 产生牛的最短相隔时间
        myTime_min: 3,
        // 产生牛的最长相隔时间
        myTime_max: 5,
        // 准备时间的字体
        label_ready: {
            type: cc.Label,
            default: null,
        },
        // 套牛倒计时的字体
        label_catchTime: {
            type: cc.Label,
            default: null,
        },
        // 套取到牛的数量的字体
        label_catchNum: {
            type: cc.Label,
            default: null,
        },
        // 游戏结束节点
        node_over_ALL: {
            type: cc.Node,
            default: null,
        },
        // 积分榜的字体
        label_jifenban: {
            type: cc.Label,
            default: null,
        },
        // 评语的富文本
        richText_comment: {
            type: cc.RichText,
            default: null,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 初始化
        this._init_();
    },

    // 初始化函数
    _init_: function() {
        // 背景音乐播放器
        this.bgMusicPlayer = cc.find("bgMusic").getComponent("game_bgMusicManager");
        // 设置绳子初始位置
        this.rope.x = 0;
        this.rope.y = -550;
        this.isThrowing = false;
        // 设置绳子类型
        this.component_sprite_rope = this.rope.getComponent(cc.Sprite);
        this.component_sprite_rope.spriteFrame = this.ropeCow[0];

        // 套牛倒计时60s
        this.catchTime = 60;
        // 套取到牛的数量
        this.catchNum = 0;
        // 设置catchTime字体内容
        this.label_catchTime.string = "" + this.catchTime;
        // 设置catchNum字体内容
        this.label_catchNum.string = "" + this.catchNum;

        // 设置预制体（牛）的初始化位置
        this.cow_position_x = 510;
        this.cow_position_y = -74;

        // 设置套取成功后牛应修正的y值
        this.catchSuccess_cow_y = 138;

        // 设置判定套取成功的x值范围
        this.catchSuccess_x_min = 55;
        this.catchSuccess_x_max = 161;
    },

    // 组件实例的start方法，在运行开始时调用
    start () {
        // this：当前组件实例，this.node：当前组件实例所在的节点

        // 游戏开始
        this.game_start();
    },

    // 组件实例的update方法，在每次刷新的时候调用，dt：距离上一次刷新的时间间隔
    // 主要用于编写变化逻辑
    // update (dt) {},

    // 绳子抛出的按钮回调函数
    on_throw_click: function() {
        if(this.isThrowing === false) {
            this.isThrowing = true;

            // 绳子移动action
            var rope_action_throw = cc.moveTo(0.5, cc.v2(0, 50));
            var rope_action_back = cc.moveTo(0.5, cc.v2(0, -550));

            // 判定函数
            var mid_func = cc.callFunc(function() {
                var result_catch_cow = this.judge_catch_cow();
                if(result_catch_cow) {
                    // console.log("catch success !");
                    // 播放套到牛的音乐
                    var audioID_niu = cc.audioEngine.play(this.music_niu, false, 0.5);
                    // 确定牛的类型
                    var ropeCow_type = result_catch_cow.getComponent("game_cowRun").cow_type;
                    // 更换绳子类型
                    this.component_sprite_rope.spriteFrame = this.ropeCow[ropeCow_type];
                    // 修正牛的位置
                    this.rope.y = this.catchSuccess_cow_y;
                    // 套取数量加1
                    this.catchNum++;
                    // 更新catchNum字体内容
                    this.label_catchNum.string = "" + this.catchNum;
                    // console.log("catchNum: " + this.label_catchNum.string);
                    // 套取成功则移除牛
                    result_catch_cow.removeFromParent();
                }
            }.bind(this), this);

            // 结束回调函数
            var end_func = cc.callFunc(function() {
                // console.log("this: "+this)
                // 修正参数
                this.isThrowing = false;
                this.component_sprite_rope.spriteFrame = this.ropeCow[0];
            }.bind(this), this)

            // 队列容器，按队列元素顺序执行动作
            var rope_sequence = cc.sequence([rope_action_throw, mid_func, rope_action_back, end_func]);

            // 执行动作
            this.rope.runAction(rope_sequence);
        }
    },

    // 检测是否套到牛的判断函数
    judge_catch_cow: function() {
        // 遍历父节点下所有的牛
        for(var i = 0; i < this.node_cow_ALL.childrenCount; i++) {
            var child_cow = this.node_cow_ALL.children[i];
            // 在绳套合理范围内则认为套取成功
            if(child_cow.x >= this.catchSuccess_x_min && child_cow.x <= this.catchSuccess_x_max) {
                return child_cow;
            }
        }
        return null;
    },

    // 游戏开始函数
    game_start: function() {
        // 倒计时准备
        this.label_ready.node.active = true;
        this.schedule(this.game_ready.bind(this), 1, 3, 1); 
        /*
            schedule函数说明：
            每隔1秒调度1次game_ready函数，第一次调度后重复再调度3次，在1秒之后才开始调度
            当最后一个参数是0时或没有第4个参数，计时器也不会马上调度函数，而是延迟x秒后调度（x指调度函数的间隔时间，即第2个参数）
            若想不延迟调度则将第4个参数设为0.1秒或更小的秒数
        */
    },

    // 游戏准备函数
    game_ready: function() {
        switch(this.label_ready.string) {
            case "准备": 
                this.label_ready.string = "3";
                break;
            case "3": 
                this.label_ready.string = "2";
                break;
            case "2": 
                this.label_ready.string = "1";
                break;
            case "1": 
                this.label_ready.string = "开始";
                this.scheduleOnce(this.game_ready.bind(this), 0.8);
                break;
            case "开始": 
                this.label_ready.string = "准备";    
                this.label_ready.node.active = false;
                // 取消调度准备
                this.unschedule(this.game_ready);
                // 正式开始游戏
                // 实例化预制体（牛）
                this.instantiate_one_cow();
                // 套牛倒计时开始
                this.scheduleOnce(this.time_count_down.bind(this), 1);
                break;
        }
    },

    // 实例化预制体（牛）函数
    instantiate_one_cow: function() {
        // 实例化
        var myCow = cc.instantiate(this.prefab_cow);

        // var com = myCow.getComponent("game_cowRun");
        // com.cow_speed_min = 100;
        // com.cow_speed_max = 200;

        // 添加到父节点中
        this.node_cow_ALL.addChild(myCow);
        // 预制体（牛）初始化位置
        myCow.x = this.cow_position_x;
        myCow.y = this.cow_position_y;

        // 设置产生牛的相隔时间参数
        var myTime_final = this.myTime_min + Math.random() * (this.myTime_max - this.myTime_min);
        // console.log("myTime_final: " + myTime_final);

        // 使用计时器不断产生牛
        this.scheduleOnce(this.instantiate_one_cow.bind(this), myTime_final);
    },

    // 套牛倒计时业务逻辑函数
    time_count_down: function() {
        // 时间减1秒
        this.catchTime--;
        // 更新catchNum字体内容
        this.label_catchTime.string = "" + this.catchTime;
        // console.log("catchTime: " + this.label_catchTime.string);

        // 时间结束
        if(this.catchTime <= 0) {
            this.unscheduleAllCallbacks();
            // 调度游戏结束函数
            this.game_over();
            return;
        }

        // 使用计时器进行套牛倒计时
        this.scheduleOnce(this.time_count_down.bind(this), 1);
    },

    // 游戏结束函数
    game_over: function() {
        // 设置积分
        this.label_jifenban.string = this.catchNum;
        // 设置评语
        var comment_str = "<color=#ffffff><b>"
        if(this.catchNum <= 3) {
            comment_str += "情场空手";
        } else if(this.catchNum <= 6) {
            comment_str += "情场新手";
        } else if(this.catchNum <= 10) {
            comment_str += "情场高手";
        } else {
            comment_str += "情场圣手";
        }
        comment_str += "</b></c>";
        this.richText_comment.string = comment_str;
        // 显示游戏结束界面
        this.node_over_ALL.active = true;
    },

    // 再来一次函数
    game_again: function() {
        // 隐藏游戏结束界面
        this.node_over_ALL.active = false;
        // 变量初始化
        this._init_();
        // 开始游戏
        this.game_start();
    },
});
