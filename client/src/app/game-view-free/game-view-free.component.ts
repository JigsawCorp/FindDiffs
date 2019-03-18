import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import * as THREE from "three";
import { v4 as uuid } from "uuid";
import { ICommonGameCard } from "../../../../common/model/gameCard";
import { ICommonReveal3D } from "../../../../common/model/reveal";
import { ICommonSceneModifications } from "../../../../common/model/scene/modifications/sceneModifications";
import { ICommonScene } from "../../../../common/model/scene/scene";
import { GeometricObjectsService } from "../services/3DObjects/GeometricObjects/geometric-objects.service";
import { ObjectRestoration } from "../services/3DObjects/GeometricObjects/object-restoration";
import { DifferenceTypeObject3D } from "../services/differenceTypeObject3D";
import { GamesCardService } from "../services/gameCard/games-card.service";
import { SceneService } from "../services/scene/scene.service";
import { SceneLoaderService } from "../services/scene/sceneLoader/sceneLoader.service";
import { TimerService } from "../services/timer/timer.service";
// import { SocketService } from "../services/socket/socket.service";

@Component({
    selector: "app-game-view-free",
    templateUrl: "./game-view-free.component.html",
    styleUrls: ["./game-view-free.component.css"],
})
export class GameViewFreeComponent implements OnInit {
    @ViewChild("originalScene") private originalScene: ElementRef<HTMLElement>;
    @ViewChild("modifiedScene") private modifiedScene: ElementRef<HTMLElement>;
    @ViewChild("chronometer") private chronometer: ElementRef;
    @ViewChild("gameTitle") private gameTitle: ElementRef;

    private scenePairId: string;
    private gameCardID: string;
    private originalSceneLoader: SceneLoaderService;
    private modifiedSceneLoader: SceneLoaderService;
    private differenceFound: string[];

    public playerTime: string;
    public differenceCounterUser: number;
    public isGameOver: boolean;

    private meshesOriginal: THREE.Object3D[] = [];
    private meshesModified: THREE.Object3D[] = [];
    private intersectsOriginal: THREE.Intersection[];
    private intersectsModified: THREE.Intersection[];

    public constructor(
        private route: ActivatedRoute,
        private spinnerService: Ng4LoadingSpinnerService,
        // private socketService: SocketService,
        public sceneService: SceneService,
        public timerService: TimerService,
        public gamesCardService: GamesCardService,
        public geometricObjectService: GeometricObjectsService,
        public objectRestoration: ObjectRestoration,
        ) {
        this.originalSceneLoader = new SceneLoaderService();
        this.modifiedSceneLoader = new SceneLoaderService();
        this.differenceCounterUser = 0;
        this.isGameOver = false;
        this.differenceFound = [];
    }

    public ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.gameCardID = params["id"];
        });
        this.spinnerService.show();
        this.getGameCardById();
    }

    private getGameCardById(): void {
        this.gamesCardService.getGameById(this.gameCardID).subscribe((gameCard: ICommonGameCard) => {
            this.scenePairId = gameCard.resource_id;
            this.gameTitle.nativeElement.innerText = gameCard.title;
            this.getOriginalSceneById();
        });
    }

    private getOriginalSceneById(): void {
        this.sceneService.getSceneById(this.scenePairId).subscribe((response: ICommonScene) => {
            this.originalSceneLoader.loadOriginalScene(this.originalScene.nativeElement, response, true);
            this.getModifiedSceneById(response);
        });
    }

    // tslint:disable
    public clickOnScene(event: MouseEvent, isOriginalScene: boolean): void {
        const obj: {sceneLoader: SceneLoaderService, HTMLElement: ElementRef<HTMLElement>} = this.isOriginalSceneClick(isOriginalScene);
        const raycaster: THREE.Raycaster = new THREE.Raycaster();
        const mouse: THREE.Vector2 = new THREE.Vector2();

        this.setMousePosition(event, mouse, obj.HTMLElement);

        raycaster.setFromCamera(mouse, this.originalSceneLoader.camera );

        this.intersectsOriginal = raycaster.intersectObjects( this.meshesOriginal );
        this.intersectsModified = raycaster.intersectObjects( this.meshesModified );

        let modifiedObjectId: string = this.intersectsModified[0] ? this.intersectsModified[0].object.id.toString() : uuid();

        this.geometricObjectService.post3DObject(this.scenePairId, modifiedObjectId)
            .subscribe(async (response: ICommonReveal3D) => {
                const differenceType: DifferenceTypeObject3D = this.objectRestoration.restoreObject(response.hit, this.intersectsOriginal, this.intersectsModified);

                switch (differenceType){
                    case DifferenceTypeObject3D.addObject: {
                        this.addObject(this.intersectsOriginal[0].object);
                        break;
                    }
                    case DifferenceTypeObject3D.removeObject: {
                        this.removeObject(this.intersectsModified[0].object);
                        break;
                    }
                    case DifferenceTypeObject3D.colorObject: {
                        this.changeColorObject(this.intersectsOriginal[0].object, this.intersectsModified[0].object);
                        break;
                    }
                    default: {
                        this.error();
                        break;
                    }
                }
        
                if (this.differenceCounterUser === 7) {
                    this.gameOver();
                }
                //this.manageDifferences(differenceType, this.intersectsOriginal[0].object, this.intersectsModified[0].object);
            });
    }
