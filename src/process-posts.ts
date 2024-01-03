import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { InstagramPost } from "./types/InstagramPost";
import dayjs from "dayjs";
import { isValid } from "./utils/is-valid.js";
import buffer from "buffer";
import { copy, ensureDir } from "fs-extra";
import { inferFileExtension } from "./utils/infer-file-type.js";
import { convertToJpg } from "./utils/convert-to-jpg.js";

export const processPosts = async (): Promise<void> => {
    if (!process.env.INSTAGRAM_BACKUP_PATH || !process.env.OUTPUT_DIR) {
        throw new Error('Please set INSTAGRAM_BACKUP_PATH and OUTPUT_DIR in .env file');
    }

    console.log('Reading posts backup...');

    const postsPath = resolve(process.env.INSTAGRAM_BACKUP_PATH, 'your_instagram_activity/content/posts_1.json');

    const backup = await readFile(postsPath, 'utf-8');
    const posts = JSON.parse(backup) as InstagramPost[];

    for (const post of posts) {
        const postCreationDate = dayjs.unix(post.creation_timestamp ?? post.media[0].creation_timestamp).format("YYYY-MM-DD HH.mm.ss");

        const postTexts = [
            post.title,
            ...post.media.map(media => media.title)
        ].filter(isValid).map(title => {
            // Instagram Backup is encoded in latin1 on the server, but the JSON returned is encoded in utf8 and they don't do any conversion, so we have to convert ourselves
            return buffer.transcode(Buffer.from(title), "utf8", "latin1").toString("utf8");
        });

        const outputFolder = resolve(process.env.OUTPUT_DIR, "posts", postCreationDate);
        await ensureDir(outputFolder);

        const postTextsPath = resolve(outputFolder, "text.txt");
        const postText = postTexts.join("\n").trim();

        if (isValid(postText)) {
            await writeFile(postTextsPath, postText);
        }

        let mediaCounter = 0;
        for (const media of post.media) {
            mediaCounter++;
            if (media.uri.startsWith("https://")) {
                throw new Error("Handling remote media is not implemented.");
            }

            const mediaPath = resolve(process.env.INSTAGRAM_BACKUP_PATH, media.uri);
            const fileExtension = await inferFileExtension(mediaPath);

            const mediaDateTime = dayjs.unix(media.creation_timestamp).format("YYYY-MM-DD HH.mm.ss");
            const mediaOutputPath = resolve(outputFolder, `${mediaCounter}. ${mediaDateTime}${fileExtension}`);

            console.log(mediaOutputPath);

            if (fileExtension === ".webp") {
                const jpgPath = mediaOutputPath.replace(".webp", ".jpg");
                await convertToJpg(mediaPath, jpgPath);
            }
            else {
                await copy(mediaPath, mediaOutputPath);
            }
        }
    }
};