import React, { FC, Suspense, useState, useEffect } from 'react';
import { useProgress, Html } from '@react-three/drei';
import { useLoader, ThreeEvent } from '@react-three/fiber';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import axios from 'axios';
import { MeshPhongMaterial } from 'three';
import { Obj2Primitive } from './OBJPrimitive';
import { changeOpacity } from '@/utils/mouseEvent';
import { sparqlAxios, sparqlEndpointUrl } from '@/utils/sparql';

export const IFCRaw: FC = () => {
  const ifcModel = useLoader(IFCLoader, '/NTTcom.ifc');
  return (
    <Suspense fallback={<Loader />}>
      {/* https://github.com/pmndrs/react-three-fiber/issues/281 */}
      <group dispose={null}>
        <primitive
          object={ifcModel}
          position={[-7, 0, 4]}
          onDoubleClick={(e: ThreeEvent<MouseEvent>) => changeOpacity(e)}
        />
      </group>
    </Suspense>
  );
};

const Loader = () => {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
};

export const IFCObj: FC = () => {
  const [bsInfo, setBsInfo] = useState<any[]>([]);
  const query = `
  PREFIX doto: <https://sdm.hongo.wide.ad.jp/~ino/dto/ontology.rdf#>
  select ?bs ?e ?volume ?ifcinfo where {
    ?bs a ?bstype .
    FILTER (?bstype IN (doto:Building_space, doto:Building_element))
    ?bs doto:is_placed_in ?point ;
        doto:has_volume ?volume .
    ?point doto:has_matrix4 ?mat4 .
    ?mat4 doto:element ?e .
    ?bs doto:has_ifcinfo ?ifcinfo .
    filter (contains(?ifcinfo, '基準レベル": "レベル: レベル 1"'))
  } 
  `;
  type queryResopnse = {
    bs: { value: string };
    e: { value: string };
    ifcinfo: { value: string };
  };
  useEffect(() => {
    sparqlAxios(
      axios,
      sparqlEndpointUrl,
      query,
      (e) => {
        console.log('Success!');
        setBsInfo(
          e.data.results.bindings.map((e: queryResopnse) => {
            return {
              bs: e.bs.value,
              element: e.e.value.split(',').map((ee) => parseFloat(ee)),
              info: e.ifcinfo.value,
            };
          })
        );
      },
      (err) => {
        console.log('Failed!');
        console.log(err);
      }
    );
  }, []);
  return (
    <>
      {bsInfo.map((mat, i) => {
        const url = `http://localhost:8080/${mat.bs.split('-')[1]}.0001.obj`; // 以降し次第 mat.volume から取得
        return (
          <Obj2Primitive
            key={i}
            objUrl={url}
            material={
              mat.info.includes('家具') &&
              new MeshPhongMaterial({ color: 0x6699ff })
            }
            matrix4={mat.element}
            rotation={{ eular: -Math.PI / 2, axis: [1, 0, 0] }}
            translation={[-7, 0, 4]}
          />
        );
      })}
    </>
  );
};
