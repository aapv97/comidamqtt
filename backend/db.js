import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'comidamqtt',
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err);
  } else {
    console.log('✅ Conectado a la base de datos');
  }
});

export default connection;
