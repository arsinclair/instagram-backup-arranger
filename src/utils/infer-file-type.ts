import { FileMagic, MagicFlags } from '@npcz/magic';
import { extname, resolve } from "path";
import { isValid } from "./is-valid.js";

FileMagic.magicFile = resolve('/usr/share/file/magic.mgc');
if (process.platform === 'darwin' || process.platform === 'linux') {
    FileMagic.defaultFlags = MagicFlags.MAGIC_PRESERVE_ATIME;
}

export const inferFileExtension = async (filePath: string): Promise<string> => {
    let extension = extname(filePath);

    if (isValid(extension)) {
        return extension;
    }
    else {
        try {
            const magic = await FileMagic.getInstance();
            extension = magic.detect(filePath, magic.flags | MagicFlags.MAGIC_EXTENSION);
        } catch (error) {
            console.error(error);
        }
        finally {
            FileMagic.close();
        }

        if (!isValid(extension)) {
            throw new Error(`Could not infer file extension for ${filePath}`);
        }

        return "." + extension;
    }
};