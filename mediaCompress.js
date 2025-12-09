const fs = require("fs");
const path = require("path");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const { PassThrough } = require("stream");

ffmpeg.setFfmpegPath(ffmpegStatic);

const compressVideoToScale = async (file) => {
  const tempFilePath = path.join(__dirname, "temp_video.mp4");

  // Write the file buffer to a temporary file
  await fs.promises.writeFile(tempFilePath, file.buffer);

  return new Promise((resolve, reject) => {
    const outputBuffer = [];
    const outputStream = new PassThrough();

    ffmpeg(tempFilePath)
      .outputOptions("-vf", "scale=-2:720")
      .format("mp4")
      .on("progress", (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        }
      })
      .on("end", async () => {
        console.log("FFmpeg has finished.");

        // Combine all chunks into a single Buffer
        const finalBuffer = Buffer.concat(outputBuffer);

        // Clean up the temporary file
        await fs.promises.unlink(tempFilePath);

        // Return the compressed file and its metadata
        resolve({
          buffer: finalBuffer,
          originalName: file.originalname,
          mimetype: "video/mp4",
          size: finalBuffer.length,
        });
      })
      .on("error", async (error) => {
        console.error("FFmpeg error:", error);

        // Clean up the temporary file in case of an error
        await fs.promises.unlink(tempFilePath);

        // reject(error);
      })
      .pipe(outputStream);

    // Collect data chunks from the output stream
    outputStream.on("data", (chunk) => outputBuffer.push(chunk));
    outputStream.on("error", (error) => reject(error));
  });
};

module.exports = { compressVideoToScale };