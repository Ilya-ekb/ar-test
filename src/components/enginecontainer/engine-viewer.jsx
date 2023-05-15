import { useEffect, useCallback, useState } from "react";
import  { Unity, useUnityContext } from "react-unity-webgl";
import { Onboarding } from "../onboarding/onboarding";
import {MindARViewThree} from "../mindarcontainer/mindar-viewer"

export function EngineViewer(){
  const {unityProvider, addEventListener, removeEventListener, sendMessage, loadingProgression, isLoaded} = useUnityContext({
    loaderUrl: "./build/ARAlbum.loader.js",
    dataUrl: "./build/ARAlbum.data",
    frameworkUrl: "./build/ARAlbum.framework.js",
    codeUrl: "./build/ARAlbum.wasm",
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
        <div className="loading-overlay" style={{zIndex: 4}}>
          <p>Loading... ({loadingPercentage}%)</p>
        </div> : ""
      }

      <Unity unityProvider={unityProvider} style={{width: "100%", height: "100vh", zIndex: 3, position: "relative"}}/>
      {isOnboarding ? <Onboarding isActive={isOnboarding}/> : ""}
      {isOnboarding ? "" : <MindARViewThree callback={function(objectName, methodName, parameter){sendMessage(objectName, methodName, parameter)}}/>}
    </div>
  );
}
