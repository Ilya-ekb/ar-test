import React, { useEffect, useRef } from 'react';
import {MindARThree} from 'mind-ar/dist/mindar-image-three.prod.js';
import * as THREE from 'three';

let tracked = null;

export function MindARViewThree(props) {
  const containerRef = useRef(null);
  useEffect(() => {
    const mindarThree = new MindARThree({
      container: containerRef.current,
      imageTargetSrc: "./streamingassets/targets.mind",
    });
    const {renderer, scene, camera} = mindarThree;
    const anchor = mindarThree.addAnchor(0);
    const geometry = new THREE.PlaneGeometry(1, 0.55);
    const material = new THREE.MeshBasicMaterial( {color: 0x00ffff, transparent: true, opacity: 0.5} );
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
      renderer.render(scene, camera);
      if(tracked){
        let param = JSON.stringify(anchor.group.matrix);
        props.callback("[EntryPoint]", "WebGlBridgeSetMatrix", param);
      }
    });

    return () => {
    }
  }, []);

  return (
    <div className='mi' style={{width: "100%", height: "100%", zIndex: 0}} ref={containerRef}>
    </div>
  )
}