/*
    private manageDifferences (differenceType: DifferenceTypeObject3D, objectOriginal: THREE.Object3D, objectModified: THREE.Object3D) {

        switch (differenceType){
            case DifferenceTypeObject3D.addObject: {
                this.addObject(objectOriginal);
                break;
            }
            case DifferenceTypeObject3D.removeObject: {
                this.removeObject(objectModified);
                break;
            }
            case DifferenceTypeObject3D.colorObject: {
                this.changeColorObject(objectOriginal, objectModified);
                break;
            }
            default: {
                this.error();
                break;
            }
        }

        if (this.differenceCounterUser === 7) {
            this.gameOver();
        }
    }*/

    private addObject(objectOriginal: THREE.Object3D) {
        if (this.isANewDifference(objectOriginal.uuid)) {
            this.modifiedSceneLoader.scene.add(objectOriginal.clone());
            this.differenceFound[this.differenceCounterUser] = objectOriginal.uuid;
            this.differenceCounterUser++;
        }
    }

    private removeObject(objectModified: THREE.Object3D) {
        if (this.isANewDifference(objectModified.uuid)) {
            this.modifiedSceneLoader.scene.remove(objectModified);
            this.differenceFound[this.differenceCounterUser] = objectModified.uuid;
            this.differenceCounterUser++;
        }
    }

    private changeColorObject(objectOriginal: THREE.Object3D, objectModified: THREE.Object3D) {
        let intersectedModified: any;
        let intersectedOriginal: any;
        intersectedOriginal = objectOriginal;
        intersectedModified = objectModified;

        if (this.isANewDifference(objectModified.uuid)) {
            intersectedModified.material.color.setHex(intersectedOriginal.material.color.getHex());
            this.differenceFound[this.differenceCounterUser] = objectModified.uuid;
            this.differenceCounterUser++;
        }
    }

    private error () {

    }

    private isOriginalSceneClick(isOriginalScene: boolean): { sceneLoader: SceneLoaderService, HTMLElement: ElementRef<HTMLElement> } {
        let sceneLoader: SceneLoaderService;
        // tslint:disable:variable-name
        let HTMLElement: ElementRef<HTMLElement>;
        if (isOriginalScene) {
            sceneLoader = this.originalSceneLoader;
            HTMLElement = this.originalScene;
        } else {
            sceneLoader = this.modifiedSceneLoader;
            HTMLElement = this.modifiedScene;
        }

        return {
            sceneLoader: sceneLoader,
            HTMLElement: HTMLElement,
        };
    }

    private setMousePosition(event: MouseEvent, mouse: THREE.Vector2, HTMLElement: ElementRef<HTMLElement>): void {
        const divBoxInformation: ClientRect | DOMRect = HTMLElement.nativeElement.getBoundingClientRect();
        const differenceX: number = event.clientX - divBoxInformation.left;
        const differenceY: number = event.clientY - divBoxInformation.top;
        // tslint:disable:no-magic-numbers
        mouse.x = (differenceX / HTMLElement.nativeElement.clientWidth) * 2 - 1;
        mouse.y = -(differenceY / HTMLElement.nativeElement.clientHeight) * 2 + 1;
    }

    private getModifiedSceneById(response: ICommonScene): void {
        this.sceneService.getModifiedSceneById(this.scenePairId).subscribe((responseModified: ICommonSceneModifications) => {
            this.modifiedSceneLoader.loadModifiedScene(this.modifiedScene.nativeElement, response, responseModified);
            SceneLoaderService.syncScenes(this.originalSceneLoader.camera, this.originalSceneLoader.controls,
                                          this.modifiedSceneLoader.camera, this.modifiedSceneLoader.controls);
            this.spinnerService.hide();
            this.timerService.startTimer(this.chronometer.nativeElement);

            this.fillMeshes(this.meshesOriginal, this.originalSceneLoader);
            this.fillMeshes(this.meshesModified, this.modifiedSceneLoader);
        });
    }

    private fillMeshes(meshes: THREE.Object3D[], sceneLoader: SceneLoaderService): void {
        sceneLoader.scene.children.forEach((element) => {
            if (element.type === "Mesh") {
                meshes.push(element);
            }
        });
    }

    public isANewDifference(differenceId: string): boolean {
        return !this.differenceFound.includes(differenceId);
    }

    private gameOver(): void {
        this.timerService.stopTimer();
        this.playerTime = ((this.chronometer.nativeElement) as HTMLElement).innerText;
        this.isGameOver = true;
    }
}
