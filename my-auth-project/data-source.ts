// data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

// 1. ดึงค่าทั้งหมดออกมาก่อน
const host = process.env.DATABASE_HOST;
const port = process.env.DATABASE_PORT;
const username = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const database = process.env.DATABASE_NAME;

// 2. ตรวจสอบว่ามีค่าครบหรือไม่
if (!host || !port || !username || !password || !database) {
  throw new Error('Missing database configuration in .env file');
}

// 3. ถ้าครบ TypeScript จะรู้ว่าตัวแปรเหล่านี้เป็น string
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: host,
  port: parseInt(port, 10),
  username: username,
  password: password,
  database: database,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;