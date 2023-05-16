import { useEffect, useCallback, useState } from "react";
import  { Unity, useUnityContext } from "react-unity-webgl";
import { Onboarding } from "../onboarding/onboarding";
import {MindARViewThree} from "../mindarcontainer/mindar-viewer"

export function EngineViewer(){
  const {unityProvider, addEventListener, removeEventListener, sendMessage, loadingProgression, isLoaded} = useUnityContext({
    loaderUrl: "./engine/ARAlbum.loader.js",
    dataUrl: "./engine/ARAlbum.data",
    frameworkUrl: "./engine/ARAlbum.framework.js",
    codeUrl: "./engine/ARAlbum.wasm",
    streamingAssetsUrl: "streamingassets",
  });

  const [isOnboarding, setOnboarding] = useState(true);
  const loadingPercentage = Math.round(loadingProgression * 100);

  const handleStartEngine = useCallback(()=>{
    setOnboarding(false);
  });
  
  useEffect(()=>{
    addEventListener("OnStartEngine", handleStartEngine);
    return ()=>{
      removeEventListener("OnStartEngine", handleStartEngine);
    };
  }, [addEventListener, removeEventListener, handleStartEngine]);

  return (
    <div className="engine">
      {isLoaded === false ?
        <div className="loading-overlay" style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "whitesmoke", display: "flex", zIndex: 4}}>
          <p>ЗАГРУЗКА... {loadingPercentage}%</p>
        </div> : ""
      }

      {isOnboarding ? "" : <MindARViewThree callback={function(objectName, methodName, parameter){sendMessage(objectName, methodName, parameter)}}/>}
      <Unity unityProvider={unityProvider} style={{width: "100vw", height: "100vh", overflow: "hidden", zIndex: 3}}/>
      {isOnboarding ? <Onboarding isActive={isOnboarding}/> : ""}
    </div>
  );
}
