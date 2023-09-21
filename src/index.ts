import express from "express";
import cors from "cors";
import { getPdf } from "./pdf";

const app = express();
app.use(cors());

app.get("/:id", async (req, res) => {
    const id = req.params.id;

    const pdfB64 = await getPdf(id);

    res.type("application/pdf");
    res.header("Content-Disposition", `attachment; filename="${id}.pdf"`);
    res.send(Buffer.from(pdfB64, "base64"));
});

app.get("/health", (req, res) => {
    res.status(200).send({});
});

app.listen(9000, () => {
    console.log("Listening on port", 9000);
});
