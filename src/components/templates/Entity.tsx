import axios from 'axios';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Mesh, MeshPhongMaterial, Vector3 } from 'three';
import { Html } from '@react-three/drei';
import { Button, Typography } from '@mui/material';
import { JSONTree } from 'react-json-tree';
import { Obj2Primitive } from './OBJPrimitive';
import { sparqlAxios, sparqlEndpointUrl } from '@/utils/sparql';
import * as query from '@/utils/query';
import { eySwitchState } from '@/states/eySwitch';
import { entityIriState } from '@/states/entityIri';
import { timeSliderValueState } from '@/states/timeSliderValue';

type AtomicEntityStateType = {
  type: string;
  value: string;
};

type KVAtomicEntityStateType = {
  [key: string]: AtomicEntityStateType;
};

type EntityPrimitiveStateType = {
  [key: string]:
    | {
        type: string;
        value: string;
      }
    | {
        [key: string]:
          | {
              type: string;
              value: string;
            }
          | KVAtomicEntityStateType
          | KVAtomicEntityStateType[];
      }
    | {
        [key: string]:
          | {
              type: string;
              value: string;
            }
          | KVAtomicEntityStateType
          | KVAtomicEntityStateType[];
      }[];
};

type EntityPrimitiveProps = {
  eidosState: EntityPrimitiveStateType;
  hyleState: EntityPrimitiveStateType;
};
export const EntityPrimitive: FC<EntityPrimitiveProps> = ({ eidosState, hyleState }) => {
  const showHyle = useRecoilValue(eySwitchState);
  const entityIris = useRecoilValue(entityIriState);
  const selectedEntity =
    (eidosState?.entity as AtomicEntityStateType)?.value === entityIris.main
      ? 'main'
      : entityIris.related.includes((eidosState?.entity as AtomicEntityStateType)?.value)
      ? 'related'
      : false;
  const EYSwitcher = showHyle
    ? {
        color: 'darkgrey',
        metadata: hyleState,
      }
    : {
        color: 'lightgrey',
        metadata: eidosState,
      };
  const entityMaterial = new MeshPhongMaterial({
    color: !selectedEntity ? EYSwitcher.color : selectedEntity === 'main' ? 'magenta' : 'lightgreen',
  });
  return (
    <>
      {isEmptyObject(eidosState) || isEmptyObject(hyleState) ? (
        <></>
      ) : (
        <Obj2Primitive
          objUrl={(eidosState.volumeUri as AtomicEntityStateType).value.replace(
            'https://sdm.hongo.wide.ad.jp/~ino/dto/assets',
            import.meta.env.VITE_ENTITY_ASSETS_HOST
          )}
          material={entityMaterial}
          matrix4={vec3ToMat4(csvToFloatArray((hyleState.coordinates as KVAtomicEntityStateType[])[0].vec3.value))}
          rotation={{ eular: -Math.PI / 2, axis: [1, 0, 0] }}
          translation={[-7, 0, 4]}
          metadata={EYSwitcher.metadata}
        />
      )}
    </>
  );
};

const AGVTargetSpace: FC<{
  isHidden: boolean;
  target: string;
}> = ({ isHidden, target }) => {
  return isHidden ? (
    <></>
  ) : (
    <group>
      <mesh position={[-2.5, 0, 2.5]} castShadow>
        <boxGeometry args={[6, 0.5, 5]} />
        <meshPhongMaterial color={target === 'C' ? 'gold' : 'white'} />
      </mesh>
      <mesh position={[4, 0, 2.5]} castShadow>
        <boxGeometry args={[6, 0.5, 5]} />
        <meshPhongMaterial color={target === 'B' ? 'gold' : 'white'} />
      </mesh>
      <mesh position={[-2.5, 0, -3]} castShadow>
        <boxGeometry args={[6, 0.5, 5]} />
        <meshPhongMaterial color={target === 'HOME' ? 'gold' : 'white'} />
      </mesh>
      <mesh position={[4, 0, -3]} castShadow>
        <boxGeometry args={[6, 0.5, 5]} />
        <meshPhongMaterial color={target === 'A' ? 'gold' : 'white'} />
      </mesh>
    </group>
  );
};

