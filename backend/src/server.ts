import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());

app.get("/", (req, res) => {
    res.send("Backend stupen sedang berjalan!");   
});

app.listen(PORT, () => {
    console.log(`Server sedang berjalan di http://localhost:${PORT}`);
});

