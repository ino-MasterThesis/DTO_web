import React from 'react';
import { RecoilRoot } from 'recoil';
import { DigitalTwinApp } from './components/DigitalTwinApp';
import './App.css';

export default function App() {
  return (
    <RecoilRoot>
      <DigitalTwinApp />
    </RecoilRoot>
  );
}
