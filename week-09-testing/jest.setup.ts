// Carga las variables de .env.test antes de ejecutar los tests
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.test') });
