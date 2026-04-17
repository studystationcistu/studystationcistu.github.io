const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// ============================================================
// [1] CONFIGURATION — ดึงค่าจาก Environment Variables
// ============================================================
// ⚠️ ต้องตั้ง Environment Variables เหล่านี้บน Render:
//   ADMIN_PASSWORD    — รหัสผ่าน admin (เช่น "MyStr0ngP@ss!")
//   JWT_SECRET        — คีย์ลับสำหรับสร้าง token (เช่น random string 64 ตัว)
//   FRONTEND_URL      — URL ของ frontend (เช่น "https://studystation.vercel.app")

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '4168';  // fallback สำหรับ dev เท่านั้น
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require('./firebase-key.json');
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 5001;

// ============================================================
// [2] CORS — ล็อกให้เฉพาะ frontend ของเราเท่านั้น
// ============================================================
// ก่อนแก้: app.use(cors())  → อนุญาตทุก origin (อันตราย!)
// หลังแก้: อนุญาตเฉพาะ domain ที่กำหนด
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:3000',  // สำหรับ dev เท่านั้น
];

app.use(cors({
  origin: function (origin, callback) {
    // อนุญาต request ที่ไม่มี origin (เช่น Postman, server-to-server)
    // ในระบบ production จริงควรปิดด้วย
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// ============================================================
// [3] RATE LIMITING — จำกัดจำนวน request ป้องกัน brute force
// ============================================================
// ก่อนแก้: ไม่มี rate limit เลย
// หลังแก้: จำกัด request ต่อ IP

// สำหรับ API ทั่วไป — 100 requests ต่อ 15 นาที
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'คำขอมากเกินไป กรุณารอสักครู่' },
  standardHeaders: true,
  legacyHeaders: false,
});

// สำหรับ login — 10 ครั้งต่อ 15 นาที (ป้องกัน brute force รหัสผ่าน)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'ลองรหัสผ่านมากเกินไป กรุณารอ 15 นาที' },
  standardHeaders: true,
  legacyHeaders: false,
});

// สำหรับ Danger Zone — 5 ครั้งต่อชั่วโมง
const dangerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'คำขอ Danger Zone มากเกินไป' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);

// ============================================================
// [4] JWT AUTHENTICATION MIDDLEWARE
// ============================================================
// ก่อนแก้: admin API ไม่มีการตรวจสอบเลย ใครก็เรียกได้
// หลังแก้: ทุก request ไป /api/admin/* ต้องมี JWT token ใน header

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'ไม่ได้รับอนุญาต — กรุณาเข้าสู่ระบบ' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token หมดอายุ — กรุณาเข้าสู่ระบบใหม่' });
    }
    return res.status(401).json({ error: 'Token ไม่ถูกต้อง' });
  }
}

// ============================================================
// [5] INPUT VALIDATION HELPERS
// ============================================================
// ก่อนแก้: req.body ถูกส่งตรงไป Firestore โดยไม่ตรวจสอบ
// หลังแก้: ตรวจสอบ field ที่อนุญาตเท่านั้น + sanitize ค่า

function sanitizeString(str, maxLen = 200) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

function sanitizeNumber(val, min = 0, max = 99999) {
  const num = Number(val);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

// อนุญาตเฉพาะ field เหล่านี้สำหรับ item
const ALLOWED_ITEM_FIELDS = ['itemId', 'type', 'name', 'color', 'imageUrl', 'status', 'consumable', 'stock', 'initialStock', 'number'];

function validateItemData(body) {
  const clean = {};
  for (const key of ALLOWED_ITEM_FIELDS) {
    if (body[key] !== undefined) {
      if (['name', 'type', 'color', 'imageUrl', 'itemId', 'status'].includes(key)) {
        clean[key] = sanitizeString(body[key], key === 'imageUrl' ? 2000 : 200);
      } else if (['stock', 'initialStock', 'number'].includes(key)) {
        clean[key] = sanitizeNumber(body[key]);
      } else if (key === 'consumable') {
        clean[key] = Boolean(body[key]);
      }
    }
  }
  return clean;
}

// อนุญาตเฉพาะ collection เหล่านี้สำหรับ danger/clear
const ALLOWED_CLEAR_COLLECTIONS = ['bookings', 'users'];  // ห้ามลบ items, settings, roster

// ============================================================
// [6] ADMIN LOGIN ENDPOINT — สร้าง JWT token
// ============================================================
// ก่อนแก้: รหัสผ่านเช็คบน frontend (ใน source code!)
// หลังแก้: เช็คบน server, return JWT token ที่มีอายุ 8 ชั่วโมง

app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'กรุณากรอกรหัสผ่าน' });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }

  // สร้าง JWT token อายุ 8 ชั่วโมง
  const token = jwt.sign(
    { role: 'admin', loginAt: Date.now() },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, message: 'เข้าสู่ระบบสำเร็จ' });
});

