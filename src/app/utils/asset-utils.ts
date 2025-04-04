export const makeAssetPath = (asset: string) => {
    return `tank/${asset}.png`;
};

export const makeAudioPath = (asset: string, extension: string = "ogg") => {
    if (asset && asset.includes(".")) {
        return `audio/${asset}`;
    }
    return `audio/${asset}.${extension}`;
};
