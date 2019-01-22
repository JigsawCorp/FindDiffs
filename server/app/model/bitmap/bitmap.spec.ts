import {expect} from "chai";
import { Bitmap } from "./bitmap";
import {readFileSync, writeFileSync} from 'fs';
import { Pixel } from "../pixel";
import { BitmapEncoder } from "../../utility/bitmapEncoder";
import { BitmapDecoder } from "../../utility/bitmapDecoder";
import { DifferenceImageGenerator } from "../../services/differenceImageGenerator";
//import { DifferenceImageGenerator } from "../../services/differenceImageGenerator";
/* tslint:disable:no-magic-numbers */

describe("Bitmap", () => {
    it("Should return a pixel with RGB value of (12, 44, 0)", () => {
        const pixel: Pixel = new Pixel(new Uint8Array([12]), new Uint8Array([44]), new Uint8Array([0]));
        expect(pixel.red[0]).to.equal(new Uint8Array([12])[0]);
        expect(pixel.green[0]).to.equal(new Uint8Array([44])[0]);
        expect(pixel.blue[0]).to.equal(new Uint8Array([0])[0]);
    });

    it("Should return true when comparing two different pixels with the same values", () => {
        const pixel1: Pixel = new Pixel(new Uint8Array([10]), new Uint8Array([77]), new Uint8Array([22]));
        const pixel2: Pixel = new Pixel(new Uint8Array([10]), new Uint8Array([77]), new Uint8Array([22]));

        expect(pixel1.equals(pixel2)).to.equal(true);
    });

    it("Should return false when comparing two different pixels with different values", () => {
        const pixel1: Pixel = new Pixel(new Uint8Array([10]), new Uint8Array([77]), new Uint8Array([72]));
        const pixel2: Pixel = new Pixel(new Uint8Array([17]), new Uint8Array([71]), new Uint8Array([22]));

        expect(pixel1.equals(pixel2)).to.equal(false);
    });

    it("read bmp", () => {
        let path = require('path');
        // Original image
        let bitmap: Bitmap = BitmapDecoder.decodeFromArrayBuffer(readFileSync(
            path.resolve(__dirname,"../../../test/testBitmaps/FLAG_B24.BMP")).buffer);
        // Edited image
        let bitmapEdited: Bitmap = BitmapDecoder.decodeFromArrayBuffer(readFileSync(
            path.resolve(__dirname,"../../../test/testBitmaps/FLAG_B24_EDITED.BMP")).buffer);
     
        // Create generator
        let generator: DifferenceImageGenerator = new DifferenceImageGenerator(bitmap, bitmapEdited);
        // The bitmap created by the algorithm
        let finalMap: Bitmap = BitmapDecoder.fromPixels(generator.generateImage(), bitmap);
     
        // Write the new map made by algorithm
        writeFileSync("testing123.bmp", new Buffer(BitmapEncoder.encodeBitmap(finalMap)));




        expect(bitmap.header.fileSize).to.equal("");
    });

});
