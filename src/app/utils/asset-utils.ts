export const makeAssetPath = (asset: string) => {
    return `tank/${asset}.png`;
};

export const makeAudioPath = (asset: string, extension: string = "ogg") => {
    return `audio/${asset}.${extension}`;
};
