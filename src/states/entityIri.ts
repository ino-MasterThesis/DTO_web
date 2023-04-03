import { atom } from 'recoil'

export const entityIriState = atom({
  key: 'entityIriState',
  default: { main: '', related: [""] }
})
