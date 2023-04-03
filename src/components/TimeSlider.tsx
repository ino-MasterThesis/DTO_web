import React, { FC } from 'react';
import { useRecoilState } from 'recoil';
import { Slider } from '@mui/material';
import { timeSliderValueState } from '@/states/timeSliderValue';

export const TimeSlider: FC = () => {
  const [timeSliderValue, setTimeSliderValue] =
    useRecoilState(timeSliderValueState);

  return (
    <>
      <Slider
        aria-label="Time Slider"
        defaultValue={0}
        marks
        min={0}
        max={65}
        valueLabelDisplay="auto"
        value={timeSliderValue}
        onChange={(_, val) =>
          setTimeSliderValue((_) => (Array.isArray(val) ? val[0] : val))
        }
      />
    </>
  );
};
