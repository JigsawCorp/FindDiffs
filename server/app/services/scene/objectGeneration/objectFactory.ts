import * as uuid from "uuid";
import { ICommon3DPosition } from "../../../../../common/model/positions";
import { ICommonEulerAngles } from "../../../../../common/model/scene/eulerAngles";
import { ICommonSceneObject } from "../../../../../common/model/scene/objects/sceneObject";
import { ObjectType } from "../../../../../common/model/scene/scene";
import { RandomUtils } from "../../../utils/randomUtils";

export abstract class ObjectFactory {
    public static readonly SIZE_MAX_PERCENTAGE: number = 150;
    public static readonly SIZE_MIN_PERCENTAGE: number = 50;

    // tslint:disable-next-line:no-magic-numbers
    public static readonly MAX_RADIAN_ANGLE: number = Math.PI * 2;
    public static readonly MIN_RADIAN_ANGLE: number = 0;
    public static readonly PERCENTAGE_DIVISION: number = 100;

    protected object: ICommonSceneObject;

    public createObject(position: ICommon3DPosition): ICommonSceneObject {
        this.object = {
            id: uuid().replace(/-/g, ""),
            orientation: this.generateRandomOrientation(),
            position: position,
            type: this.getFactoryType(),
        };
        this.postCreate();

        return this.object;
    }

    protected generateRandomPercentage(): number {
        return RandomUtils.inRange(
            ObjectFactory.SIZE_MIN_PERCENTAGE,
            ObjectFactory.SIZE_MAX_PERCENTAGE,
        ) / ObjectFactory.PERCENTAGE_DIVISION;
    }

    protected generateRandomRadianAngle(): number {
        return RandomUtils.inRange(ObjectFactory.MIN_RADIAN_ANGLE, ObjectFactory.MAX_RADIAN_ANGLE);
    }

    protected abstract getFactoryType(): ObjectType;
    protected abstract generateRandomOrientation(): ICommonEulerAngles;
    protected abstract postCreate(): void;
}
