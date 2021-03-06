import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { expect } from "chai";
import * as sinon from "sinon";
import { ICommonDifferenceFound } from "../../../../../common/communication/webSocket/differenceFound";
import { Event, ICommonSocketMessage } from "../../../../../common/communication/webSocket/socketMessage";
import { GameService } from "./game.service";

// tslint:disable-next-line:only-arrow-functions
async function timeout(ms: number): Promise<Object> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("GameService", () => {
    let service: GameService;
    const time: number = 2000;
    let sin: sinon.SinonStub;

    beforeEach(async() => {
        sessionStorage.setItem("user", "player");
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
        });
        service = TestBed.get(GameService);
    });

    beforeEach(() => {
        sin = sinon.stub(Audio.prototype, "play");
    });

    afterEach(() => {
        sin.restore();
    });

    describe("getGameStarted() and getTimeValues()", async () => {

        it("Should return the correct time after game start", async () => {

            const msg: ICommonSocketMessage = { data: "", timestamp: new Date()};
            await service.notify(Event.GameStarted, msg);
            expect(service.getGameStarted()).to.equal(true);
            expect(service.getTimeValues()).to.equal("00:00");
            await timeout(time);
            await service.notify(Event.GameEnded, msg);
        });

        it("Should return 00:00 if the event is not supported", async () => {

            const msg: ICommonSocketMessage = { data: "", timestamp: new Date()};
            await service.notify(Event.InvalidClick, msg);
            expect(service.getTimeValues()).to.equal("00:00");
            await timeout(time);
            await service.notify(Event.GameEnded, msg);
            expect(service.getTimeValues()).to.equal("00:00");
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
            const msg: ICommonSocketMessage = { data: "", timestamp: new Date()};
            await service.notify(Event.GameStarted, msg);
            await timeout(time);
            service.resetTime();
            expect(service.getTimeValues()).to.equal("00:00");
        });
    });

    describe("getGameStarted", () => {
        it("Should return true after game started", async () => {
            const msg: ICommonSocketMessage = { data: "", timestamp: new Date()};
            await service.notify(Event.GameStarted, msg);
            await timeout(time);
            expect(service.getGameStarted()).to.equal(true);
        });
        it("Should return false if game hasnt started yet", async () => {
            expect(service.getGameStarted()).to.equal(false);
        });
    });
});
