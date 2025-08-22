// src/index.js o src/server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDatabase from './config/mongoConnect.js';
import apiRouter from './router/apiRouter.js';
import sitemapRouter from './router/sitemapRouter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3020;

// 🔧 Configuración CORS específica
const corsOptions = {
  origin: [
    'https://www.crunchy-munch.com',
    'https://crunchy-munch.com',
    'http://localhost:4200', // para desarrollo local
    'http://localhost:3020'  // para desarrollo local
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};

// 🔧 Middlewares
app.use(cors(corsOptions));

// Middleware adicional para manejar preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🧠 Conexión base de datos
connectDatabase();

// 🗺️ Rutas de sitemap y robots.txt — se colocan antes de archivos estáticos
app.use('/', sitemapRouter);

// 📦 Servir frontend Angular (build)
app.use(express.static(path.join(__dirname, '../frontend/dist/crunchy-munch')));

// 📡 Rutas API backend
app.use('/api', apiRouter);

// 🪄 Catch-all para Angular (SPA)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.includes('.xml') && !req.path.includes('.txt')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/crunchy-munch/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en ${PORT}`);
  console.log(`🌐 Sitemap en ${PORT}/sitemap.xml`);
});

export default app;