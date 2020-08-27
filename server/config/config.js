// =========================
//    PUERTO
// =========================
process.env.PORT = process.env.PORT || 3000;


// ============================
// ENTORNO
//=============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// ============================
// Base de Datos
//=============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

// ============================
// Vencimiento del Token
//=============================
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ================================
// SEED (Firma) de autentificación
//=================================

process.env.SEED = process.env.SEED || 'seed-de-desarrollo';