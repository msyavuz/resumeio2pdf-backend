import axios from "axios";
import { getImageUrl, getMetaUrl } from "./utils";
import { PDFDocument, PDFName, PDFPage, PDFRef, PDFString } from "pdf-lib";
import fs from "fs";

type MetaLink = {
    url: string;
    left: number;
    top: number;
    height: number;
    width: number;
};

type MetaViewPort = {
    height: number;
    width: number;
};

type MetaPageInfo = {
    links: MetaLink[];
    viewport: MetaViewPort;
};

type MetaInfo = {
    pages: MetaPageInfo[];
};

export const getMeta = async (id: string) => {
    const metaUrl = getMetaUrl(id);

    const response = await axios.get(metaUrl);
    const metaData = await response.data as MetaInfo;
    return metaData;
};

export const getResumeImages = async (id: string, pageCount: number) => {
    if (pageCount < 1) {
        console.log("Must have at leas a page");
    }

    const pages: string[] = [];

    for (let currentPage = 1; currentPage <= pageCount; currentPage++) {
        const url = getImageUrl(id, currentPage);

        const resp = await axios.get(url, {
            responseType: "text",
            responseEncoding: "base64",
        })!;
        pages.push(await resp.data);
    }
    return pages;
};
const createPageLinkAnnotation = (
    page: PDFPage,
    uri: string,
    x: number,
    y: number,
    width: number,
    height: number,
) => page.doc.context.register(
    page.doc.context.obj({
        Type: "Annot",
        Subtype: "Link",
        Rect: [x, y + height, x + width, y],
        Border: [0, 0, 0],
        C: [0, 0, 1],
        A: {
            Type: "Action",
            S: "URI",
            URI: PDFString.of(uri),
        },
    }),
);

export const getPdf = async (id: string) => {
    const metaData = await getMeta(id);

    const pages = await getResumeImages(id, metaData.pages.length);

    const pdfDocument = await PDFDocument.create();

    pages.forEach(async (page, i) => {
        const { viewport, links } = metaData.pages[i];
        const pdfPage = pdfDocument.addPage();
        pdfPage.setSize(viewport.width, viewport.height);
        const img = await pdfDocument.embedPng(page);
        pdfPage.drawImage(img, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
        });
        const linkObjects: PDFRef[] = [];
        links.forEach((link) => {
            const l = createPageLinkAnnotation(
                pdfPage,
                link.url,
                link.left,
                link.top,
                link.width,
                link.height,
            );
            linkObjects.push(l);
        });
        pdfPage.node.set(
            PDFName.of("Annots"),
            pdfDocument.context.obj(linkObjects),
        );
    });
    const pdfAsBase64 = await pdfDocument.saveAsBase64();
    return pdfAsBase64;
};
