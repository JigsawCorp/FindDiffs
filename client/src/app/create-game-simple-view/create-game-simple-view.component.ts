import { Component, ElementRef, EventEmitter, Output, ViewChild } from "@angular/core";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { Message } from "../../../../common/communication/message";
import { ICommonGameCard, POVType } from "../../../../common/model/gameCard";
import { ICommonImagePair } from "../../../../common/model/imagePair";
import { HTMLInputEvent } from "../htmlinput-event";
import { FormVerificationSimplePOVService } from "../services/createGame/formVerificationSimplePOV.service";
import { GameCardLoaderService } from "../services/gameCard/gameCardLoader.service";
import { GamesCardService } from "../services/gameCard/gamesCard.service";
import { ImagePairService } from "../services/image-pair/imagePair.service";

@Component({
    selector: "app-create-game-simple-view",
    templateUrl: "./create-game-simple-view.component.html",
    styleUrls: ["./create-game-simple-view.component.css"],
})
export class CreateGameSimpleViewComponent {
    @Output() public closed: EventEmitter<boolean>;
    @ViewChild("gameNameInput") private gameNameInput: ElementRef;
    @ViewChild("originalFile") private originalFile: ElementRef;
    @ViewChild("modifiedFile") private modifiedFile: ElementRef;

    public canSubmit: boolean;
    public fromValidation: boolean[];

    private originalImageFile: File;
    private modifiedImageFile: File;
    private gameName: string;
    public firstNameInput: boolean;
    public firstOriginalImageInput: boolean;
    public firstModifiedImageInput: boolean;

    public constructor(private gamesCardService: GamesCardService,
                       private imagePairService: ImagePairService,
                       private spinnerService: Ng4LoadingSpinnerService,
                       private gameCardLoaderService: GameCardLoaderService,
                       private formVerificationSimplePOVService: FormVerificationSimplePOVService) {
        this.canSubmit = false;
        this.fromValidation = [false, false, false, false, false];
        this.closed = new EventEmitter();
        this.firstNameInput = false;
        this.firstOriginalImageInput = false;
        this.firstModifiedImageInput = false;
    }

    public isNameValid(): boolean {
            this.gameName = this.gameNameInput.nativeElement.value;
            this.fromValidation[0] = this.formVerificationSimplePOVService.isNameValid(this.gameName);

            return this.fromValidation[0];
    }

    public isOriginalFileValid(): boolean {
       return this.formVerificationSimplePOVService.isOriginalFileValid(this.fromValidation);
    }

    public isModifiedFileValid(): boolean {
        return this.formVerificationSimplePOVService.isModifiedFileValid(this.fromValidation);
    }

    public nameInputVisited(): void {
        this.firstNameInput = true;
    }

    public originalImageVisited(): void {
        this.firstOriginalImageInput = true;
    }

    public modifiedImageVisited(): void {
        this.firstModifiedImageInput = true;
    }

    public fileEvent(event: HTMLInputEvent, fileId: number): void {
        if (event.target.files != null) {
            const files: FileList = event.target.files;
            const fileName: string = files[0].name;
            const IMAGE_WIDTH: number = 640;
            const IMAGE_HEIGHT: number = 480;
            const VALIDATION_MODIFIER: number = 2;

            const url: string = window.URL.createObjectURL(files[0]);
            const img: HTMLImageElement = new Image();

            img.onload = () => {
                this.fromValidation[VALIDATION_MODIFIER + fileId] =
                    (img.naturalWidth === IMAGE_WIDTH && img.naturalHeight === IMAGE_HEIGHT);
            };
            img.src = url;
            this.fromValidation[fileId] = fileName.split(".")[1] === "bmp";

            if (fileId === 1) {
                this.originalImageFile = event.target.files[0];
                this.originalFile.nativeElement.innerText = this.originalImageFile.name;
            } else {
                this.modifiedImageFile = event.target.files[0];
                this.modifiedFile.nativeElement.innerText = this.modifiedImageFile.name;
            }

        }
    }

    public verifyInfo(): void {
        this.canSubmit = this.formVerificationSimplePOVService.verifyInfo(this.fromValidation);
    }

    public addImagePair(): void {
        this.spinnerService.show();
        this.imagePairService.addImagePair(this.gameName, this.originalImageFile, this.modifiedImageFile)
            .subscribe((response: ICommonImagePair | Message) => {
                if ((response as Message).body) {
                    alert((response as Message).body);
                } else {
                    this.addGameCard((response as ICommonImagePair).id);
                }
            });
    }

    private addGameCard(imagePairId: string): void {
        this.gamesCardService.addGameCard(this.gameName, imagePairId, POVType.Simple)
            .subscribe((response: ICommonGameCard | Message) => {
                if ((response as Message).body) {
                    alert((response as Message).body);
                } else {
                    this.hideView();
                    this.gameCardLoaderService.addDynamicComponent((response as ICommonGameCard), true);
                    this.spinnerService.hide();
                    alert("Simple game created!");
                }
            });
    }

    public hideView(): void {
        this.closed.emit(true);
    }
}
