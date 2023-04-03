import { Vector3, Matrix4, Quaternion, Object3D } from 'three';

export const applyMatricesToObj = (obj: Object3D, mat: number[]) => {
  const [x, y, z] = convertLeftHandToRightHand(mat[3], mat[7], mat[11]);
  multiplyMatrix(
    obj,
    new Matrix4().set(
      mat[0],
      mat[1],
      mat[2],
      x,
      mat[4],
      mat[5],
      mat[6],
      y,
      mat[8],
      mat[9],
      mat[10],
      z,
      mat[12],
      mat[13],
      mat[14],
      mat[15]
    )
  );
};

const convertLeftHandToRightHand = (x: number, y: number, z: number) => {
  return [x, z, -y];
};

export const translate = (o: Object3D, v: number[]) => {
  const trans = new Matrix4().makeTranslation(v[0], v[1], v[2]);
  multiplyMatrix(o, trans);
};

export const rotate = (o: Object3D, angle: number, axis: number[]) => {
  const q = new Quaternion();
  q.setFromAxisAngle(new Vector3(...axis).normalize(), angle);
  const rot = new Matrix4().makeRotationFromQuaternion(q);
  multiplyMatrix(o, rot);
};

export const scale3D = (o: Object3D, v: number[]) => {
  const scale = new Matrix4().makeScale(v[0], v[1], v[2]);
  multiplyMatrix(o, scale);
};

const multiplyMatrix = (o: Object3D, mat: Matrix4) => {
  o.matrix.premultiply(mat); // 行列積の順番に注意。.multiply は後ろから掛ける
};
