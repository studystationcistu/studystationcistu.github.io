const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// ============================================================
// [1] CONFIGURATION
// ============================================================
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '4168';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me-in-production';

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

// ★★★ [แก้จุดใหญ่ที่สุด] Render ใช้ proxy — ต้องตั้ง trust proxy
// ถ้าไม่ตั้ง → express-rate-limit พัง → server ตอบ 500
app.set('trust proxy', 1);

// ============================================================
// [2] CORS — ★ แก้ใหม่ให้ปลอดภัยและยืดหยุ่น
// ============================================================
function normalizeUrl(url) {
  if (!url) return '';
  return url.trim().replace(/\/$/, ''); // ตัด / ท้าย
}

// รองรับหลาย URL คั่นด้วย comma เช่น "https://a.vercel.app,https://b.vercel.app"
const envFrontendUrls = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(normalizeUrl)
  .filter(Boolean);

const allowedOrigins = [
  ...envFrontendUrls,
  'http://localhost:3000',
  'http://localhost:3001',
];

console.log('✅ Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // อนุญาต request ที่ไม่มี origin (Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = normalizeUrl(origin);
    
    // ถ้าอยู่ใน whitelist → ผ่าน
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    
    // รองรับ Vercel preview deployments (*.vercel.app) ทุก subdomain
    if (normalizedOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    console.warn('❌ CORS blocked:', normalizedOrigin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// ============================================================
// [3] RATE LIMITING
// ============================================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // เพิ่มจาก 100 → 300
  message: { error: 'คำขอมากเกินไป กรุณารอสักครู่' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'ลองรหัสผ่านมากเกินไป กรุณารอ 15 นาที' },
  standardHeaders: true,
  legacyHeaders: false,
});

const dangerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'คำขอ Danger Zone มากเกินไป' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);

// ============================================================
// [4] HEALTH CHECK — สำหรับ debug
// ============================================================
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'StudyStation API is running',
    corsOrigins: allowedOrigins,
    time: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ============================================================
// [5] JWT AUTH MIDDLEWARE
// ============================================================
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
// [6] INPUT VALIDATION
// ============================================================
function sanitizeString(str, maxLen = 200) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

function sanitizeNumber(val, min = 0, max = 99999) {
  const num = Number(val);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

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

const ALLOWED_CLEAR_COLLECTIONS = ['bookings', 'users'];

// ============================================================
// [7] ADMIN LOGIN
// ============================================================
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'กรุณากรอกรหัสผ่าน' });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }

  const token = jwt.sign(
    { role: 'admin', loginAt: Date.now() },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, message: 'เข้าสู่ระบบสำเร็จ' });
});

