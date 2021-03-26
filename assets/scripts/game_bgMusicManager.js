
cc.Class({
    extends: cc.Component,

    properties: {
        //背景音乐组件
        bgMusic:{
            default: null,
            type:cc.AudioClip,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.game.addPersistRootNode(this.node);
        this.audioID=cc.audioEngine.play(this.bgMusic, true, 0.3);
    },
    
    start () {
        
    },

    // update (dt) {},

    //播放背景音乐
    playBgMusic: function(){
        var state = cc.audioEngine.getState(this.audioID); //-1error,0initalzing,1playing,2paused
        if(state==2){
            cc.audioEngine.resume(this.audioID);
            //console.log("playMusic_OK");
        }
    },

    //停止播放背景音乐
    stopBgMusic: function(){
        var state = cc.audioEngine.getState(this.audioID); //-1error,0initalzing,1playing,2paused
        if(state==1){
            cc.audioEngine.pause(this.audioID);
            //console.log("stopMusic_OK");      
        }
    },
});
