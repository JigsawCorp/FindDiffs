import { ICommonSceneObject } from "../sceneObject";

export enum ObjTheme {
    BENCH, BIN, CONE, ECLIPSE, LAMBO, LAMP, LEXUS, SIGN_FORBIDDEN, SIGN_SKIP, SIGN_STOP
};

export enum ThemeSurface {
    GRASS, PARKING, CAR
}

export interface ICommonThematicObject extends ICommonSceneObject {
    isTextured: boolean;
    texture?: string;
    color?: number;
    scale: number;
    objectType: ObjTheme;
}
