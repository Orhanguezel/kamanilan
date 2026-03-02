import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { env } from '@/core/env';
import { cleanSql, splitStatements, logStep } from './utils';

// ESM için __dirname/__filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Flags = {
  noDrop?: boolean;
  only?: string[]; // ör: ["40","41","50"] -> sadece o dosyalar
};

function parseFlags(argv: string[]): Flags {
  const flags: Flags = {};
  for (const a of argv.slice(2)) {
    if (a === '--no-drop') flags.noDrop = true;
    else if (a.startsWith('--only=')) {
      flags.only = a.replace('--only=', '').split(',').map(s => s.trim());
    }
  }
  return flags;
}

function assertSafeToDrop(dbName: string) {
  const allowDrop = process.env.ALLOW_DROP === 'true';
  const isProd = process.env.NODE_ENV === 'production';
  const isSystem = ['mysql','information_schema','performance_schema','sys'].includes(dbName.toLowerCase());
  if (isSystem) throw new Error(`Sistem DB'si drop edilemez: ${dbName}`);
  if (isProd && !allowDrop) throw new Error('Prod ortamda DROP için ALLOW_DROP=true bekleniyor.');
}

async function dropAndCreate(root: mysql.Connection) {
  assertSafeToDrop(env.DB.name);
  await root.query(`DROP DATABASE IF EXISTS \`${env.DB.name}\`;`);
  await root.query(
    `CREATE DATABASE \`${env.DB.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
}

async function createRoot(): Promise<mysql.Connection> {
  return mysql.createConnection({
    host: env.DB.host,
    port: env.DB.port,
    user: env.DB.user,
    password: env.DB.password,
    multipleStatements: true,
  });
}

async function createConnToDb(): Promise<mysql.Connection> {
  return mysql.createConnection({
    host: env.DB.host,
    port: env.DB.port,
    user: env.DB.user,
    password: env.DB.password,
    database: env.DB.name,
    multipleStatements: true,
    // unicode_ci ile uyumlu
    charset: 'utf8mb4_unicode_ci',
  });
}

function shouldRun(file: string, flags: Flags) {
  if (!flags.only?.length) return true;
  const m = path.basename(file).match(/^(\d+)/);
  const prefix = m?.[1];
  return prefix ? flags.only.includes(prefix) : false;
}

/** admin değişkenlerini ENV'den oku + bcrypt üret */
function getAdminVars() {
  const email = (process.env.ADMIN_EMAIL || 'orhanguzell@gmail.com').trim();
  const id = (process.env.ADMIN_ID || '4f618a8d-6fdb-498c-898a-395d368b2193').trim();
  const plainPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = bcrypt.hashSync(plainPassword, 12);
  return { email, id, passwordHash };
}

/** müşteri (normal user) değişkenlerini ENV'den oku + bcrypt üret */
function getCustomerVars() {
  const email = (process.env.CUSTOMER_EMAIL || 'musteri@kamanilan.com').trim();
  const id = (process.env.CUSTOMER_ID || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890').trim();
  const plainPassword = process.env.CUSTOMER_PASSWORD || 'Musteri@2026!';
  const passwordHash = bcrypt.hashSync(plainPassword, 12);
  return { email, id, passwordHash };
}

/** satıcı (seller) değişkenlerini ENV'den oku + bcrypt üret */
function getSellerVars() {
  const email = (process.env.SELLER_EMAIL || 'satici@kamanilan.com').trim();
  const id = (process.env.SELLER_ID || 'b2c3d4e5-f6a7-8901-bcde-f23456789012').trim();
  const plainPassword = process.env.SELLER_PASSWORD || 'Kamanilan@2026!';
  const passwordHash = bcrypt.hashSync(plainPassword, 12);
  return { email, id, passwordHash };
}

/** Iyzico değişkenlerini ENV'den oku */
function getIyzicoVars() {
  const apiKey    = (process.env.IYZICO_API_KEY    || '').trim();
  const secretKey = (process.env.IYZICO_SECRET_KEY || '').trim();
  const testMode  = process.env.IYZICO_TEST_MODE !== 'false'; // default: sandbox
  const baseUrl   = testMode
    ? 'https://sandbox-api.iyzipay.com'
    : 'https://api.iyzipay.com';
  const isTestMode = testMode ? 1 : 0;
  return { apiKey, secretKey, baseUrl, isTestMode };
}

/** SQL string güvenli tek tırnak escape */
function sqlStr(v: string) {
  return v.replaceAll("'", "''");
}

/** Dosyayı oku, temizle, tüm değişkenleri enjekte et */
function prepareSqlForRun(
  rawSql: string,
  admin: { email: string; id: string; passwordHash: string },
  customer: { email: string; id: string; passwordHash: string },
  seller: { email: string; id: string; passwordHash: string },
  iyzico: { apiKey: string; secretKey: string; baseUrl: string; isTestMode: number },
) {
  let sql = cleanSql(rawSql);

  const header = [
    `SET @ADMIN_EMAIL := '${sqlStr(admin.email)}';`,
    `SET @ADMIN_ID := '${sqlStr(admin.id)}';`,
    `SET @ADMIN_PASSWORD_HASH := '${sqlStr(admin.passwordHash)}';`,
    `SET @CUSTOMER_EMAIL := '${sqlStr(customer.email)}';`,
    `SET @CUSTOMER_ID := '${sqlStr(customer.id)}';`,
    `SET @CUSTOMER_PASSWORD_HASH := '${sqlStr(customer.passwordHash)}';`,
    `SET @SELLER_EMAIL := '${sqlStr(seller.email)}';`,
    `SET @SELLER_ID := '${sqlStr(seller.id)}';`,
    `SET @SELLER_PASSWORD_HASH := '${sqlStr(seller.passwordHash)}';`,
  ].join('\n');

  sql = sql
    .replaceAll('{{ADMIN_BCRYPT}}', admin.passwordHash)
    .replaceAll('{{ADMIN_PASSWORD_HASH}}', admin.passwordHash)
    .replaceAll('{{ADMIN_EMAIL}}', admin.email)
    .replaceAll('{{ADMIN_ID}}', admin.id)
    .replaceAll('{{CUSTOMER_PASSWORD_HASH}}', customer.passwordHash)
    .replaceAll('{{CUSTOMER_EMAIL}}', customer.email)
    .replaceAll('{{CUSTOMER_ID}}', customer.id)
    .replaceAll('{{SELLER_PASSWORD_HASH}}', seller.passwordHash)
    .replaceAll('{{SELLER_EMAIL}}', seller.email)
    .replaceAll('{{SELLER_ID}}', seller.id)
    .replaceAll('{{IYZICO_API_KEY}}', sqlStr(iyzico.apiKey))
    .replaceAll('{{IYZICO_SECRET_KEY}}', sqlStr(iyzico.secretKey))
    .replaceAll('{{IYZICO_BASE_URL}}', sqlStr(iyzico.baseUrl))
    .replaceAll('{{IYZICO_IS_TEST_MODE}}', String(iyzico.isTestMode));

  sql = `${header}\n${sql}`;
  return sql;
}

async function runSqlFile(
  conn: mysql.Connection,
  absPath: string,
  adminVars: { email: string; id: string; passwordHash: string },
  customerVars: { email: string; id: string; passwordHash: string },
  sellerVars: { email: string; id: string; passwordHash: string },
  iyzicoVars: { apiKey: string; secretKey: string; baseUrl: string; isTestMode: number },
) {
  const name = path.basename(absPath);
  logStep(`⏳ ${name} çalışıyor...`);
  const raw = fs.readFileSync(absPath, 'utf8');

  const sql = prepareSqlForRun(raw, adminVars, customerVars, sellerVars, iyzicoVars);
  const statements = splitStatements(sql);

  await conn.query('SET NAMES utf8mb4;');
  await conn.query("SET time_zone = '+00:00';");

  for (const stmt of statements) {
    if (!stmt) continue;
    await conn.query(stmt);
  }
  logStep(`✅ ${name} bitti`);
}

async function main() {
  const flags = parseFlags(process.argv);

  // 1) Root ile drop + create (opsiyonel)
  const root = await createRoot();
  try {
    if (!flags.noDrop) {
      logStep('💣 DROP + CREATE başlıyor');
      await dropAndCreate(root);
      logStep('🆕 DB oluşturuldu');
    } else {
      logStep('⤵️ --no-drop: DROP/CREATE atlanıyor');
    }
  } finally {
    await root.end();
  }

  // 2) DB bağlantısı
  const conn = await createConnToDb();

  try {
    // 3) Değişkenleri hazırla (tek sefer)
    const ADMIN    = getAdminVars();
    const CUSTOMER = getCustomerVars();
    const SELLER   = getSellerVars();
    const IYZICO   = getIyzicoVars();

    // 4) SQL klasörünü bul (öncelik env, sonra dist/sql, yoksa src/sql)
    const envDir = process.env.SEED_SQL_DIR && process.env.SEED_SQL_DIR.trim();
    const distSql = path.resolve(__dirname, 'sql');
    const srcSql  = path.resolve(__dirname, '../../../src/db/seed/sql');
    const sqlDir  = envDir ? path.resolve(envDir) : (fs.existsSync(distSql) ? distSql : srcSql);

    const files = fs.readdirSync(sqlDir)
      .filter(f => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const f of files) {
      const abs = path.join(sqlDir, f);
      if (!shouldRun(abs, flags)) {
        logStep(`⏭️ ${f} atlandı (--only filtresi)`);
        continue;
      }
      await runSqlFile(conn, abs, ADMIN, CUSTOMER, SELLER, IYZICO);
    }
    logStep('🎉 Seed tamamlandı.');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
