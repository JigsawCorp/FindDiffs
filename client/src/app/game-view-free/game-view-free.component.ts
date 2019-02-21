import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import "src/js/test";
import "node_modules/three/examples/js/controls/OrbitControls";
import * as THREE from "three";
import { ICommonSceneModifications } from "../../../../common/model/scene/modifications/sceneModifications";
import { ICommonScene } from "../../../../common/model/scene/scene";
import { SceneService } from "../services/scene/scene.service";
import { ModifiedSceneParserService } from "../services/scene/sceneParser/modified-scene-parser.service";
import { SceneParserService } from "../services/scene/sceneParser/scene-parser.service";
import { CameraGenerator } from "../services/scene/sceneRenderer/cameraGenerator";
import { SceneRendererService } from "../services/scene/sceneRenderer/scene-renderer.service";

@Component({
    selector: "app-game-view-free",
    templateUrl: "./game-view-free.component.html",
    styleUrls: ["./game-view-free.component.css"],
})
export class GameViewFreeComponent implements OnInit {
    @ViewChild("originalScene") private originalScene: ElementRef;
    @ViewChild("modifiedScene") private modifiedScene: ElementRef;
    private scenePairID: string;

    public constructor(
        private route: ActivatedRoute,
        public sceneService: SceneService) {
    }

    public ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.scenePairID = params["id"];
        });

        this.getScenePairById();
    }

    private getScenePairById(): void {
        this.sceneService.getSceneById(this.scenePairID).subscribe((response: ICommonScene) => {
            this.loadOriginalScene(this.originalScene.nativeElement, response);
            this.loadModifiedScene(this.modifiedScene.nativeElement, response);
        });
    }

    // tslint:disable:no-any
    public loadOriginalScene(div: HTMLElement | null, scene: ICommonScene): void {
        if (div !== null) {
            const sceneRendererService: SceneRendererService = new SceneRendererService();
            const renderer: THREE.WebGLRenderer = sceneRendererService.generateRender(div.clientWidth, div.clientHeight);

            div.appendChild(renderer.domElement);

            const sceneOriginal: THREE.Scene = new SceneParserService().parseScene(scene);
            const camera: THREE.PerspectiveCamera = CameraGenerator.createCamera(div.clientWidth, div.clientHeight);
            const controls: THREE.OrbitControls = new THREE.OrbitControls(camera, renderer.domElement);

            const animate: any = (): void => {
                requestAnimationFrame(animate);
                sceneRendererService.renderScene(sceneOriginal, renderer, camera);
                controls.update();
            };
            animate();
        }
    }

    public loadModifiedScene(div: HTMLElement | null, scene: ICommonScene): void {
        // const addObject: boolean = scene.;
        this.sceneService.createModifiedScene(scene.id, true, true, true).subscribe((modifications: ICommonSceneModifications) => {
            if (div !== null) {
                const sceneRendererService: SceneRendererService = new SceneRendererService();
                const renderer: THREE.WebGLRenderer = sceneRendererService.generateRender(div.clientWidth, div.clientHeight);

                div.appendChild(renderer.domElement);

                const sceneModified: THREE.Scene = new ModifiedSceneParserService().parseModifiedScene(scene, modifications);
                const camera: THREE.PerspectiveCamera = CameraGenerator.createCamera(div.clientWidth, div.clientHeight);
                const controls: THREE.OrbitControls = new THREE.OrbitControls(camera, renderer.domElement);

                const animate: any = (): void => {
                    requestAnimationFrame(animate);
                    sceneRendererService.renderScene(sceneModified, renderer, camera);
                    controls.update();
                };
                animate();
            }
        });
    }
}
