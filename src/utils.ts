export const getMetaUrl = (id: string) => {
    const metaUrl = `https://ssr.resume.tools/meta/ssid-${id}?cache=${
        new Date().toISOString()
    }`;

    return metaUrl;
};

export const getImageUrl = (id: string, pageId: number) => {
    const imageUrl =
        `https://ssr.resume.tools/to-image/ssid-${id}-${pageId}.png?cache=${
            new Date().toISOString()
        }&size=1800`;

    return imageUrl;
};