export const MovingEntity: FC = () => {
  const [timeSliderValue] = useRecoilState(timeSliderValueState);
  const [hyleState, setHyleState] = useState<any>(null);
  const [eidosState, setEidosState] = useState<any>(null);
  const [executing, setExecuting] = useState<boolean>(false);
  const [targetSpaceName, setTargetSpaceName] = useState<string>('');

  const [clickPoint, setClickPoint] = useState<Vector3>();
  const [isHideParams, setIsHideParams] = useState<boolean>(true);

  const [currentActionInstance, setCurrentActionInstance] = useState<number>(
    eidosState ? Object.keys(eidosState).length : 0
  );
  const ref = useRef<Mesh>(null);

  const name = 'AGV';

  useEffect(() => {
    sparqlAxios(
      axios,
      sparqlEndpointUrl,
      query.getBasicHyleByName.sparql(name),
      (e) => {
        setHyleState(query.getBasicHyleByName.parser(e.data) as any);
      },
      (err) => {
        console.error(`Failed to query @ ${query.getBasicHyleByName.sparql(name)}`);
        console.error(err);
      }
    );
    sparqlAxios(
      axios,
      sparqlEndpointUrl,
      query.getBasicEidosByName.sparql(name),
      (e) => {
        setEidosState(query.getBasicEidosByName.parser(e.data) as any);
      },
      (err) => {
        console.error(`Failed to query @ ${query.getBasicEidosByName.sparql(name)}`);
        console.error(err);
      }
    );
  }, []);
  useEffect(() => {
    if (!(eidosState && hyleState && ref.current)) {
      return;
    }
    const curRef = ref.current;
    const coordData = hyleState.coordinates[timeSliderValue];
    // eslint-disable-next-line
    const [x, y, ..._z] = coordData.vec3.value.split(',');
    curRef.position.x = parseFloat(x) - 43;
    curRef.position.z = (parseFloat(y) - 30) * 0.8 - 1;

    const datetimes = Object.keys(eidosState.actions);
    const currentTimestamp = datetimes.findIndex((k) => new Date(k) > new Date(coordData.datetime.value));
    if (currentTimestamp !== currentActionInstance) {
      setCurrentActionInstance(currentTimestamp);
      setExecuting(true);
    } else {
      setExecuting(false);
    }
    const _idx = Object.keys(eidosState.actions).findIndex(
      (key) => new Date(key).getTime() > new Date(hyleState?.coordinates[timeSliderValue]?.datetime.value).getTime()
    );
    if (_idx > 0) {
      /* @ts-ignore */
      setTargetSpaceName(Object.values(eidosState.actions)[_idx]?.target);
    }
    console.log(targetSpaceName);
  }, [eidosState, hyleState, timeSliderValue]);
  const clickEvent = (e: any) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIsHideParams(!isHideParams);
    setClickPoint(e.point);
  };

  const showHyle = useRecoilValue(eySwitchState);
  const entryIri = useRecoilValue(entityIriState);
  const selectedEntity =
    (eidosState?.entity as AtomicEntityStateType)?.value === entryIri.main
      ? 'main'
      : entryIri.related.includes((eidosState?.entity as AtomicEntityStateType)?.value)
      ? 'related'
      : false;
  const EYSwitcher = showHyle
    ? {
        color: 'darkgrey',
        metadata: hyleState,
      }
    : {
        color: 'lightgrey',
        metadata: eidosState,
      };

  return (
    <group>
      <AGVTargetSpace
        isHidden={showHyle}
        /* @ts-ignore */
        target={executing && targetSpaceName}
      />
      <mesh ref={ref} position={[0, 0, 0]} castShadow onClick={clickEvent}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial
          color={
            !selectedEntity
              ? showHyle
                ? 'darkgrey'
                : executing
                ? 'gold'
                : 'lightpink'
              : selectedEntity === 'main'
              ? 'magenta'
              : 'lightgreen'
          }
        />
        {showHyle ? (
          <></>
        ) : (
          <Html distanceFactor={36}>
            <Typography variant="body2">
              {hyleState &&
                hyleState.coordinates[timeSliderValue]?.datetime.value
                  .split('+')[0]
                  .replace('T', '\n')
                  .replaceAll('-', '/')}
            </Typography>
          </Html>
        )}
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
              <Typography variant="subtitle1">About: [{EYSwitcher.metadata.entity.value}]</Typography>
              <JSONTree data={EYSwitcher.metadata} theme="google" hideRoot />
              <Button variant="contained" onClick={clickEvent}>
                Close
              </Button>
            </div>
          </Html>
        ) : (
          <></>
        )}
      </mesh>
    </group>
  );
};

const isEmptyObject = (e: {}) => {
  return Object.keys(e).length === 0;
};

const csvToFloatArray = (csv: string): number[] => {
  return csv.split(',').map((ee) => parseFloat(ee));
};

const vec3ToMat4 = (vec3: number[]): number[] => {
  return [1, 0, 0, vec3[0], 0, 1, 0, vec3[1], 0, 0, 1, vec3[2], 0, 0, 0, 1];
};

export const BuildingElements: FC<{ entityIri: string }> = ({ entityIri }) => {
  const [eidosState, setEidosState] = useState<EntityPrimitiveStateType>({});
  const [hyleState, setHyleState] = useState<EntityPrimitiveStateType>({});
  useEffect(() => {
    sparqlAxios(
      axios,
      sparqlEndpointUrl,
      query.getBasicHyleByBuildingElement.sparql(entityIri),
      (e) => {
        setHyleState(query.getBasicHyleByBuildingElement.parser(e.data) as any);
      },
      (err) => {
        console.error(`Failed to query @ ${query.getBasicHyleByBuildingElement.sparql(entityIri)}`);
        console.error(err);
      }
    );
    sparqlAxios(
      axios,
      sparqlEndpointUrl,
      query.getBasicEidosByBuildingElement.sparql(entityIri),
      (e) => {
        setEidosState(query.getBasicEidosByBuildingElement.parser(e.data) as any);
      },
      (err) => {
        console.error(`Failed to query @ ${query.getBasicEidosByBuildingElement.sparql(entityIri)}`);
        console.error(err);
      }
    );
  }, []);
  return eidosState && hyleState ? <EntityPrimitive eidosState={eidosState} hyleState={hyleState} /> : <></>;
};

export const AllBuildingElements: FC<{ buildingIri: string }> = ({ buildingIri }) => {
  const [elementEntityIris, setElementEntityIris] = useState<string[]>([]);
  useEffect(() => {
    sparqlAxios(
      axios,
      sparqlEndpointUrl,
      query.getAllBuildingElement.sparql(buildingIri),
      (e) => {
        const eeis = query.getAllBuildingElement.parser(e.data) as any[];
        eeis && setElementEntityIris(eeis.map((eei) => eei.entity.value));
      },
      (err) => {
        console.error(`Failed to query @ ${query.getAllBuildingElement.sparql(buildingIri)}`);
        console.error(err);
      }
    );
  }, []);
  return elementEntityIris ? (
    <>
      {elementEntityIris.map((iri, i) => {
        return <BuildingElements key={i} entityIri={iri.split('/').slice(-1)[0]} />;
      })}
    </>
  ) : (
    <></>
  );
};
