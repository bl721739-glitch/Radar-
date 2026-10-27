const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let detectedEggs = [];

// Ruta de prueba raíz
app.get('/', (req, res) => {
    res.send("API de Egg Radar funcionando correctamente 🚀");
});

// 1. Endpoint para recibir reportes de los bots (POST /report)
app.post('/report', (req, res) => {
    const { jobId, placeId, eggName, value } = req.body;

    if (!jobId || !placeId) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const newEntry = {
        jobId,
        placeId,
        eggName: eggName || "Huevo Desconocido",
        value: value || 0,
        timestamp: Date.now()
    };

    // Reemplazar si el jobId ya existe, o agregarlo
    const existingIndex = detectedEggs.findIndex(item => item.jobId === jobId);
    if (existingIndex !== -1) {
        detectedEggs[existingIndex] = newEntry;
    } else {
        detectedEggs.push(newEntry);
    }

    // Ordenar de mayor a menor valor
    detectedEggs.sort((a, b) => b.value - a.value);

    console.log(`[API] Huevo recibido: ${newEntry.eggName} ($${newEntry.value})`);
    res.json({ message: "Reporte guardado con éxito", data: newEntry });
});

// 2. Endpoint para que tu cuenta principal lea los huevos (GET /eggs)
app.get('/eggs', (req, res) => {
    const now = Date.now();
    const TWO_MINUTES = 2 * 60 * 1000; // 2 minutos de expiración

    // Filtrar servidores viejos
    detectedEggs = detectedEggs.filter(egg => (now - egg.timestamp) < TWO_MINUTES);

    res.json(detectedEggs);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
