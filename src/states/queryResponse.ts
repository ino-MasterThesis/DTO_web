import { atom } from 'recoil';

type KV = {
  [key: string]: string;
  value: string;
};

interface Data {
  [key: string]: KV;
}
export const queryResponseState = atom({
  key: 'queryReponseState',
  default: { results: { bindings: [{} as Data] } },
});
