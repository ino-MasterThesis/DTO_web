import { Vector3 } from '@react-three/fiber';
import React, { FC } from 'react';
import { changeOpacity } from '@/utils/mouseEvent';

type cubeProps = {
  dir: string;
};

const MyCube: FC<cubeProps> = ({ dir }) => {
  const info =
    dir === 'x'
      ? { pos: [1, 0, 0] as Vector3, color: 'red' }
      : dir === 'y'
      ? { pos: [0, 1, 0] as Vector3, color: 'blue' }
      : { pos: [0, 0, 1] as Vector3, color: 'green' };
  return (
    <mesh
      position={info.pos}
      onDoubleClick={(e) => changeOpacity(e)}
      scale={[0.5, 0.5, 0.5]}
    >
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshPhongMaterial color={info.color} />
    </mesh>
  );
};
export const Axes: FC = () => {
  return (
    <>
      {['x', 'y', 'z'].map((e, i) => {
        return <MyCube key={i} dir={e} />;
      })}
    </>
  );
};
