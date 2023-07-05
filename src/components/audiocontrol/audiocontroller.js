export class AudioController{
    constructor({audioList, canPlayRequest = null, onTimeUpdate = null}){
        this.canPlayRequest = canPlayRequest;
        this.audioList = audioList;
        this.onTimeUpdate = onTimeUpdate;
        this.audio = new Audio();
        this.canPlay = false;
        this.clipLoaded = false;
        this.audio.addEventListener('canplaythrough', ()=>{
            console.log("CAN PLAY");
            this.clipLoaded = true;
        })
        this.audio.addEventListener('timeupdate',() => {
            if(!this.clipLoaded) return;
            var pos = this.audio.currentTime/this.audio.duration;
            onTimeUpdate(pos);
        })
        this.audio.addEventListener('end', this.stop);
    }
    
    setCanPlay(value){
        this.canPlay = value;
        this.audio.muted = false;
        this.play();
    }

    setAudioPosition(value){
        console.log("set audio position " + value);
        console.log("audio duration " + this.audio.duration);
        console.log("set time " + this.audio.duration * value);
        this.audio.currentTime = this.audio.duration * value;
    }

    play(){
        if(!this.canPlay){
            this.canPlayRequest();
            return;
        }
        console.log("play");  
        this.audio.play();
    }

    setClip(index){
        this.clipLoaded = false;
        this.audio.src = this.audioList[index];
    }

    pause(){
        console.log("pause");
        this.audio.pause();
    }

    stop(){
        console.log("stop");
        this.audio.pause();
        this.audio.load();
    }

    mute(){
        console.log("mute");
        this.audio.muted = true;
    }

    unmute(){
        console.log("unmute");
        this.audio.muted = false;
    }
}