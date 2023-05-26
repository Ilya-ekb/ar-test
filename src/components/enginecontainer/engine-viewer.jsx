import { useEffect, useCallback, useState, Fragment } from "react";
import  { Unity, useUnityContext } from "react-unity-webgl";
import { Onboarding } from "../onboarding/onboarding";
import {MindARViewThree} from "../mindarcontainer/mindar-viewer"
import {Controller } from "mind-ar/dist/controller-939e6d85";

let srcVideo = null;

export function EngineViewer(props){
  const {unityProvider, addEventListener, removeEventListener, sendMessage, requestFullscreen, loadingProgression, isLoaded} = useUnityContext({
    loaderUrl: "./engine/ARAlbum.loader.js",
    dataUrl: "./engine/ARAlbum.data",
    frameworkUrl: "./engine/ARAlbum.framework.js",
    codeUrl: "./engine/ARAlbum.wasm",
    streamingAssetsUrl: "streamingassets",
  });

  const [isOnboarding, setOnboarding] = useState(true);
  const loadingPercentage = Math.round(loadingProgression * 100);
  const [isCameraAllowed, setCameraAllowed] = useState(false);

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
    window.onWebcamVideoStart = (deviceId, activeWebCams) =>{
      var device = activeWebCams[deviceId];
      console.log("start",device);
      srcVideo = device.video;
      srcVideo.addEventListener("loadedmetadata", ()=>{
        console.log(srcVideo);  
        srcVideo.setAttribute("width", this.video.videoWidth);
        srcVideo.setAttribute("height", this.video.videoHeight);
        setCameraAllowed(true);
      })
    };
    window.onWebcamVideoStop = (deviceId, activeWebCams) =>{
      var device = activeWebCams[deviceId];
      console.log("stop",device);
      srcVideo = null;
      setCameraAllowed(false);
    }
  }, []);

  function handleClickEventFullsrceen(){
    requestFullscreen(true);
  }

  return (
    <div className="engine">
      {isLoaded === false ?
        <div className="loading-overlay" style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "whitesmoke", display: "flex", zIndex: 4}}>
          <p>ЗАГРУЗКА... {loadingPercentage}%</p>
        </div> : ""
      }
      <Fragment>
        <Unity unityProvider={unityProvider} style={{position: "static", width: "100vw", height: "93vh", overflow: "hidden", zIndex: 3}}/>
        <button onClick={handleClickEventFullsrceen}>На весь экран</button>
      </Fragment>
      {isOnboarding ? "" : isCameraAllowed ? <MindARViewThree callback={function(objectName, methodName, parameter){sendMessage(objectName, methodName, parameter)}} addListener={function(methodName, handler) {addEventListener(methodName, handler)}} removeLister={function(methodName, handler) {removeEventListener(methodName, handler)}} video={srcVideo}/> : "" }
      {isOnboarding ? <Onboarding isActive={isOnboarding}/> : ""}
    </div>
  );
}
