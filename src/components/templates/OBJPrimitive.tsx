import React, { FC, useState, useEffect, useRef, useMemo } from 'react';
import { Group, Mesh, Vector3 } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Html } from '@react-three/drei';
import { JSONTree } from 'react-json-tree';
import { Button, Typography } from '@mui/material';
import { rotate, translate } from '@/utils/objControls';

type objPrimProps = {
  objUrl: string;
  material?: any;
  matrix4?: number[];
  rotation?: { eular: number; axis: number[] };
  translation?: number[];
  metadata?: any;
};
export const Obj2Primitive: FC<objPrimProps> = ({ objUrl, material, matrix4, rotation, translation, metadata }) => {
  const [obj, setObj] = useState<Group>();
  const [isHideParams, setIsHideParams] = useState<boolean>(true);
  const [clickPoint, setClickPoint] = useState<Vector3>();

  const ref = useRef<Group>();
  useMemo(() => {
    new OBJLoader().load(objUrl, (e) => {
      setObj(e);
    });
  }, []);
  useEffect(() => {
    if (obj) {
      const cur = ref.current;
      if (cur) {
        cur.matrixAutoUpdate = false;
        // matrix4 && applyMatricesToObj(cur, matrix4); // ifc自体に座標が埋め込まれてしまっているため
        rotation && rotate(cur, rotation.eular, rotation.axis); // -Math.PI / 2, [1, 0, 0]
        translation && translate(cur, translation); // [-7, 0, 4]
      }
    }
  }, [obj]);
  useEffect(() => {
    changeMaterial();
  }, [material]);

  // https://github.com/pmndrs/react-three-fiber/discussions/1166
  const changeMaterial = () => {
    obj &&
      material &&
      obj.traverse((child) => {
        if (child instanceof Mesh) {
          child.material = material;
        }
      });
  };

  // IfcSpatioalZone
  const isHidenObject: boolean = [
    'https://sdm.hongo.wide.ad.jp/~ino/dto2/resources/ifc_building_element_proxy_2yZq0BdLf1UhRXwZn_WZoP',
    'https://sdm.hongo.wide.ad.jp/~ino/dto2/resources/ifc_building_element_proxy_2yZq0BdLf1UhRXwZn_WZch',
  ].includes(metadata.entity.value);

  const clickEvent = (e: any) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIsHideParams(!isHideParams);
    setClickPoint(e.point);
  };

  return obj && !isHidenObject ? (
    <mesh>
      <primitive object={obj} dispose={null} ref={ref} onClick={clickEvent} />
      <meshNormalMaterial />
      {!isHideParams ? (
        <Html position={clickPoint}>
          <div
            style={{
              width: 900,
              backgroundColor: 'white',
              border: '3px solid #888888',
              padding: 5,
              borderRadius: 5,
            }}
          >
            <Typography variant="subtitle1">About: [{metadata.entity.value}]</Typography>
            <JSONTree data={metadata} theme="google" hideRoot />
            <Button variant="contained" onClick={clickEvent}>
              Close
            </Button>
          </div>
        </Html>
      ) : (
        <></>
      )}
    </mesh>
  ) : null;
};
