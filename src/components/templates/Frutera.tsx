import React, { FC, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Mesh } from 'three';
import { Html } from '@react-three/drei';
import { useRecoilState } from 'recoil';
import { sparqlAxios, sparqlEndpointUrl } from '@/utils/sparql';
import { timeSliderValueState } from '@/states/timeSliderValue';

type SPARQLData = {
  datatype: string;
  type: string;
  value: string;
};

type SPARQLResponse = {
  head: string[];
  results: {
    bindings: {
      timestamp: SPARQLData;
      x: SPARQLData;
      y: SPARQLData;
    }[];
  };
};

export const Frutera: FC = () => {
  const [timeSliderValue] = useRecoilState(timeSliderValueState);
  const [stInfo, setStInfo] = useState<SPARQLResponse | null>(null);
  const [actionInstances, setActionInstances] = useState(null);
  const [curAI, setCurAI] = useState<number>(
    actionInstances ? Object.keys(actionInstances).length : 0
  );
  const [executing, setExecuting] = useState<boolean>(false);
  const cubeRef = useRef<Mesh>(null);

  const query = `
PREFIX doto: <https://sdm.hongo.wide.ad.jp/~ino/dto/ontology.rdf#>
PREFIX dotorssrc: <https://sdm.hongo.wide.ad.jp/~ino/dto/resources/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX geom: <http://data.ign.fr/def/geometrie#>
select ?timestamp ?x ?y where { 
    ?s rdf:type doto:Spatio_temporal ;
        doto:has_time_stamp ?timestamp ;
        doto:has_point ?p .
    ?p geom:coordX ?x ;
        geom:coordY ?y .
} offset 0 limit 200`;

  const queryActionInstances = `
PREFIX doto: <https://sdm.hongo.wide.ad.jp/~ino/dto/ontology.rdf#>
PREFIX dotorssrc: <https://sdm.hongo.wide.ad.jp/~ino/dto/resources/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX geom: <http://data.ign.fr/def/geometrie#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
select ?actionName ?instances ?timestamp ?value ?schema ?paramName where { 
    ?action rdf:type doto:Action ;
            doto:has_name ?actionName ;
            doto:execute ?instances .
    ?instances doto:has_time_stamp ?timestamp ;
               doto:has_data ?data .
    ?data doto:has_value ?value ;
          doto:reference ?parameter .
    ?parameter a doto:Parameter ;
               doto:has_name ?paramName .
    ?schema doto:has_parameter ?parameter .
    filter (xsd:dateTime(?timestamp) > "2021-10-26T00:00:00Z"^^xsd:dateTime)
    filter (xsd:dateTime(?timestamp) < "2021-10-27T00:00:00Z"^^xsd:dateTime)
} offset 0 limit 1000`;

  useEffect(() => {
    sparqlAxios(
      axios,
      sparqlEndpointUrl,
      query,
      (e) => {
        console.log('Success!');
        setStInfo(e.data);
      },
      (err) => {
        console.log('Failed!');
        console.log(err);
      }
    );
    sparqlAxios(
      axios,
      sparqlEndpointUrl,
      queryActionInstances,
      (e) => {
        const bindings = e.data.results.bindings;
        console.log(bindings);
        const groupedBindings: any = groupBy(
          bindings,
          (i: any) => i.timestamp.value
        );
        const groupedGroupedBindings = {} as any;
        Object.keys(groupedBindings).forEach((key) => {
          groupedGroupedBindings[key] = mergeDeeply(
            groupedBindings[key][0],
            groupedBindings[key][1],
            null
          );
        });
        console.log('Success!!!!!!!!!!!!!!!!!!');
        setActionInstances(groupedGroupedBindings);
      },
      (err) => {
        console.error(err);
      }
    );
  }, []);
  useEffect(() => {
    console.log(stInfo);
    console.log(actionInstances);
  }, [stInfo, actionInstances]);
  useEffect(() => {
    if (stInfo !== null) {
      const cube = cubeRef.current;
      if (!cube) return;
      const stData = stInfo?.results?.bindings[timeSliderValue];
      if (!stData || !actionInstances) {
        cube.position.x = 0;
        cube.position.z = 0;
      } else {
        cube.position.x = parseFloat(stData.x.value) - 43;
        cube.position.z = (parseFloat(stData.y.value) - 30) * 0.8;

        const keys = Object.keys(actionInstances);
        const curTS = keys.findIndex(
          (k) => new Date(k) > new Date(stData.timestamp.value)
        );
        if (curTS !== curAI) {
          setCurAI(curTS);
          setExecuting(true);
          // console.log(
          //   curTS > 0
          //     ? actionInstances[keys[curTS - 1]]
          //     : curTS < 0
          //     ? actionInstances[keys[keys.length - 1]]
          //     : null
          // );
        } else {
          setExecuting(false);
        }
      }
    }
  }, [timeSliderValue]);

  return (
    <group>
      <mesh ref={cubeRef} position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial color={executing ? '#e83593' : 'gray'} />
        <Html center distanceFactor={36}>
          {
            stInfo?.results.bindings[timeSliderValue]?.timestamp.value.split(
              '+'
            )[0]
          }
        </Html>
      </mesh>
    </group>
  );
};

// https://qiita.com/nagtkk/items/e1cc3f929b61b1882bd1
const groupBy = <K extends PropertyKey, V>(
  array: readonly V[],
  getKey: (cur: V, idx: number, src: readonly V[]) => K
) =>
  array.reduce((obj, cur, idx, src) => {
    const key = getKey(cur, idx, src);
    (obj[key] || (obj[key] = []))!.push(cur);
    return obj;
  }, {} as Partial<Record<K, V[]>>);

// https://qiita.com/riversun/items/60307d58f9b2f461082a
const mergeDeeply = (target: any, source: any, opts: any) => {
  const isObject = (obj: any) =>
    obj && typeof obj === 'object' && !Array.isArray(obj);
  const isConcatArray = opts && opts.concatArray;
  const result = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    for (const [sourceKey, sourceValue] of Object.entries(source)) {
      const targetValue = target[sourceKey];
      if (
        isConcatArray &&
        Array.isArray(sourceValue) &&
        Array.isArray(targetValue)
      ) {
        result[sourceKey] = targetValue.concat(...sourceValue);
      } else if (
        isObject(sourceValue) &&
        Object.prototype.hasOwnProperty.call(target, sourceKey)
      ) {
        result[sourceKey] = mergeDeeply(targetValue, sourceValue, opts);
      } else {
        Object.assign(result, { [sourceKey]: sourceValue });
      }
    }
  }
  return result;
};
