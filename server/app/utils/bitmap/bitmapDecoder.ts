import { InvalidFormatException } from "../../../../common/errors/invalidFormatException";
import { Bitmap } from "../../model/bitmap/bitmap";
import { Header, InfoHeader} from "../../model/bitmap/header";
import { Pixel } from "../../model/bitmap/pixel";
import { _e, R } from "../../strings";

export class BitmapDecoder {

    public static FromArrayBuffer(arrayBuffer: ArrayBuffer): Bitmap {
        const header: Header = this.decodeHeader(new DataView(
            arrayBuffer,
            Header.BYTES_OFFSET,
            Header.BYTES_LENGTH,
            ));
        const infoHeader: InfoHeader = this.decodeInfoHeader(new DataView(
            arrayBuffer,
            InfoHeader.BYTES_OFFSET,
            InfoHeader.BYTES_LENGTH,
            ));
        const pixelData: Pixel[] = this.decodePixels(
            new DataView(
                arrayBuffer,
                header.dataOffset[0]),
            infoHeader,
            );

        return new Bitmap(header, infoHeader, pixelData);

    }

    public static fromPixels(pixels: Pixel[], sampleImage: Bitmap): Bitmap {
        const fileSize: number = sampleImage.header.fileSize[0];
        const offSet: number = Header.BYTES_LENGTH + InfoHeader.BYTES_LENGTH;

        const header: Header = new Header(
                new Uint32Array([fileSize]),
                new Uint32Array([offSet]),
            );

        const infoHeader: InfoHeader = new InfoHeader(
                sampleImage.infoHeader.width,
                sampleImage.infoHeader.height,
                sampleImage.infoHeader.xPixelsPerM,
                sampleImage.infoHeader.yPixelsPerM,
            );

        return new Bitmap(header, infoHeader, pixels);
    }

    private static decodeHeader(dataView: DataView): Header {
        if (dataView.getUint16(Header.SIGNATURE_OFFSET) !== Header.SIGNATURE_DECIMAL_CODE) {
            throw new InvalidFormatException(R.ERROR_NOT_BMP_FILE);
        }
        const fileSize: Uint32Array = new Uint32Array(
                [dataView.getUint32(Header.FILE_SIZE_OFFSET, true)],
            );
        const offset: Uint32Array = new Uint32Array(
                [dataView.getUint32(Header.PIXEL_OFFSET, true)],
            );

        return new Header(fileSize, offset);
    }

    private static decodeInfoHeader(dataView: DataView): InfoHeader {
        const width: Int32Array = new Int32Array(
                [dataView.getInt32(InfoHeader.WIDTH_OFFSET, true)],
            );
        if (width[0] !== InfoHeader.EXPECTED_WIDTH) {
            throw new InvalidFormatException(
                    _e(R.ERROR_INVALID_SIZE, [width[0], InfoHeader.EXPECTED_WIDTH]),
                );
        }

        const height: Int32Array = new Int32Array(
                [dataView.getInt32(InfoHeader.HEIGHT_OFFSET, true)],
            );
        if (height[0] !== InfoHeader.EXPECTED_HEIGHT) {
            throw new InvalidFormatException(
                    _e(R.ERROR_INVALID_HEIGHT, [height[0], InfoHeader.EXPECTED_HEIGHT]),
                );
        }

        const xPixelsPerM: Uint32Array = new Uint32Array(
                [dataView.getUint32(InfoHeader.X_PIXELS_PER_M_OFFSET, true)],
            );
        const yPixelsPerM: Uint32Array = new Uint32Array(
                [dataView.getUint32(InfoHeader.Y_PIXELS_PER_M_OFFSET, true)],
            );

        return new InfoHeader(width, height, xPixelsPerM, yPixelsPerM);
    }

    private static decodePixels(dataView: DataView, infoHeader: InfoHeader): Pixel[] {
        const pixelData: Pixel[] = new Array<Pixel>(infoHeader.width[0] * infoHeader.height[0]);

        let pos: number = 0;
        for (let y: number = infoHeader.height[0] - 1; y >= 0; --y) {
           for (let x: number = 0; x < infoHeader.width[0]; ++x) {
               const index: number = y * infoHeader.width[0] + x;

               // tslint:disable-next-line:no-magic-numbers
               pixelData[index] = new Pixel(new Uint8Array([dataView.getUint8(pos + 2)]),
                                            new Uint8Array([dataView.getUint8(pos + 1)]),
                                            new Uint8Array([dataView.getUint8(pos)]));
               pos += Bitmap.BYTES_PER_PIXEL;
           }
           pos += (infoHeader.width[0] % Bitmap.ROW_BYTE_MULTIPLE);
       }

        return pixelData;
    }
}
