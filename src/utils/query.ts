/** SPARQL レスポンスの個々のデータ型 */
type QuerySingleResponseProps = {
  [key: string]: {
    type: string;
    value: string;
    datatype?: string;
  };
};

/** SPARQL レスポンスの基本型 */
type RawResopnseProps = {
  head: {
    vars: string[];
  };
  results: {
    bindings: QuerySingleResponseProps[];
  };
};

/** ISO フォーマットの時刻型 */
type ISOFormat = `${number}-${number}-${number}T${number}:${number}:${number}+09:00`;

/** SPARQL レスポンスパーサーのレスポンスの基本型 */
type GeneralResponseProps = {
  [key: string]: QuerySingleResponseProps;
};

/** GeneralResponseProps のサブタイプ */
type TimeSequentialResponseProps = {
  [key: ISOFormat]: QuerySingleResponseProps[];
};

/** 本モジュールの型 */
export type QueryType = {
  sparql: (opt?: string) => string;
  parser: (e: RawResopnseProps) => GeneralResponseProps | QuerySingleResponseProps[] | TimeSequentialResponseProps;
};

export const getBasicHyleByName: QueryType = {
  sparql: (name) => `
  PREFIX dto2: <https://sdm.hongo.wide.ad.jp/~ino/dto2/ontology.rdf#>
  PREFIX dco: <https://sdm.hongo.wide.ad.jp/~ino/dco/ontology.rdf#>
  PREFIX rsc: <https://sdm.hongo.wide.ad.jp/~ino/dto2/resources/>

  SELECT DISTINCT ?entity ?hyle ?datetime ?vec3 ?sensor WHERE 
  {
      ?entity a             dto2:Entity ;
              dto2:hasName  "${name}" ;
              dto2:hasHyle  ?hyle .
      ?hyle dto2:locatedAt ?coordinates .
      ?observation dto2:captures ?coordinates ;
                   dto2:execute ?coordinstances .
      ?eidos_sensor dto2:sosaMadeObservation ?observation .
      ?sensor dto2:hasEidos ?eidos_sensor .
      ?coordinstances dto2:hasTimestamp ?datetime ;
                      dto2:hasPoint ?point .
      ?point dco:hasVector3 ?_vec3 .
      ?_vec3 dco:element ?vec3 .
  }
  `,
  parser: (e: RawResopnseProps) => {
    const bindings = e.results.bindings as any
    return {
      "entity": bindings[0].entity,
      "hyle": bindings[0].hyle,
      "coordinates": bindings.map((b: GeneralResponseProps) => {
        return {
          datetime: b.datetime,
          vec3: b.vec3,
          sensor: b.sensor
        }
      }
      )
    }
  },
};


export const getBasicEidosByName: QueryType = {
  sparql: (name) => `
  PREFIX dto2: <https://sdm.hongo.wide.ad.jp/~ino/dto2/ontology.rdf#>
  SELECT DISTINCT ?entity ?eidos ?actionName ?datetime ?paramName ?value WHERE
  {
      ?entity a dto2:Entity ;
              dto2:hasName "${name}" ;
              dto2:hasEidos ?eidos .
      ?eidos dto2:hasAction ?action .
      ?action dto2:hasName ?actionName ;
              dto2:execute ?actionInstances .
      ?actionInstances dto2:hasTimestamp ?datetime ;
                       dto2:hasData ?data .
      ?data dto2:hasValue ?value ;
            dto2:references ?ref .
      ?ref dto2:hasName ?paramName .
  }
  `,
  parser: (e: RawResopnseProps) => {
    const bindings = e.results.bindings;
    return {
      entity: bindings[0].entity,
      eidos: bindings[0].eidos,
      actions: bindings.reduce((result, current) => {
        result[current.datetime.value] = {
          ...result[current.datetime.value], ...{
            [current.paramName.value]: current.value.value,
          }
        };
        return result;
      }, {}),
    };
  },
};

