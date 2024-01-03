import { FileMagic, MagicFlags } from '@npcz/magic';
import { resolve } from "path";

FileMagic.magicFile = resolve('/usr/share/file/magic.mgc');
if (process.platform === 'darwin' || process.platform === 'linux') {
    FileMagic.defaultFlags = MagicFlags.MAGIC_PRESERVE_ATIME;
}

export const inferFileExtension = async (filePath: string): Promise<string | null> => {
    let extension = null;
    try {
        const magic = await FileMagic.getInstance();
        extension = magic.detect(filePath, magic.flags | MagicFlags.MAGIC_EXTENSION);
    } catch (error) {
        console.error(error);
    }
    finally {
        FileMagic.close();
    }

    return extension;
};