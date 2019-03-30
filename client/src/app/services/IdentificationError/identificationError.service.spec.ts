import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { expect } from "chai";
import { IdentificationError } from "./identificationError.service";

describe("IdentificationError", () => {
    let service: IdentificationError;

    beforeEach(async() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
        });
        service = TestBed.get(IdentificationError);
    });

    it("Should return the correct values after the error is shown", async () => {
        const p: HTMLElement = document.createElement("p");
        const original: HTMLElement = document.createElement("div");
        const modified: HTMLElement = document.createElement("div");
        const time: number = 2000;

        service.setContainers(p, original, modified);
        await service.notify();

        expect(original.style.cursor).to.equal("not-allowed");
        expect(modified.style.cursor).to.equal("not-allowed");
        expect(p.style.cursor).to.equal("not-allowed");

        setTimeout(() => {
            expect(original.style.cursor).to.equal("context-menu");
            expect(modified.style.cursor).to.equal("context-menu");
            expect(p.style.cursor).to.equal("context-menu");
                }, time);
    });

    it("Should return the correct x y after the element is moved", () => {
        const p: HTMLElement = document.createElement("p");
        const original: HTMLElement = document.createElement("div");
        const modified: HTMLElement = document.createElement("div");
        const x: number = 50;
        const y: number = 50;
        service.setContainers(p, original, modified);
        service.moveClickError(x, y);
        expect(p.style.top).to.equal("50px");
        expect(p.style.left).to.equal("50px");
    });
});