export const getBuildingElementEntitiesFromBuilding: QueryType = {
  sparql: (buildingIri) =>  //  e.g. `eidos-ifc_building_3GK5fuZ0H3lBol_s8XFevC`
    `
  PREFIX dto2: <https://sdm.hongo.wide.ad.jp/~ino/dto2/ontology.rdf#>
  PREFIX dco: <https://sdm.hongo.wide.ad.jp/~ino/dco/ontology.rdf#>
  PREFIX rsc: <https://sdm.hongo.wide.ad.jp/~ino/dto2/resources/>

  SELECT DISTINCT ?entity ?eidos ?hyle ?volumeUri ?props ?datetime ?value WHERE 
  {
      ?entity a             dto2:Entity ;
              dto2:hasEidos ?eidos ;
              dto2:hasHyle  ?hyle .
      ?eidos a              dto2:BuildingElement ;
             dto2:locatedIn       ?building ;
             dto2:hasSimpleVolume ?volumeUri ;
             dto2:hasProperty     ?props .
      FILTER(?building = rsc:${buildingIri})
      
      ?props dto2:execute ?instances .
      ?instances dto2:hasTimestamp ?datetime ;
                 dto2:hasData      ?data .
      ?data dto2:hasValue ?value .
  }
  `,
  parser: (e: RawResopnseProps) => {
    const bindings = e.results.bindings;
    const groupedBindings = groupBy(bindings, (i: any) => i.entity.value)
    const groupedGroupedBindings = {} as any
    Object.keys(groupedBindings).forEach((key) => {
      // @ts-ignore
      const pickDistinctKeys = (({ entity, eidos, hyle, volumeUri }) => ({ entity, eidos, hyle, volumeUri }))(groupedBindings[key][0]) as any
      groupedBindings[key]?.forEach((e) => {
        const pickPropKeys = (({ props, datetime, value }) => ({ props, datetime, value }))(e)
        pickDistinctKeys.propsWithValue = {
          ...pickDistinctKeys.propsWithValue,
          ...{ [pickPropKeys.props.value]: pickPropKeys }
        }
      })
      groupedGroupedBindings[key] = pickDistinctKeys
    })
    return groupedGroupedBindings
  },
};

export const getBasicHyleByBuildingElement: QueryType = {
  sparql: (entityIri) => `
  PREFIX dto2: <https://sdm.hongo.wide.ad.jp/~ino/dto2/ontology.rdf#>
  PREFIX dco: <https://sdm.hongo.wide.ad.jp/~ino/dco/ontology.rdf#>
  PREFIX rsc: <https://sdm.hongo.wide.ad.jp/~ino/dto2/resources/>
  
  SELECT DISTINCT ?entity ?hyle ?datetime ?vec3 WHERE 
  {
      ?entity a             dto2:Entity ;
              dto2:hasEidos ?eidos ;
              dto2:hasHyle  ?hyle .
      FILTER(?entity = rsc:${entityIri})
      ?eidos a              dto2:BuildingElement .
      ?hyle dto2:locatedAt ?coordinates .
      ?coordinates dto2:execute ?coordinstances .
      ?coordinstances dto2:hasTimestamp ?datetime ;
                      dto2:hasPoint ?point .
      ?point dco:hasVector3 ?_vec3 .
      ?_vec3 dco:element ?vec3 .
  }
  `,
  parser: (e: RawResopnseProps) => {
    const bindings = e.results.bindings
    return {
      "entity": bindings[0].entity,
      "hyle": bindings[0].hyle,
      "coordinates": bindings.map((b) => {
        return {
          datetime: b.datetime,
          vec3: b.vec3
        }
      })
    }
  }
}

