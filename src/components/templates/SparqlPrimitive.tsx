import React, { FC, useEffect } from 'react';

export const SparqlPrimitive: FC = () => {
  // const query = `
  // PREFIX doto: <https://sdm.hongo.wide.ad.jp/~ino/dto/ontology.rdf#>
  // PREFIX dotorssrc: <https://sdm.hongo.wide.ad.jp/~ino/dto/resources/>
  // PREFIX owl: <http://www.w3.org/2002/07/owl#>
  // PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  // PREFIX geom: <http://data.ign.fr/def/geometrie#>
  // PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  // select ?actionName ?instances ?timestamp ?value ?schema ?paramName where {
  //     ?action rdf:type doto:Action ;
  //             doto:has_name ?actionName ;
  //             doto:execute ?instances .
  //     ?instances doto:has_time_stamp ?timestamp ;
  //                doto:has_data ?data .
  //     ?data doto:has_value ?value ;
  //           doto:reference ?parameter .
  //     ?parameter a doto:Parameter ;
  //                doto:has_name ?paramName .
  //     ?schema doto:has_parameter ?parameter .
  //     filter (xsd:dateTime(?timestamp) > "2021-10-26T00:00:00Z"^^xsd:dateTime)
  //     filter (xsd:dateTime(?timestamp) < "2021-10-27T00:00:00Z"^^xsd:dateTime)
  // } offset 0 limit 1000`;

  useEffect(() => {
    // sparqlAxios(
    //   axios,
    //   sparqlEndpointUrl,
    //   query,
    //   (e) => {
    //     const bindings = e.data.results.bindings;
    //     const groupedBindings = groupBy(
    //       bindings,
    //       (i: any) => i.instances.value
    //     );
    //     const groupedGroupedBindings = {} as any;
    //     Object.keys(groupedBindings).forEach((key) => {
    //       groupedGroupedBindings[key] = mergeDeeply(
    //         groupedBindings[key][0],
    //         groupedBindings[key][1],
    //         null
    //       );
    //     });
    //     console.log(groupedGroupedBindings);
    //   },
    //   (err) => {
    //     console.log(err);
    //   }
    // );
  }, []);

  return <></>;
};

// https://qiita.com/nagtkk/items/e1cc3f929b61b1882bd1
// const groupBy = <K extends PropertyKey, V>(
//   array: readonly V[],
//   getKey: (cur: V, idx: number, src: readonly V[]) => K
// ) =>
//   array.reduce((obj, cur, idx, src) => {
//     const key = getKey(cur, idx, src);
//     (obj[key] || (obj[key] = []))!.push(cur);
//     return obj;
//   }, {} as Partial<Record<K, V[]>>);

// const mergeDeeply = (target: any, source: any, opts: any) => {
//   const isObject = (obj: any) =>
//     obj && typeof obj === 'object' && !Array.isArray(obj);
//   const isConcatArray = opts && opts.concatArray;
//   const result = Object.assign({}, target);
//   if (isObject(target) && isObject(source)) {
//     for (const [sourceKey, sourceValue] of Object.entries(source)) {
//       const targetValue = target[sourceKey];
//       if (
//         isConcatArray &&
//         Array.isArray(sourceValue) &&
//         Array.isArray(targetValue)
//       ) {
//         result[sourceKey] = targetValue.concat(...sourceValue);
//       } else if (
//         isObject(sourceValue) &&
//         Object.prototype.hasOwnProperty.call(target, sourceKey)
//       ) {
//         result[sourceKey] = mergeDeeply(targetValue, sourceValue, opts);
//       } else {
//         Object.assign(result, { [sourceKey]: sourceValue });
//       }
//     }
//   }
//   return result;
// };