// ============================================================
// [8] PUBLIC ROUTES
// ============================================================
app.get('/api/items', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = [];
    snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (error) {
    console.error('GET /api/items error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings/layout', async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('layout').get();
    res.json(doc.exists ? doc.data() : { typeOrder: [] });
  } catch (error) {
    console.error('GET /api/settings/layout error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings/config', async (req, res) => {
  try {
    const doc = await db.collection('settings').doc('config').get();
    res.json(doc.exists ? doc.data() : { manualUnlock: false });
  } catch (error) {
    console.error('GET /api/settings/config error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// บันทึก/อัปเดต user
app.post('/api/users/register', async (req, res) => {
  const studentId = sanitizeString(req.body.studentId, 20);
  const fullName = sanitizeString(req.body.fullName, 200);
  const yearOfStudy = sanitizeString(req.body.yearOfStudy, 5);

  if (!studentId || !fullName) return res.status(400).json({ error: "ข้อมูลไม่ครบ" });
  if (!/^\d{10}$/.test(studentId)) return res.status(400).json({ error: "รหัสนักศึกษาต้องเป็น 10 หลัก" });

  try {
    await db.collection('users').doc(studentId).set({
      studentId, fullName, yearOfStudy,
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    res.json({ message: "บันทึกข้อมูลผู้ใช้สำเร็จ" });
  } catch (error) {
    console.error('POST /api/users/register error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/borrow', async (req, res) => {
  const itemId = sanitizeString(req.body.itemId, 100);
  const studentId = sanitizeString(req.body.studentId, 20);
  const studentName = sanitizeString(req.body.studentName, 200);
  const yearOfStudy = sanitizeString(req.body.yearOfStudy, 5);
  const qty = sanitizeNumber(req.body.qty, 1, 100);
  const startTime = sanitizeString(req.body.startTime, 30);
  const endTime = sanitizeString(req.body.endTime, 30);

  if (!studentId || !studentName) return res.status(400).json({ error: "กรุณาล็อกอิน" });
  if (!itemId) return res.status(400).json({ error: "ไม่ระบุอุปกรณ์" });

  try {
    const itemRef = db.collection('items').doc(itemId);

    const result = await db.runTransaction(async (t) => {
      const doc = await t.get(itemRef);
      if (!doc.exists) throw new Error("ไม่พบอุปกรณ์");
      const itemData = doc.data();

      if (itemData.consumable) {
        if (itemData.stock < qty) throw new Error("สต็อกไม่พอ");
        t.update(itemRef, { stock: admin.firestore.FieldValue.increment(-qty) });
        const newBookingRef = db.collection('bookings').doc();
        t.set(newBookingRef, {
          itemId: itemData.itemId, itemName: itemData.name, itemType: itemData.type,
          studentId, studentName, yearOfStudy, quantity: qty, consumable: true, status: "Consumed",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { message: "เบิกสำเร็จ" };
      } else {
        if (itemData.status === 'Borrowed') throw new Error("ถูกยืมไปแล้ว");
        t.update(itemRef, { status: 'Borrowed' });
        const newBookingRef = db.collection('bookings').doc();
        t.set(newBookingRef, {
          itemId: itemData.itemId, itemName: itemData.name, itemType: itemData.type,
          studentId, studentName, yearOfStudy, startTime, endTime, status: "Active",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { message: "ยืมสำเร็จ" };
      }
    });

    db.collection('users').doc(studentId).set({
      studentId, fullName: studentName, yearOfStudy,
      lastBorrowAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(e => console.error('user upsert err:', e.message));

    res.json(result);
  } catch (error) {
    console.error('POST /api/borrow error:', error.message);
    res.status(400).json({ error: error.message });
  }
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
  } catch (error) {
    console.error('POST /api/return error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/my-bookings/:studentId', async (req, res) => {
  const studentId = sanitizeString(req.params.studentId, 20);
  if (!studentId) return res.status(400).json({ error: "ไม่ระบุรหัสนักศึกษา" });

  try {
    const snapshot = await db.collection('bookings').where('studentId', '==', studentId).get();
    const myBookings = [];
    snapshot.forEach(doc => myBookings.push({ id: doc.id, ...doc.data() }));
    res.json(myBookings);
  } catch (error) {
    console.error('GET /api/my-bookings error:', error.message);
    res.status(500).json({ error: error.message });
  }
});
// ============================================================
// [8.5] LEADERBOARD — อันดับผู้ยืมสูงสุดตลอดกาล
// ============================================================
app.get('/api/leaderboard', async (req, res) => {
  try {
    const snapshot = await db.collection('bookings').get();
    
    // นับจำนวนการยืมของแต่ละคน
    const counts = {};
    snapshot.forEach(doc => {
      const b = doc.data();
      if (!b.studentId) return;
      
      if (!counts[b.studentId]) {
        counts[b.studentId] = {
          studentId: b.studentId,
          studentName: b.studentName || 'ไม่ระบุ',
          yearOfStudy: b.yearOfStudy || '-',
          totalCount: 0,      // จำนวนรายการทั้งหมด
          borrowCount: 0,     // ยืม-คืน (กี่ครั้ง)
          consumeCount: 0,    // เบิกวัสดุ (กี่ครั้ง)
          totalQuantity: 0    // จำนวนชิ้นรวม (สำหรับเบิก)
        };
      }
      
      counts[b.studentId].totalCount += 1;
      
      if (b.consumable || b.status === 'Consumed') {
        counts[b.studentId].consumeCount += 1;
        counts[b.studentId].totalQuantity += (b.quantity || 1);
      } else {
        counts[b.studentId].borrowCount += 1;
      }
    });
    
    // เรียงจากมากไปน้อย เอาแค่ Top 10
    const leaderboard = Object.values(counts)
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 10);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('GET /api/leaderboard error:', error.message);
    res.status(500).json({ error: error.message });
  }
});
// ============================================================
// [9] ADMIN ROUTES
// ============================================================
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
  } catch (error) {
    console.error('GET /api/admin/all-data error:', error.message);
    res.status(500).json({ error: error.message });
  }
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
    const typeOrder = Array.isArray(req.body.typeOrder) ? req.body.typeOrder.map(t => sanitizeString(t)) : [];
    await db.collection('settings').doc('layout').set({ typeOrder }, { merge: true });
    res.json({ message: "บันทึกการจัดเรียงเรียบร้อย" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/settings/config', authenticateAdmin, async (req, res) => {
  try {
    const manualUnlock = Boolean(req.body.manualUnlock);
    await db.collection('settings').doc('config').set({ manualUnlock }, { merge: true });
    res.json({ message: manualUnlock ? "ปลดล็อกระบบชั่วคราวแล้ว" : "ปิดระบบชั่วคราวแล้ว" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// [10] DANGER ZONE
// ============================================================
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
// [11] FORCE RETURN
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
// [12] ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed for this origin' });
  }
  res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`✅ Allowed origins:`, allowedOrigins);
});
