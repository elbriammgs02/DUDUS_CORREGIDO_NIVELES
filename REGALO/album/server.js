const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname,"..")));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});