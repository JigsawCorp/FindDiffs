import { Component, ElementRef, HostListener, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { ICommonGameCard } from "../../../../common/model/gameCard";
import { ICommonGeometricModifications } from "../../../../common/model/scene/modifications/geometricModifications";
import { ICommonSceneModifications } from "../../../../common/model/scene/modifications/sceneModifications";
import { ICommonScene } from "../../../../common/model/scene/scene";
import { CheatModeTimeoutService } from "../services/cheatMode/cheat-mode-timeout.service";
import { CheatModeService } from "../services/cheatMode/cheat-mode.service";
import { GamesCardService } from "../services/gameCard/games-card.service";
import { SceneService } from "../services/scene/scene.service";
import { SceneLoaderService } from "../services/scene/sceneLoader/sceneLoader.service";
import { SceneSyncerService } from "../services/scene/sceneSyncer/scene-syncer.service";
import { TimerService } from "../services/timer/timer.service";

@Component({
    selector: "app-game-view-free",
    templateUrl: "./game-view-free.component.html",
    styleUrls: ["./game-view-free.component.css"],
    providers: [SceneSyncerService],
})

export class GameViewFreeComponent implements OnInit {
    private static T_KEYCODE: number = 84;

    @ViewChild("originalScene") private originalScene: ElementRef;
    @ViewChild("modifiedScene") private modifiedScene: ElementRef;
    @ViewChild("chronometer") private chronometer: ElementRef;
    @ViewChild("gameTitle") private gameTitle: ElementRef;

    private scenePairID: string;
    private currentOriginalScene: ICommonScene;
    private currentModifiedScene: ICommonSceneModifications;
    private gameCardId: string;
    private originalSceneLoader: SceneLoaderService;
    private modifiedSceneLoader: SceneLoaderService;
    private cheatActivated: boolean;

    public constructor( private route: ActivatedRoute,
                        private spinnerService: Ng4LoadingSpinnerService,
                        public sceneService: SceneService,
                        public timerService: TimerService,
                        public gamesCardService: GamesCardService,
                        private sceneSyncer: SceneSyncerService,
                        public cheatModeService: CheatModeService,
                        private cheatModeTimeoutService: CheatModeTimeoutService) {
        this.originalSceneLoader = new SceneLoaderService();
        this.modifiedSceneLoader = new SceneLoaderService();
        this.cheatActivated = false;
    }

    public ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.gameCardId = params["id"];
        });
        this.spinnerService.show();
        this.getOriginalSceneById();
        this.getGameCardById();
        this.cheatModeTimeoutService.ngOnInit();
    }

    @HostListener("document:keydown", ["$event"])
    public toggleCheatMode(event: KeyboardEvent): void {
        if (event.keyCode === GameViewFreeComponent.T_KEYCODE) {
            this.cheatActivated = !this.cheatActivated;
            if (this.cheatActivated) {
                this.cheatModeService.originalSceneLoaderService = this.originalSceneLoader;
                this.cheatModeService.modifiedSceneLoaderService = this.modifiedSceneLoader;
                this.cheatModeTimeoutService.startCheatMode(this.cheatModeService, this.currentOriginalScene, this.currentModifiedScene);
            } else {
                this.cheatModeTimeoutService.stopCheatMode();
                if (this.cheatModeService.cheatActivated === true) {
                    this.cheatModeService.toggleCheatMode(this.currentOriginalScene,
                                                          (this.currentModifiedScene as ICommonGeometricModifications));
                }
            }
        }
    }

    private getGameCardById(): void {
        this.gamesCardService.getGameById(this.gameCardId).subscribe((gameCard: ICommonGameCard) => {
            this.scenePairID = gameCard.resource_id;
            this.gameTitle.nativeElement.innerText = gameCard.title;
            this.getOriginalSceneById();
        });
    }

    private getOriginalSceneById(): void {
        this.sceneService.getSceneById(this.scenePairID).subscribe((response: ICommonScene) => {
            this.currentOriginalScene = response;
            this.originalSceneLoader.loadOriginalScene(this.originalScene.nativeElement, this.currentOriginalScene, true);
            this.cheatModeService.saveOriginalMaterial(this.currentOriginalScene);
            this.getModifiedSceneById(this.currentOriginalScene);
        });
    }

    private getModifiedSceneById(response: ICommonScene): void {
        this.sceneService.getModifiedSceneById(this.scenePairID).subscribe((responseModified: ICommonSceneModifications) => {
            this.currentModifiedScene = responseModified;
            this.modifiedSceneLoader.loadModifiedScene(this.modifiedScene.nativeElement, response, this.currentModifiedScene);
            this.cheatModeService.saveModifiedMaterial(this.currentOriginalScene, this.currentModifiedScene);
            this.sceneSyncer.syncScenesMovement(this.originalSceneLoader.camera, this.originalScene.nativeElement,
                                                this.modifiedSceneLoader.camera, this.modifiedScene.nativeElement);
            this.spinnerService.hide();
            this.timerService.startTimer(this.chronometer.nativeElement);
        });
    }
}
