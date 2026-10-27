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
        perSecond: perSecond || "N/A",
        timestamp: Date.now()
    };

    // Evitar duplicados del mismo servidor y actualizar si ya existe
    const existingIndex = detectedEggs.findIndex(item => item.jobId === jobId);
    if (existingIndex !== -1) {
        detectedEggs[existingIndex] = newEntry;
    } else {
        detectedEggs.unshift(newEntry); // Lo pone al principio
    }

    // Mantener solo los últimos 20 servidores reportados para que no sature
    if (detectedEggs.length > 20) {
        detectedEggs.pop();
    }

    // Ordenar de mayor a menor valor
    detectedEggs.sort((a, b) => b.value - a.value);

    console.log(`[API] Servidor guardado: ${newEntry.eggName} | Valor: ${newEntry.value}`);
    res.json({ message: "Reporte guardado con éxito", data: newEntry });
});

// Endpoint para ver la lista (GET /eggs)
app.get('/eggs', (req, res) => {
    const now = Date.now();
    const TWO_MINUTES = 2 * 60 * 1000; // 2 minutos de expiración

    // Filtrar solo los que tengan menos de 2 minutos
    detectedEggs = detectedEggs.filter(egg => (now - egg.timestamp) < TWO_MINUTES);

    res.json(detectedEggs);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
