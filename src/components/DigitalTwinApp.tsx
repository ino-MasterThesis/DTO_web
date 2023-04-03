import React, { FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRecoilBridgeAcrossReactRoots_UNSTABLE } from 'recoil'; // eslint-disable-line
import Split from 'react-split';
import { Toolbox } from './ToolBox';
import { AllBuildingElements, MovingEntity } from './templates/Entity';
import { TimeSlider } from '@/components/TimeSlider';

export const DigitalTwinApp: FC = () => {
  const RecoilBridge = useRecoilBridgeAcrossReactRoots_UNSTABLE();
  return (
    <Split
      className="canvas"
      gutter={(_, direction) => {
        const gutterElement = document.createElement('div');
        gutterElement.className = `w-[3px] bg-indigo-500 hover:cursor-col-resize transition-all delay-300 duration-300 ease-in-out`;
        return gutterElement;
      }}
      gutterStyle={() => ({})}
      sizes={[5, 90, 5]}
      direction="vertical"
    >
      <Toolbox />
      <Canvas
        camera={{
          fov: 45, // 視野角
          // aspect: 1,  // アスペクト比、描画する矩形領域の 幅/高さ
          near: 0.1, // オブジェクトを描画する最も近い距離
          far: 1000, // オブジェクトを描画する最も遠い距離
          position: [5, 15, 15],
        }}
      >
        <RecoilBridge>
          <directionalLight position={[1, 1, 1]} intensity={0.8} />
          <ambientLight args={[0xffffff]} intensity={0.2} />
          <OrbitControls />
          <gridHelper args={[30, 30]} />
          <axesHelper renderOrder={1} args={[50]} />
          <AllBuildingElements buildingIri={'ifc_building_3GK5fuZ0H3lBol_s8XFevC'} />
          <MovingEntity />
        </RecoilBridge>
      </Canvas>
      <TimeSlider />
    </Split>
  );
};
