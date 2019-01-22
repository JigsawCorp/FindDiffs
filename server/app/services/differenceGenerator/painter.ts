import { Bitmap } from "../../model/bitmap/bitmap";
import { COLOR, Pixel, Position } from "../../model/bitmap/pixel";

export class Painter {
    private static BRUSH: number[][] = [
        [0, 0, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 0, 0],
    ];

    private originalImage: Bitmap;

    public constructor(originalImage: Bitmap) {
        this.originalImage = originalImage;
    }

    public enlargePixel(pixels: Pixel[], index: number): void {

        const pos: Position =  new Position(index % this.originalImage.width, Math.floor(index / this.originalImage.width));

        // tslint:disable-next-line:no-magic-numbers
        const brushSize: number = Math.floor(Painter.BRUSH.length / 2);
        pos.x -= brushSize;
        pos.y -= brushSize;

        // DRAW the circle around the position
        for (let i: number = 0; i < Painter.BRUSH.length; i++) {
            for (let j: number = 0; j < Painter.BRUSH.length; j++) {
                if (Painter.BRUSH[i][j] === 1) {
                    this.drawPixel(pixels, new Position(pos.x + j, pos.y + i));
                }
            }
        }
    }

    public drawPixel(pixels: Pixel[], pos: Position): void {
        if ( pos.x >= 0 && pos.x <= this.originalImage.width && pos.y >= 0 && pos.y <= this.originalImage.height ) {
            // Calculate the position of the pixel
            const index: number = this.originalImage.width * pos.y + pos.x;
            pixels[index] = Pixel.fromColor(COLOR.BLACK);
        }
    }

}
