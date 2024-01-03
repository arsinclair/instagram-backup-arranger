import gm from "gm";

export const convertToJpg = async (inputPath: string, outputPath: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        gm.subClass({ imageMagick: true })(inputPath).write(outputPath, (err) => {
            if (err) {
                console.error(`imageMagick error: ${err}. Path: ${inputPath}. Write path: ${outputPath}.`);
                reject(err);
            }
            else {
                resolve(outputPath);
            }
        });
    });
};