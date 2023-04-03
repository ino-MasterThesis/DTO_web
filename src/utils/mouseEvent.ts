import { ThreeEvent } from '@react-three/fiber';
import { Mesh } from 'three';
import { rotate, translate, scale3D } from '@/utils/objControls';

export const changeOpacity = (e: ThreeEvent<MouseEvent>) => {
  e.stopPropagation(); // これを置かないとレイ上全てのオブジェクトに実行される
  console.log(e.object);
  const mat = (e.object as Mesh).material;
  if (Array.isArray(mat)) {
    mat.forEach((v) => {
      v.transparent = true;
      v.opacity = v.opacity !== 1 ? 1 : 0.2;
    });
  } else {
    mat.transparent = true;
    mat.opacity = mat.opacity !== 1 ? 1 : 0.2;
  }
};

export const applyMatrices = (e: ThreeEvent<MouseEvent>) => {
  const obj = e.object;
  rotate(obj, Math.PI / 4, [0, 0, 1]);
  translate(obj, [0, 1, 0]);
  scale3D(obj, [1, 1, 1]);
};
