import * as BABYLON from 'babylonjs';

interface AvatarChangeInterface {
  sender: string; // peerId
  index: number; // avatar index
  amount?: number;
}

interface PenlightChangeInterface {
  sender: string;
  color: number;
}

declare type BodyParts = 'leftShoulder' | 'leftElbow' | 'leftWrist' | 'rightShoulder' | 'rightElbow' | 'rightWrist' | 'head';

declare type AvatarBones = { [BoneBody in BodyParts]: BABYLON.TransformNode };
declare type AvatarOriginalBones = { [BoneBody in BodyParts]: BABYLON.Quaternion };

// export type FaceDirection<K extends keyof any, T> = {
//   [Direction in K]: T;
// };

declare type Model = {
  bones: AvatarBones;
  originalBones: AvatarOriginalBones;
  scene: BABYLON.Scene;
};
export type { Model, BodyParts, AvatarBones, AvatarOriginalBones, AvatarChangeInterface, PenlightChangeInterface };
