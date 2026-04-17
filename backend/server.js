const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

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
  const { itemId, studentId, studentName, qty, startTime, endTime } = req.body;
  if (!studentId || !studentName) return res.status(400).json({ error: "กรุณาล็อกอิน" });
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
  const { bookingId, itemId } = req.body;
  try {
    await db.collection('bookings').doc(bookingId).update({ status: "Returned", returnedAt: admin.firestore.FieldValue.serverTimestamp() });
    const itemsSnap = await db.collection('items').where('itemId', '==', itemId).get();
    if (!itemsSnap.empty) await itemsSnap.docs[0].ref.update({ status: "Available" });
    res.json({ message: "คืนสำเร็จ" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/my-bookings/:studentId', async (req, res) => {
  try {
    const snapshot = await db.collection('bookings').where('studentId', '==', req.params.studentId).get();
    const myBookings = [];
    snapshot.forEach(doc => myBookings.push({ id: doc.id, ...doc.data() }));
    res.json(myBookings);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/all-data', async (req, res) => {
  try {
    const [itemsSnap, bookingsSnap, usersSnap, r1Snap, r2Snap, layoutSnap, configSnap] = await Promise.all([
      db.collection('items').get(), db.collection('bookings').get(), db.collection('users').get(),
      db.collection('year1_roster').get(), db.collection('year2_roster').get(),
      db.collection('settings').doc('layout').get(),
      db.collection('settings').doc('config').get()
    ]);
    res.json({
      items: itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      bookings: bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.createdAt?._seconds||0) - (a.createdAt?._seconds||0)),
      users: usersSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      roster1: r1Snap.docs.map(d => ({ id: d.id, ...d.data() })),
      roster2: r2Snap.docs.map(d => ({ id: d.id, ...d.data() })),
      layoutOrder: layoutSnap.exists ? layoutSnap.data().typeOrder || [] : [],
      config: configSnap.exists ? configSnap.data() : { manualUnlock: false }
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/items', async (req, res) => {
  try {
    await db.collection('items').doc(req.body.itemId).set(req.body, { merge: true });
    res.json({ message: "บันทึกอุปกรณ์สำเร็จ" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/items/auto-add', async (req, res) => {
  const { type, name, color, imageUrl } = req.body;
  try {
    const snap = await db.collection('items').where('type', '==', type).get();
    let maxNum = 0;
    snap.forEach(doc => {
      const num = doc.data().number;
      if (num && num > maxNum) maxNum = num;
    });
    const nextNum = maxNum + 1;
    const newId = `${type}_${String(nextNum).padStart(3, '0')}`;
    const newItem = { itemId: newId, type, name, color, imageUrl: imageUrl || "", status: "Available", number: nextNum, consumable: false };
    await db.collection('items').doc(newId).set(newItem);
    res.json({ message: `สร้างรหัสอุปกรณ์ชิ้นใหม่สำเร็จ`, item: newItem });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/items/bulk', async (req, res) => {
  try {
    const batch = db.batch();
    req.body.items.forEach(it => batch.set(db.collection('items').doc(it.itemId), it));
    await batch.commit();
    res.json({ message: "เพิ่มแบบชุดสำเร็จ" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/types/:type/update', async (req, res) => {
  const type = req.params.type;
  const { name, color, imageUrl, consumable } = req.body;
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
      snap.forEach(doc => batch.update(doc.ref, { name, color, imageUrl: imageUrl || "" }));
      await batch.commit();
      return res.json({ message: "อัปเดตข้อมูลกลุ่มสำเร็จ" });
    }

    if (!currentIsConsumable && consumable) {
      const totalStock = unitDocs.length;
      unitDocs.forEach(doc => batch.delete(db.collection('items').doc(doc.id)));
      const newId = `${type}_stock`;
      batch.set(db.collection('items').doc(newId), {
        itemId: newId, type, name, color, imageUrl: imageUrl || "",
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
          itemId: newId, type, name, color, imageUrl: imageUrl || "",
          consumable: false, status: "Available", number: i
        });
      }
      await batch.commit();
      return res.json({ message: "เปลี่ยนเป็นอุปกรณ์ยืม-คืนสำเร็จ" });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/items/:id', async (req, res) => {
  try { await db.collection('items').doc(req.params.id).delete(); res.json({ message: "ลบสำเร็จ" }); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/items/:id/update', async (req, res) => {
  try { await db.collection('items').doc(req.params.id).update(req.body); res.json({ message: "อัปเดตสำเร็จ" }); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/bookings/:id', async (req, res) => {
  try { await db.collection('bookings').doc(req.params.id).delete(); res.json({ message: "ลบประวัติสำเร็จ" }); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try { await db.collection('users').doc(req.params.id).delete(); res.json({ message: "ลบผู้ใช้สำเร็จ" }); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/roster/:year', async (req, res) => {
  const coll = req.params.year === '1' ? 'year1_roster' : 'year2_roster';
  try { await db.collection(coll).doc(req.body.studentId).set(req.body, { merge: true }); res.json({ message: "บันทึกรายชื่อสำเร็จ" }); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/admin/roster/:year/:id', async (req, res) => {
  const coll = req.params.year === '1' ? 'year1_roster' : 'year2_roster';
  try { await db.collection(coll).doc(req.params.id).delete(); res.json({ message: "ลบรายชื่อสำเร็จ" }); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/roster/:year/seed', async (req, res) => {
  const coll = req.params.year === '1' ? 'year1_roster' : 'year2_roster';
  try {
    const batch = db.batch();
    req.body.roster.forEach(r => batch.set(db.collection(coll).doc(r.id), { studentId: r.id, fullName: r.name }));
    await batch.commit();
    res.json({ message: "เติมรายชื่อสำเร็จ" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/settings/layout', async (req, res) => {
  try {
    await db.collection('settings').doc('layout').set(req.body, { merge: true });
    res.json({ message: "บันทึกการจัดเรียงเรียบร้อย" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/settings/config', async (req, res) => {
  try {
    await db.collection('settings').doc('config').set(req.body, { merge: true });
    res.json({ message: req.body.manualUnlock ? "ปลดล็อกระบบชั่วคราวแล้ว" : "ปิดระบบชั่วคราวแล้ว" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/danger/reset', async (req, res) => {
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

app.post('/api/admin/danger/clear/:collection', async (req, res) => {
  try {
    const coll = req.params.collection;
    const snapshot = await db.collection(coll).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    res.json({ message: `ลบข้อมูลทั้งหมดในหมวดหมู่นี้แล้ว` });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.listen(port, () => console.log(`Server running on port ${port}`));