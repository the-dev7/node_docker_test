const ffmpegStatic = require("ffmpeg-static");
const path = require('path');
const fs = require('fs');

const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegStatic);
console.log(ffmpegStatic);

const getNameForCompressedFile = (fileName, additionalString) => {
    const fileExt = path.extname(fileName);
    let extraString = "";
    if (additionalString) {
        extraString = `_${additionalString}`
    }
    return path.basename(fileName, fileExt) + extraString + "_compressed" + fileExt;
}

const compressImage = (inputPath, outputFileName, quality) => {
    return new Promise((resolve, reject) => {
        const outputFilePath = path.join(__dirname, 'uploads/images/', outputFileName);
        let time = performance.now();
        ffmpeg(inputPath)
            .output(outputFilePath)
            .outputOptions([
                '-vf', `scale=-1:-1`, // Keeps the original dimensions
                `-q:v ${quality}`     // Controls the compression quality: lower is better quality (range 1-31)
            ])
            .on('end', () => {
                console.log("Compression completed!");
                try {
                    const originalSize = fs.statSync(inputPath).size;
                    const compressedSize = fs.statSync(outputFilePath).size;

                    // Remove the input file
                    fs.unlinkSync(inputPath);

                    resolve({
                        message: 'Image Compressed Successfully',
                        data: {
                            fileName: outputFileName,
                            filePath: outputFilePath,
                            compressionStrength: quality,
                            original: {
                                size: (originalSize / (1024 * 1024)).toFixed(2) + " MB"
                            },
                            compressed: {
                                size: (compressedSize / (1024 * 1024)).toFixed(2) + " MB"
                            },
                            compress_percent: ((originalSize - compressedSize) / originalSize * 100).toFixed(2) + " %",
                            compress_time: ((performance.now() - time) / 1000).toFixed(2) + ' s'
                        }
                    });
                } catch (error) {
                    reject({ error: 'Error retrieving file sizes after compression', details: error });
                }
            })
            .on('error', (err) => {
                console.log("Compression failed:", err);
                reject({ error: 'Compression Failed', details: err });
            })
            .run();
    });
};


const compressVideo = (inputPath, outputFileName) => {
    return new Promise((resolve, reject) => {
        const outputFilePath = path.join(__dirname, 'uploads/videos/', outputFileName);
        let time = performance.now();
        ffmpeg(inputPath)
            .output(outputFilePath)
            .videoCodec('libx264')
            .size('50%')
            .on('end', () => {
                console.log('Compression completed!');

                try {
                    const originalSize = fs.statSync(inputPath).size;
                    const compressedSize = fs.statSync(outputFilePath).size;

                    // Remove the input file
                    fs.unlinkSync(inputPath);

                    resolve({
                        message: 'Compression Performed Successfully',
                        data: {
                            fileName: outputFileName,
                            filePath: outputFilePath,
                            original: {
                                size: (originalSize / (1024 * 1024)).toFixed(2) + " MB"
                            },
                            compressed: {
                                size: (compressedSize / (1024 * 1024)).toFixed(2) + " MB"
                            },
                            compress_percent: ((originalSize - compressedSize) / originalSize * 100).toFixed(2) + " %",
                            compress_time: ((performance.now() - time) / 1000).toFixed(2) + ' s'
                        }
                    });
                } catch (error) {
                    reject({ error: 'Error retrieving file sizes after compression', details: error });
                }
            })
            .on('error', (err) => {
                console.error('Compression failed:', err);
                reject({ error: 'Compression failed', details: err });
            })
            .run();
    });
};


module.exports = { getNameForCompressedFile, compressVideo, compressImage };