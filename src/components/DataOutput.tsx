import React, { FC } from 'react';
import { useRecoilValue } from 'recoil';
import { queryResponseState } from '@/states/queryResponse';

export const DataOutput: FC = () => {
  const stData = useRecoilValue(queryResponseState);
  return <div className="text-xs">{JSON.stringify(stData)}</div>;
};
