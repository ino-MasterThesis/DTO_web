import { ThreeEvent } from '@react-three/fiber';
import React, { FC, useEffect, useRef } from 'react';
import { Mesh } from 'three';
import { applyMatrices } from '@/utils/mouseEvent';

export const Cube: FC = () => {
  const cubeRef = useRef<Mesh>(null);
  // useFrame(() => {
  //   const cube = cubeRef.current;
  //   if (!cube) return;
  //   cube.rotation.x += 0.01;
  //   cube.rotation.y += 0.01;
  // });
  useEffect(() => {
    const cube = cubeRef.current;
    if (cube) {
      cube.matrixAutoUpdate = false;
    }
  }, []);
  return (
    <mesh
      ref={cubeRef}
      onClick={(e: ThreeEvent<MouseEvent>) => applyMatrices(e)}
    >
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshPhongMaterial color="aqua" />
    </mesh>
  );
};
