import { useEffect, useCallback, useState, Fragment, useLayoutEffect } from "react";
import  { Unity, useUnityContext } from "react-unity-webgl";
import { Onboarding } from "../onboarding/onboarding";
import {MindARReact} from "../mindarcontainer/mindar-controller"
import {au, ca, co, Controller, el, fa, fu, N, W } from "mind-ar/dist/controller-939e6d85";
import { Popup } from "../popup/popup";
import { AudioController } from "../audiocontrol/audiocontroller";

let srcVideo = null;
let mindAR = null;
let audioController = null;

export function EngineViewer(props){

  const {unityProvider, addEventListener, removeEventListener, sendMessage, loadingProgression, isLoaded} = useUnityContext({
    loaderUrl: "./engine/ARAlbum.loader.js",
    dataUrl: "./engine/ARAlbum.data",
    frameworkUrl: "./engine/ARAlbum.framework.js",
    codeUrl: "./engine/ARAlbum.wasm",
    streamingAssetsUrl: "streamingassets",
  });

  const [isOnboarding, setOnboarding] = useState(true);
  const loadingPercentage = Math.round(loadingProgression * 100);
  const [isCameraAllowed, setCameraAllowed] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAudioRequest, setAudioRequest] = useState(false);
  const audioList = ["Perov.mp3",];
  const [isStarted, setStarted] = useState(false);

  function handleStart(){
    setStarted(true);
    removeEventListener(true);
  }

  const handleStartEngine = useCallback(()=>{
    setOnboarding(false);
  });

  function playAudio (){
    audioController.play();
  }

  function pauseAudio(){
    audioController.pause();
  }

  function mute(){
    audioController.mute();
  }

  function unmute(){
    audioController.unmute();
  }

  function setAudionPosition(value){
    audioController.setAudioPosition(value);
  }

  useEffect(()=>{
    addEventListener("OnStartEngine", handleStartEngine);
    return ()=>{
      removeEventListener("OnStartEngine", handleStartEngine);
    };
  }, [addEventListener, removeEventListener, handleStartEngine]);

  useEffect(()=>{
    addEventListener("OnStartAudio", playAudio);
    return ()=>{
      removeEventListener("OnStartAudio", playAudio);
    };
  }, [addEventListener, removeEventListener]);

  useEffect(()=>{
    addEventListener("OnStopAudio", pauseAudio);
    return ()=>{
      removeEventListener("OnStopAudio", pauseAudio);
    };
  }, [addEventListener, removeEventListener]);

  useEffect(()=>{
    addEventListener("OnMute", mute);
    return ()=>{
      removeEventListener("OnMute", mute);
    };
  }, [addEventListener, removeEventListener]);

  useEffect(()=>{
    addEventListener("OnUnmute", unmute);
    return ()=>{
      removeEventListener("OnUnmute", unmute);
    };
  }, [addEventListener, removeEventListener]);

  useEffect(()=>{
    addEventListener("OnSetAudioPosition", setAudionPosition);
    return ()=>{
      removeEventListener("OnSetAudioPosition", setAudionPosition);
    };
  }, [addEventListener, removeEventListener]);



  useEffect(()=>{

    audioController = new AudioController({
      audioList: audioList, 
      canPlayRequest: () => {
        setAudioRequest(true);
        setOpen(true);
      },
      onTimeUpdate: function(position){
        sendMessage("[EntryPoint]", "SetAudioPosition", position);
      } 
    });
    
    window.onUpdate = null;
    window.onDetected = null;
    window.onLost = null;

    window.onUpdate = (trackable) => {
      if(trackable){
        let matrixJson = JSON.stringify(trackable.matrix);
        sendMessage("[EntryPoint]", "WebGlBridgeSetMatrix", matrixJson);
      }
    }
  
    window.onDetected = (index) => {
      audioController.setClip(index);
      sendMessage("[EntryPoint]", "WebGlBridgeDetected", index);
    }
    
    window.onLost = (index) => {
      sendMessage("[EntryPoint]", "WebGlBridgeLost", index);
    }
  
  }, [isLoaded])
  

  useEffect(()=>{
    window.onWebcamVideoStart = (deviceId, activeWebCams) =>{
      if(!isCameraAllowed){
        var device = activeWebCams[deviceId];
        srcVideo = device.video;
        srcVideo.addEventListener("loadedmetadata", ()=>{
          srcVideo.setAttribute("width", srcVideo.videoWidth);
          srcVideo.setAttribute("height", srcVideo.videoHeight);
          setCameraAllowed(true);
          if(mindAR === null){
            mindAR = new MindARReact({
              imageTargetSrc: "./streamingassets/targets.mind",
              video: srcVideo,
            });
            mindAR.initiateAR();
          } else {mindAR.start();}
        })   
      }  
    };

    window.onWebcamVideoStop = (deviceId, activeWebCams) =>{
      var device = activeWebCams[deviceId];
      mindAR.stop();
      srcVideo = null;
      setCameraAllowed(false);
    }
  }, []);

  return (
    <div className="engine">
      {isStarted && isLoaded === false ?
        <div className="loading-overlay" style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "whitesmoke", display: "flex", zIndex: 4}}>
          <p>ЗАГРУЗКА... {loadingPercentage}%</p>
        </div> : ""
      }
      {open && isAudioRequest ? <Popup title="Разрешить воспроизводить звук" buttontext="ДА" closePopup={() => {
        audioController.setCanPlay(true);
        setOpen(false);
      }}/> : null}
      {isStarted ? null : <Popup title="Демонстрационная версия." buttontext="Понятно" closePopup={handleStart}/>}
      {isStarted ? <Unity 
      unityProvider={unityProvider} 
      style={{position: "absoute", width: "100%", height: "100%", overflow: "hidden", zIndex: 3}}/> : null}

      {isStarted && isOnboarding ? <Onboarding isActive={isOnboarding}/> : null}
    </div>
  );
}
