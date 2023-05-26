import React, { useEffect, useRef, useCallback, useState } from 'react';
import {MindARThree} from 'mind-ar/dist/mindar-image-three.prod.js';
import * as THREE from 'three';

let tracked = null;

export function MindARViewThree(props) {
  const containerRef = useRef(null);
  let mindarThree = null;
  useEffect(() => {
    mindarThree = new MindARThree({
      container: containerRef.current,
      imageTargetSrc: "./streamingassets/targets.mind",
      video: props.video,
    });

    const {renderer} = mindarThree;
    const anchor = mindarThree.addAnchor(0);
    const geometry = new THREE.PlaneGeometry(1, 0.55);
    const material = new THREE.MeshBasicMaterial( {color: 0x00ffff, transparent: true, opacity: 0} );
    const plane = new THREE.Mesh( geometry, material );
    
    anchor.onTargetFound = function(){
      tracked = anchor;
      props.callback("[EntryPoint]", "WebGlBridgeDetected", 0);
    }
    anchor.onTargetLost = function(){
      tracked = null;
      props.callback("[EntryPoint]", "WebGlBridgeLost", 0);
    }
    anchor.group.add(plane);
    mindarThree.start();
    renderer.setAnimationLoop(() => {
      if(tracked){
        let param = JSON.stringify(anchor.group.matrix);
        props.callback("[EntryPoint]", "WebGlBridgeSetMatrix", param);
      }
    });

    return () => {
    }
  }, []);

  return (
    <div style={{position: "absolute", width: "100vw", height: "100vh", zIndex: -3}} ref={containerRef}>
    </div>
  )
}
