// ============================================================
// auth.js — จัดการ JWT Token ฝั่ง Frontend
// ============================================================
// ก่อนแก้: เก็บรหัสผ่านใน source code, เช็ค password ฝั่ง client
// หลังแก้: ส่ง password ไป server, รับ JWT token กลับมา, 
//          แนบ token ทุก request

const API_BASE = "https://studystation-api.onrender.com";
const TOKEN_KEY = "studystation_admin_token";

// --- เข้าสู่ระบบ: ส่งรหัสผ่านไป server ---
export async function adminLogin(password) {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "เข้าสู่ระบบไม่สำเร็จ");
  }

  // เก็บ token ไว้ใน localStorage
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

// --- ออกจากระบบ ---
export function adminLogout() {
  localStorage.removeItem(TOKEN_KEY);
}

// --- เช็คว่ามี token อยู่หรือไม่ ---
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// --- เช็คว่า token หมดอายุหรือยัง ---
export function isTokenValid() {
  const token = getToken();
  if (!token) return false;

  try {
    // JWT มี 3 ส่วน: header.payload.signature
    // decode payload (ส่วนที่ 2) เพื่อเช็ค exp
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// --- fetch ที่แนบ token อัตโนมัติ ---
export async function adminFetch(url, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("ไม่พบ Token — กรุณาเข้าสู่ระบบใหม่");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  // ถ้า server ตอบ 401 = token หมดอายุ
  if (res.status === 401) {
    adminLogout();
    throw new Error("Session หมดอายุ — กรุณาเข้าสู่ระบบใหม่");
  }

  return res;
}