// ============================================================
// [7] PUBLIC ROUTES — ไม่ต้องมี token (สำหรับผู้ใช้ทั่วไป)
// ============================================================

app.get('/api/items', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = [];
    snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/settings/layout', async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('layout').get();
    res.json(doc.exists ? doc.data() : { typeOrder: [] });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/settings/config', async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('config').get();
    res.json(doc.exists ? doc.data() : { manualUnlock: false });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/borrow', async (req, res) => {
  // --- Input Validation เพิ่มใหม่ ---
  const itemId = sanitizeString(req.body.itemId, 100);
  const studentId = sanitizeString(req.body.studentId, 20);
  const studentName = sanitizeString(req.body.studentName, 200);
  const qty = sanitizeNumber(req.body.qty, 1, 100);
  const startTime = sanitizeString(req.body.startTime, 30);
  const endTime = sanitizeString(req.body.endTime, 30);

  if (!studentId || !studentName) return res.status(400).json({ error: "กรุณาล็อกอิน" });
  if (!itemId) return res.status(400).json({ error: "ไม่ระบุอุปกรณ์" });

  try {
    const itemRef = db.collection('items').doc(itemId);
    const doc = await itemRef.get();
    if (!doc.exists) return res.status(404).json({ error: "ไม่พบอุปกรณ์" });
    const itemData = doc.data();

    if (itemData.consumable) {
      if (itemData.stock < qty) return res.status(400).json({ error: "สต็อกไม่พอ" });
      await itemRef.update({ stock: admin.firestore.FieldValue.increment(-qty) });
      await db.collection('bookings').add({
        itemId: itemData.itemId, itemName: itemData.name, itemType: itemData.type,
        studentId, studentName, quantity: qty, consumable: true, status: "Consumed",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ message: "เบิกสำเร็จ" });
    } else {
      if (itemData.status === 'Borrowed') return res.status(400).json({ error: "ถูกยืมไปแล้ว" });
      await itemRef.update({ status: 'Borrowed' });
      await db.collection('bookings').add({
        itemId: itemData.itemId, itemName: itemData.name, itemType: itemData.type,
        studentId, studentName, startTime, endTime, status: "Active",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ message: "ยืมสำเร็จ" });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/return', async (req, res) => {
  const bookingId = sanitizeString(req.body.bookingId, 100);
  const itemId = sanitizeString(req.body.itemId, 100);

  if (!bookingId || !itemId) return res.status(400).json({ error: "ข้อมูลไม่ครบ" });

  try {
    await db.collection('bookings').doc(bookingId).update({ status: "Returned", returnedAt: admin.firestore.FieldValue.serverTimestamp() });
    const itemsSnap = await db.collection('items').where('itemId', '==', itemId).get();
    if (!itemsSnap.empty) await itemsSnap.docs[0].ref.update({ status: "Available" });
    res.json({ message: "คืนสำเร็จ" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/my-bookings/:studentId', async (req, res) => {
  const studentId = sanitizeString(req.params.studentId, 20);
  if (!studentId) return res.status(400).json({ error: "ไม่ระบุรหัสนักศึกษา" });

  try {
    const snapshot = await db.collection('bookings').where('studentId', '==', studentId).get();
    const myBookings = [];
    snapshot.forEach(doc => myBookings.push({ id: doc.id, ...doc.data() }));
    res.json(myBookings);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// [8] PROTECTED ADMIN ROUTES — ต้องมี JWT token ทุก endpoint
// ============================================================
// ก่อนแก้: ไม่มี middleware ป้องกัน
// หลังแก้: ทุก route ใต้ /api/admin/* ต้องผ่าน authenticateAdmin

app.get('/api/admin/all-data', authenticateAdmin, async (req, res) => {
  try {
    const [itemsSnap, bookingsSnap, usersSnap, r1Snap, r2Snap, layoutSnap, configSnap] = await Promise.all([
      db.collection('items').get(), db.collection('bookings').get(), db.collection('users').get(),
      db.collection('year1_roster').get(), db.collection('year2_roster').get(),
      db.collection('settings').doc('layout').get(),
      db.collection('settings').doc('config').get()
    ]);
    res.json({
      items: itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      bookings: bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0)),
      users: usersSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      roster1: r1Snap.docs.map(d => ({ id: d.id, ...d.data() })),
      roster2: r2Snap.docs.map(d => ({ id: d.id, ...d.data() })),
      layoutOrder: layoutSnap.exists ? layoutSnap.data().typeOrder || [] : [],
      config: configSnap.exists ? configSnap.data() : { manualUnlock: false }
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/items', authenticateAdmin, async (req, res) => {
  try {
    const data = validateItemData(req.body);
    if (!data.itemId) return res.status(400).json({ error: "ไม่ระบุ itemId" });
    await db.collection('items').doc(data.itemId).set(data, { merge: true });
    res.json({ message: "บันทึกอุปกรณ์สำเร็จ" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/items/auto-add', authenticateAdmin, async (req, res) => {
  const type = sanitizeString(req.body.type);
  const name = sanitizeString(req.body.name);
  const color = sanitizeString(req.body.color);
  const imageUrl = sanitizeString(req.body.imageUrl, 2000);

  if (!type || !name) return res.status(400).json({ error: "ข้อมูลไม่ครบ" });

  try {
    const snap = await db.collection('items').where('type', '==', type).get();
    let maxNum = 0;
    snap.forEach(doc => {
      const num = doc.data().number;
      if (num && num > maxNum) maxNum = num;
    });
    const nextNum = maxNum + 1;
    const newId = `${type}_${String(nextNum).padStart(3, '0')}`;
    const newItem = { itemId: newId, type, name, color, imageUrl, status: "Available", number: nextNum, consumable: false };
    await db.collection('items').doc(newId).set(newItem);
    res.json({ message: `สร้างรหัสอุปกรณ์ชิ้นใหม่สำเร็จ`, item: newItem });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/items/bulk', authenticateAdmin, async (req, res) => {
  try {
    if (!Array.isArray(req.body.items)) return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
    const batch = db.batch();
    req.body.items.forEach(it => {
      const data = validateItemData(it);
      if (data.itemId) batch.set(db.collection('items').doc(data.itemId), data);
    });
    await batch.commit();
    res.json({ message: "เพิ่มแบบชุดสำเร็จ" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/types/:type/update', authenticateAdmin, async (req, res) => {
  const type = sanitizeString(req.params.type);
  const name = sanitizeString(req.body.name);
  const color = sanitizeString(req.body.color);
  const imageUrl = sanitizeString(req.body.imageUrl, 2000);
  const consumable = Boolean(req.body.consumable);

  if (!type || !name) return res.status(400).json({ error: "ข้อมูลไม่ครบ" });

  try {
    const snap = await db.collection('items').where('type', '==', type).get();
    if (snap.empty) return res.status(404).json({ error: "ไม่พบอุปกรณ์ประเภทนี้" });

    const batch = db.batch();
    let currentIsConsumable = false;
    let stockDoc = null;
    let unitDocs = [];

    snap.forEach(doc => {
      const d = doc.data();
      if (d.consumable) { currentIsConsumable = true; stockDoc = { id: doc.id, ...d }; }
      else { unitDocs.push({ id: doc.id, ...d }); }
    });

    if (currentIsConsumable === consumable) {
      snap.forEach(doc => batch.update(doc.ref, { name, color, imageUrl }));
      await batch.commit();
      return res.json({ message: "อัปเดตข้อมูลกลุ่มสำเร็จ" });
    }

    if (!currentIsConsumable && consumable) {
      const totalStock = unitDocs.length;
      unitDocs.forEach(doc => batch.delete(db.collection('items').doc(doc.id)));
      const newId = `${type}_stock`;
      batch.set(db.collection('items').doc(newId), {
        itemId: newId, type, name, color, imageUrl,
        consumable: true, stock: totalStock, initialStock: totalStock
      });
      await batch.commit();
      return res.json({ message: "เปลี่ยนเป็นวัสดุสิ้นเปลืองสำเร็จ" });
    }

    if (currentIsConsumable && !consumable) {
      const stockToConvert = stockDoc.initialStock || stockDoc.stock || 1;
      batch.delete(db.collection('items').doc(stockDoc.id));
      for (let i = 1; i <= stockToConvert; i++) {
        const newId = `${type}_${String(i).padStart(3, '0')}`;
        batch.set(db.collection('items').doc(newId), {
          itemId: newId, type, name, color, imageUrl,
          consumable: false, status: "Available", number: i
        });
      }
      await batch.commit();
      return res.json({ message: "เปลี่ยนเป็นอุปกรณ์ยืม-คืนสำเร็จ" });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/items/:id', authenticateAdmin, async (req, res) => {
  try { await db.collection('items').doc(req.params.id).delete(); res.json({ message: "ลบสำเร็จ" }); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/items/:id/update', authenticateAdmin, async (req, res) => {
  try {
    const data = validateItemData(req.body);
    await db.collection('items').doc(req.params.id).update(data);
    res.json({ message: "อัปเดตสำเร็จ" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/bookings/:id', authenticateAdmin, async (req, res) => {
  try { await db.collection('bookings').doc(req.params.id).delete(); res.json({ message: "ลบประวัติสำเร็จ" }); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try { await db.collection('users').doc(req.params.id).delete(); res.json({ message: "ลบผู้ใช้สำเร็จ" }); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/roster/:year', authenticateAdmin, async (req, res) => {
  const coll = req.params.year === '1' ? 'year1_roster' : 'year2_roster';
  const studentId = sanitizeString(req.body.studentId, 20);
  const fullName = sanitizeString(req.body.fullName, 200);

  if (!studentId) return res.status(400).json({ error: "ไม่ระบุรหัสนักศึกษา" });

  try {
    await db.collection(coll).doc(studentId).set({ studentId, fullName }, { merge: true });
    res.json({ message: "บันทึกรายชื่อสำเร็จ" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/roster/:year/:id', authenticateAdmin, async (req, res) => {
  const coll = req.params.year === '1' ? 'year1_roster' : 'year2_roster';
  try { await db.collection(coll).doc(req.params.id).delete(); res.json({ message: "ลบรายชื่อสำเร็จ" }); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/roster/:year/seed', authenticateAdmin, async (req, res) => {
  const coll = req.params.year === '1' ? 'year1_roster' : 'year2_roster';
  try {
    if (!Array.isArray(req.body.roster)) return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
    const batch = db.batch();
    req.body.roster.forEach(r => {
      const id = sanitizeString(r.id, 20);
      const name = sanitizeString(r.name, 200);
      if (id) batch.set(db.collection(coll).doc(id), { studentId: id, fullName: name });
    });
    await batch.commit();
    res.json({ message: "เติมรายชื่อสำเร็จ" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/settings/layout', authenticateAdmin, async (req, res) => {
  try {
    // อนุญาตเฉพาะ field typeOrder
    const typeOrder = Array.isArray(req.body.typeOrder) ? req.body.typeOrder.map(t => sanitizeString(t)) : [];
    await db.collection('settings').doc('layout').set({ typeOrder }, { merge: true });
    res.json({ message: "บันทึกการจัดเรียงเรียบร้อย" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/settings/config', authenticateAdmin, async (req, res) => {
  try {
    // อนุญาตเฉพาะ field manualUnlock
    const manualUnlock = Boolean(req.body.manualUnlock);
    await db.collection('settings').doc('config').set({ manualUnlock }, { merge: true });
    res.json({ message: manualUnlock ? "ปลดล็อกระบบชั่วคราวแล้ว" : "ปิดระบบชั่วคราวแล้ว" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// [9] DANGER ZONE — เพิ่ม rate limit + จำกัด collection ที่ลบได้
// ============================================================
// ก่อนแก้: ลบ collection อะไรก็ได้ ไม่ต้อง auth
// หลังแก้: ต้อง auth + rate limit + ลบได้แค่ bookings, users

app.post('/api/admin/danger/reset', authenticateAdmin, dangerLimiter, async (req, res) => {
  try {
    const itemsSnap = await db.collection('items').get();
    const batch = db.batch();
    itemsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.consumable) batch.update(doc.ref, { stock: data.initialStock || 0 });
      else batch.update(doc.ref, { status: "Available" });
    });
    await batch.commit();
    res.json({ message: "รีเซ็ตสถานะสำเร็จ" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/danger/clear/:collection', authenticateAdmin, dangerLimiter, async (req, res) => {
  try {
    const coll = req.params.collection;

    // ป้องกันไม่ให้ลบ collection ที่สำคัญ
    if (!ALLOWED_CLEAR_COLLECTIONS.includes(coll)) {
      return res.status(403).json({ error: `ไม่อนุญาตให้ลบ collection "${coll}"` });
    }

    const snapshot = await db.collection(coll).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    res.json({ message: `ลบข้อมูลทั้งหมดในหมวดหมู่นี้แล้ว` });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// [10] FORCE RETURN (admin) — เพิ่ม auth
// ============================================================
app.post('/api/admin/force-return', authenticateAdmin, async (req, res) => {
  const bookingId = sanitizeString(req.body.bookingId, 100);
  const itemId = sanitizeString(req.body.itemId, 100);

  if (!bookingId || !itemId) return res.status(400).json({ error: "ข้อมูลไม่ครบ" });

  try {
    await db.collection('bookings').doc(bookingId).update({ status: "Returned", returnedAt: admin.firestore.FieldValue.serverTimestamp() });
    const itemsSnap = await db.collection('items').where('itemId', '==', itemId).get();
    if (!itemsSnap.empty) await itemsSnap.docs[0].ref.update({ status: "Available" });
    res.json({ message: "บังคับคืนสำเร็จ" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// [11] ERROR HANDLER — ไม่ให้ error message ละเอียดหลุดออกไป
// ============================================================
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
