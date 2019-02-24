import { expect } from "chai";
import { ICommonScoreEntry } from "../../../../common/model/gameCard";
import { ScoreGenerator } from "./scoreGenerator";

describe("ScoreGenerator", () => {
    describe("generateScore()", () => {
        it("Should return an empty array if length is zero", () => {
            const entries: ICommonScoreEntry[] = ScoreGenerator.generateScore(0);
            expect(entries.length).to.equal(0);
        });
        it("Should return an empty array if length is less than zero", () => {
            const entries: ICommonScoreEntry[] = ScoreGenerator.generateScore(-1);
            expect(entries.length).to.equal(0);
        });

        it("Should be lower than MAX and MIN value specified", () => {
            const NUMBER_SCORE: number = 100;
            const entries: ICommonScoreEntry[] = ScoreGenerator.generateScore(NUMBER_SCORE);

            expect(entries.filter(
                (x: ICommonScoreEntry) => x.score >= ScoreGenerator.MIN && ScoreGenerator.MAX >= x.score).length,
                ).to.equal(NUMBER_SCORE);
        });
    });
});