export const getBasicEidosByBuildingElement: QueryType = {
  sparql: (entityIri) => `
  PREFIX dto2: <https://sdm.hongo.wide.ad.jp/~ino/dto2/ontology.rdf#>
  PREFIX dco: <https://sdm.hongo.wide.ad.jp/~ino/dco/ontology.rdf#>
  PREFIX rsc: <https://sdm.hongo.wide.ad.jp/~ino/dto2/resources/>

  SELECT DISTINCT ?entity ?eidos ?volumeUri ?props ?datetime ?value WHERE
  {
      ?entity a             dto2:Entity ;
              dto2:hasEidos ?eidos ;
              dto2:hasHyle  ?hyle .
      FILTER(?entity = rsc:${entityIri})
      ?eidos a              dto2:BuildingElement ;
             dto2:hasSimpleVolume ?volumeUri ;
             dto2:hasProperty ?props .
      ?props dto2:execute ?instances .
      ?instances dto2:hasTimestamp ?datetime ;
                 dto2:hasData      ?data .
      ?data dto2:hasValue ?value .
  }
  `,
  parser: (e: RawResopnseProps) => {
    const bindings = e.results.bindings;
    const pickDistinctKeys = (({ entity, eidos, volumeUri }) => ({ entity, eidos, volumeUri }))(bindings[0]) as any
    bindings?.forEach((e) => {
      const pickPropKeys = (({ props, datetime, value }) => ({ props, datetime, value }))(e)
      pickDistinctKeys.propsWithValue = {
        ...pickDistinctKeys.propsWithValue,
        ...{ [pickPropKeys.props.value]: pickPropKeys }
      }
    })
    return pickDistinctKeys
  }
}

export const getAllBuildingElement: QueryType = {
  sparql: (buildingIri) => `
  PREFIX dto2: <https://sdm.hongo.wide.ad.jp/~ino/dto2/ontology.rdf#>
  PREFIX dco: <https://sdm.hongo.wide.ad.jp/~ino/dco/ontology.rdf#>
  PREFIX rsc: <https://sdm.hongo.wide.ad.jp/~ino/dto2/resources/>

  SELECT DISTINCT ?entity WHERE 
  {
      ?entity dto2:hasEidos ?eidos .
      ?eidos a              dto2:BuildingElement ;
             dto2:locatedIn ?building_eidos .
      ?building dto2:hasEidos ?building_eidos .
      FILTER(?building = rsc:${buildingIri})
  }
  `,
  parser: (e: RawResopnseProps) => {
    return e.results.bindings
  }
}

export const getEidosRelatedEntityByEntity: QueryType = {
  sparql: (entityIri) => `
  PREFIX dto2: <https://sdm.hongo.wide.ad.jp/~ino/dto2/ontology.rdf#>
  PREFIX rsc: <https://sdm.hongo.wide.ad.jp/~ino/dto2/resources/>

  SELECT DISTINCT ?building (GROUP_CONCAT(DISTINCT ?_value; separator=",") AS ?values) WHERE
  {
      ?entity a dto2:Entity ;
              dto2:hasEidos ?eidos .
              FILTER(?entity = rsc:${entityIri})
      ?eidos dto2:locatedIn ?_building_eidos ;
             dto2:hasAction ?_actions .
      ?building dto2:hasEidos ?_building_eidos .
      ?_actions dto2:execute ?_instances .
      ?_instances dto2:hasData ?_data .
      ?_data dto2:hasValue ?_value .
  }
  GROUP BY ?building
  `,
  parser: (e: RawResopnseProps) => {
    const bindings = e.results.bindings
    return {
      "locatedIn": bindings[0].building,
      "affordance": bindings[0].values
    }
  }
}

export const getHyleRelatedEntityByEntity: QueryType = {
  sparql: (entityIri) => `
  PREFIX dto2: <https://sdm.hongo.wide.ad.jp/~ino/dto2/ontology.rdf#>
  PREFIX rsc: <https://sdm.hongo.wide.ad.jp/~ino/dto2/resources/>

  SELECT DISTINCT ?building (GROUP_CONCAT(DISTINCT ?_value; separator=",") AS ?values) WHERE
  {
      ?entity a dto2:Entity ;
              dto2:hasEidos ?eidos .
              FILTER(?entity = rsc:${entityIri})
      ?eidos dto2:locatedIn ?_building_eidos ;
             dto2:hasAction ?_actions .
      ?building dto2:hasEidos ?_building_eidos .
      ?_actions dto2:execute ?_instances .
      ?_instances dto2:hasData ?_data .
      ?_data dto2:hasValue ?_value .
  }
  GROUP BY ?building
  `,
  parser: (e: RawResopnseProps) => {
    const bindings = e.results.bindings
    return {
      "locatedIn": bindings[0].building,
      "affordance": bindings[0].values
    }
  }
}

// ##################################################
// Utils
// ##################################################

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

