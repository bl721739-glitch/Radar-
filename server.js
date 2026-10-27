const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let detectedEggs = [];

app.get('/', (req, res) => {
    res.send("API de Egg Radar funcionando correctamente 🚀");
});

// Endpoint para recibir reportes (POST /report)
app.post('/report', (req, res) => {
    const { jobId, placeId, eggName, value, perSecond } = req.body;

    if (!jobId || !placeId) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const newEntry = {
        jobId,
        placeId,
        eggName: eggName || "Huevo Desconocido",
        value: value || 0,
        perSecond: perSecond || "N/A", // Capturamos lo que da por segundo
        timestamp: Date.now()
    };

    const existingIndex = detectedEggs.findIndex(item => item.jobId === jobId);
    if (existingIndex !== -1) {
        detectedEggs[existingIndex] = newEntry;
    } else {
        detectedEggs.push(newEntry);
    }

    detectedEggs.sort((a, b) => b.value - a.value);

    console.log(`[API] Huevo recibido: ${newEntry.eggName} | Da: ${newEntry.perSecond}`);
    res.json({ message: "Reporte guardado con éxito", data: newEntry });
});

// Endpoint para ver la lista (GET /eggs)
app.get('/eggs', (req, res) => {
    const now = Date.now();
    const TWO_MINUTES = 2 * 60 * 1000;

    detectedEggs = detectedEggs.filter(egg => (now - egg.timestamp) < TWO_MINUTES);

    res.json(detectedEggs);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
