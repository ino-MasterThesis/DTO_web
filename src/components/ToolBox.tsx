import React, { FC } from 'react';
import { Stack } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { entityIriState } from '@/states/entityIri';
import { eySwitchState } from '@/states/eySwitch';

type FormProps = {
  entityIri: string;
  toggleEY: boolean;
};

export const Toolbox: FC = () => {
  const { handleSubmit, register } = useForm<FormProps>();
  const setEntityIri = useSetRecoilState(entityIriState);
  const onIriSubmit: SubmitHandler<FormProps> = (data) => {
    const targetIri = data.entityIri;
    const relatedIris =
      targetIri === 'https://sdm.hongo.wide.ad.jp/~ino/dto2/resources/agv'
        ? ['https://sdm.hongo.wide.ad.jp/~ino/dto2/resources/ifc_slab_1XiYcEDvz2JAkbWsVKmZkL']
        : [''];
    setEntityIri(() => {
      return {
        main: targetIri,
        related: relatedIris,
      };
    });
  };
  const [eySwitch, setEYSwitch] = useRecoilState(eySwitchState);
  const onEYSubmit: SubmitHandler<FormProps> = (data) => {
    console.log(eySwitch);
    setEYSwitch((_) => !eySwitch);
  };

  return (
    <>
      <Stack direction="row" spacing={2}>
        <form onSubmit={handleSubmit(onEYSubmit)}>
          <button type="submit" className="text-white bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5">
            Current: {eySwitch ? 'Hyle (Physical world)' : 'Eidos (Digital model)'}
          </button>
        </form>
        <form onSubmit={handleSubmit(onIriSubmit)}>
          <Stack direction="row" spacing={2}>
            <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-400 py-2">EntityIri</label>
            <input
              // rows={14}
              className="block p-2.5 text-xs w-[500px] text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                'https://sdm.hongo.wide.ad.jp/~ino/dto2/resources/ifc_building_element_proxy_0aW3RHcIPE_vpGwWauxXsz'
              }
              {...register('entityIri')}
            ></input>
            <button type="submit" className="text-white bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5">
              OK
            </button>
          </Stack>
        </form>
      </Stack>
    </>
  );
};
