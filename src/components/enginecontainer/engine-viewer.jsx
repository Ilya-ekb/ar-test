import { useEffect, useCallback, useState, Fragment, useLayoutEffect } from "react";
import  { Unity, useUnityContext } from "react-unity-webgl";
import { Onboarding } from "../onboarding/onboarding";
import {MindARViewThree, mindarThree} from "../mindarcontainer/mindar-viewer"
import {Controller, el, fa, N } from "mind-ar/dist/controller-939e6d85";
import { Popup } from "../popup/popup";

let srcVideo = null;
let trackable = null;
let audioDuration = null;

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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audio, setAudio] = useState(null);
  const [open, setOpen] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [isAudioRequest, setAudioRequest] = useState(false);
      
  useEffect(() => {
    handleAudio();
  }, [isPlayingAudio]);

  function handleAudio(){
    if(audio){
      audio.pause();
    }
   
    console.log("isplayingaudio " + isPlayingAudio);
    if(isPlayingAudio){
      audio.src = "Perov.mp3";
      audio.autoplay = true;
      audio.muted = false;
      console.log("Play audio element");
      audio.play();
    } else if(audio){
      console.log("Pause audio element");
      audio.pause();
    }
  }

  function startSound(){
    if(!canPlay){
      setAudioRequest(true);
      setOpen(true);
      return;
    }
    setIsPlayingAudio(true);
  }

  function stopSound(){
    setIsPlayingAudio(false);
  }


  const handleStartEngine = useCallback(()=>{
    setOnboarding(false);
  });
  
  useEffect(()=>{
    addEventListener("OnStartEngine", handleStartEngine);
    return ()=>{
      removeEventListener("OnStartEngine", handleStartEngine);
    };
  }, [addEventListener, removeEventListener, handleStartEngine]);

  useEffect(()=>{
    addEventListener("OnStartAudio", startSound);
    return ()=>{
      removeEventListener("OnStartAudio", startSound);
    };
  }, [addEventListener, removeEventListener, startSound]);

  useEffect(()=>{
    addEventListener("OnStopAudio", stopSound);
    return ()=>{
      removeEventListener("OnStopAudio", stopSound);
    };
  }, [addEventListener, removeEventListener, stopSound]);

  useEffect(()=>{
    window.onUpdate = () => {
      if(trackable){
        let param = JSON.stringify(trackable.group.matrix);
        sendMessage("[EntryPoint]", "WebGlBridgeSetMatrix", param);
      }
    }

    window.onDetected = (anchor, index) => {
      trackable = anchor;
      sendMessage("[EntryPoint]", "WebGlBridgeDetected", index);
    }

    window.onLost = (anchor, index) => {
      trackable = null;
      sendMessage("[EntryPoint]", "WebGlBridgeLost", index);
    }

  }, [sendMessage])

  useEffect(()=>{
    if(audio)
      audio.addEventListener('canplaythrough', ()=> {console.log("CAN PLAY")});
  }, [audio])

  useEffect(()=>{

    setAudio(new Audio());

    window.onWebcamVideoStart = (deviceId, activeWebCams) =>{
      var device = activeWebCams[deviceId];
      console.log("start", device);
      srcVideo = device.video;
      srcVideo.addEventListener("loadedmetadata", ()=>{
        console.log("loadedmetadata" + srcVideo);  
        srcVideo.setAttribute("width", srcVideo.videoWidth);
        srcVideo.setAttribute("height", srcVideo.videoHeight);
        setCameraAllowed(true);
      })
    };
    window.onWebcamVideoStop = (deviceId, activeWebCams) =>{
      var device = activeWebCams[deviceId];
      console.log("stop",device);
      trackable = null;
      mindarThree.stop();
      srcVideo = null;

      setCameraAllowed(false);
    }
  }, []);

  return (
    <div className="engine">
      {isLoaded === false ?
        <div className="loading-overlay" style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "whitesmoke", display: "flex", zIndex: 4}}>
          <p>ЗАГРУЗКА... {loadingPercentage}%</p>
        </div> : ""
      }
      
      <Fragment>
        <Unity unityProvider={unityProvider} 
          style={{position: "absoute", width: "100%", height: "100%", overflow: "hidden", zIndex: 3}}
          >
          </Unity> 
      </Fragment>
      {isOnboarding ? "" : isCameraAllowed ? <MindARViewThree video={srcVideo}/> : "" }
      {isOnboarding ? <Onboarding isActive={isOnboarding}/> : ""}
      {open && isAudioRequest ? <Popup title="Разрешить браузеру воспроизводить звук" buttontext="ДА" closePopup={() => {setCanPlay(true); setIsPlayingAudio(true); setOpen(false)}}/> : null}
    </div>
  );
}
