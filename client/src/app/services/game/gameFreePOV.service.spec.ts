import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { expect } from "chai";
import { ICommonDifferenceFound } from "../../../../../common/communication/webSocket/differenceFound";
import { Event, ICommonSocketMessage } from "../../../../../common/communication/webSocket/socketMessage";
import { SceneSyncerService } from "../scene/sceneSyncer/sceneSyncer.service";
import { GameFreePOVService } from "./gameFreePOV.service";

describe("GameFreePOVService", () => {
    let service: GameFreePOVService;
    const time: number = 2000;

    beforeEach(async() => {
        sessionStorage.setItem("user", "player");
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
        });
        service = TestBed.get(GameFreePOVService);
    });

    describe("startGame and stopGame", () => {

        it("Should return the correct time after game start and end after 2 sec", async () => {
            const scene: SceneSyncerService = new SceneSyncerService();
            service.setControls(scene);
            const msg: ICommonSocketMessage = { data: "", timestamp: new Date()};
            await service.notify(Event.GameStarted, msg);
            expect(service.getGameStarted()).to.equal(true);
            expect(service.getTimeValues()).to.equal("00:00");
            setTimeout(async() => {
                await service.notify(Event.GameEnded, msg);
                expect(service.getTimeValues()).to.equal("00:02");
                    }, time);
        });

        it("Should return 00:00 if the event is not supported", async () => {
            const scene: SceneSyncerService = new SceneSyncerService();
            service.setControls(scene);
            const msg: ICommonSocketMessage = { data: "", timestamp: new Date()};
            await service.notify(Event.InvalidClick, msg);
            expect(service.getTimeValues()).to.equal("00:00");
            setTimeout(async() => {
                await service.notify(Event.GameEnded, msg);
                expect(service.getTimeValues()).to.equal("00:00");
                    }, time);
        });

        it("Should unlock controls when the game start and lock controls when game end", async () => {
            const scene: SceneSyncerService = new SceneSyncerService();
            service.setControls(scene);
            const msg: ICommonSocketMessage = { data: "", timestamp: new Date()};
            await service.notify(Event.GameStarted, msg);
            expect(scene.isLocked).to.equal(false);
            setTimeout(async() => {
                await service.notify(Event.GameEnded, msg);
                expect(scene.isLocked).that.equal(true);
                    }, time);
        });
    });

    describe("differencefound", () => {

        it("Should return the correct count after a difference is found by player", async () => {
            let difference: string = "0";
            const diff: ICommonDifferenceFound = { player: "player", difference_count: 2, reveal: {}};
            const msg: ICommonSocketMessage = { data: diff, timestamp: new Date()};

            service.differenceUser.subscribe((value) => {
                difference = value;
            });

            await service.notify(Event.DifferenceFound, msg);
            expect(difference).to.equal("2");
        });

        it("Should return the correct count after a difference is found by opponent", async () => {
            let difference: string = "0";
            const diff: ICommonDifferenceFound = { player: "opponent", difference_count: 2, reveal: {}};
            const msg: ICommonSocketMessage = { data: diff, timestamp: new Date()};

            service.differenceOpponent.subscribe((value) => {
                difference = value;
            });

            await service.notify(Event.DifferenceFound, msg);
            expect(difference).to.equal("2");
        });
    });

    describe("resetTime", () => {
        it("Should return 00:00 after resettime", async () => {
            const scene: SceneSyncerService = new SceneSyncerService();
            service.setControls(scene);
            const msg: ICommonSocketMessage = { data: "", timestamp: new Date()};
            await service.notify(Event.GameStarted, msg);
            setTimeout(async() => {
                service.resetTime();
                expect(service.getTimeValues()).to.equal("00:00");
                    }, time);
        });
    });

    describe("getGameStarted", () => {
        it("Should return true after game started", async () => {
            const scene: SceneSyncerService = new SceneSyncerService();
            service.setControls(scene);
            const msg: ICommonSocketMessage = { data: "", timestamp: new Date()};
            await service.notify(Event.GameStarted, msg);
            setTimeout(async() => {
                expect(service.getGameStarted()).to.equal(true);
                    }, time);
        });
        it("Should return false if game hasnt started yet", async () => {
            expect(service.getGameStarted()).to.equal(false);
        });
    });
});