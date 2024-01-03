import { mkdir, readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { InstagramStories, InstagramStory } from "./types/InstagramStory.js";
import { inferFileExtension } from "./utils/infer-file-type.js";
import dayjs from "dayjs";
import { pathExists, remove, copy } from "fs-extra";
import { convertToJpg } from "./utils/convert-to-jpg.js";

const enum MediaType {
    Image = "image",
    ImageToBeConverted = "image-to-be-converted",
    Video = "video",
    RemoteImage = "remote-image",
    RemoteVideo = "remote-video",
    ToBeInferred = "to-be-inferred"
}

const getMediaType = (story: InstagramStory) => {
    if (story.uri.startsWith("media/") && story.uri.endsWith(".mp4")) {
        return { mediaType: MediaType.Video, mediaURL: story.uri };
    }
    else if (story.uri.startsWith("media/") && (story.uri.endsWith(".jpg"))) {
        return { mediaType: MediaType.Image, mediaURL: story.uri };
    }
    else if (story.uri.startsWith("media/") && (story.uri.endsWith(".webp"))) {
        return { mediaType: MediaType.ImageToBeConverted, mediaURL: story.uri };
    }
    else if (story.uri.startsWith("https://")) {
        const type = story.uri.includes(".jpg?") ? MediaType.RemoteImage : MediaType.RemoteVideo;
        return { mediaType: type, mediaURL: story.uri };
    }
    else if (story.uri.startsWith("media/")) {
        return { mediaType: MediaType.ToBeInferred, mediaURL: story.uri };
    }
    else {
        throw new Error(`Unknown media type for ${story.uri}`);
    }
};

export const processStories = async () => {
    if (!process.env.INSTAGRAM_BACKUP_PATH || !process.env.OUTPUT_DIR) {
        throw new Error('Please set INSTAGRAM_BACKUP_PATH and OUTPUT_DIR in .env file');
    }

    console.log('Reading stories backup...');
    const storiesPath = resolve(process.env.INSTAGRAM_BACKUP_PATH, 'your_instagram_activity/content/stories.json');

    const backup = await readFile(storiesPath, 'utf-8');
    const parsedBackup = JSON.parse(backup) as InstagramStories;

    let storiesOutputDir: string | null = null;
    if (parsedBackup.ig_stories.length) {
        storiesOutputDir = resolve(process.env.OUTPUT_DIR, "stories");
        await mkdir(storiesOutputDir, { recursive: true });
    }

    for (const story of parsedBackup.ig_stories) {
        const storyCreationDate = dayjs.unix(story.creation_timestamp);
        const { mediaType, mediaURL } = getMediaType(story);
        const fileName = storyCreationDate.format("YYYY-MM-DD HH.mm.ss");

        let initialLocalFilePath = resolve(process.env.INSTAGRAM_BACKUP_PATH, mediaURL);
        let sourceFilePath: string | null = null;
        let outputFilePath: string | null = null;

        switch (mediaType) {
            case MediaType.ToBeInferred: {
                const extension = await inferFileExtension(initialLocalFilePath);
                sourceFilePath = initialLocalFilePath;
                outputFilePath = resolve(storiesOutputDir!, fileName + extension);
                break;
            }
            case MediaType.Image: {
                sourceFilePath = initialLocalFilePath;
                outputFilePath = resolve(storiesOutputDir!, fileName + ".jpg");
                break;
            };
            case MediaType.ImageToBeConverted: {
                sourceFilePath = initialLocalFilePath.replace(/\.[^/.]+$/, "") + ".jpg";
                if (await pathExists(sourceFilePath)) {
                    await remove(sourceFilePath);
                }
                await convertToJpg(initialLocalFilePath, sourceFilePath);
                outputFilePath = resolve(storiesOutputDir!, fileName + ".jpg");
                break;
            }
            case MediaType.Video: {
                sourceFilePath = initialLocalFilePath;
                outputFilePath = resolve(storiesOutputDir!, fileName + ".mp4");
                break;
            }
            case MediaType.RemoteImage: {
                writeFile(resolve(storiesOutputDir!, fileName + " - [Missing Story].txt"), JSON.stringify(story, null, 4));
                continue;
                break;
            }
            case MediaType.RemoteVideo: {
                writeFile(resolve(storiesOutputDir!, fileName + " - [Missing Story].txt"), JSON.stringify(story, null, 4));
                continue;
                break;
            }
            default: break;
        }

        if (sourceFilePath && outputFilePath) {
            await copy(sourceFilePath, outputFilePath);
        }
        else {
            console.warn(`Empty sourceFilePath or outputFilePath for ${story.uri}. \n sourceFilePath: ${sourceFilePath} \n outputFilePath: ${outputFilePath}`);
        }
    }
};
