"use client";
import { useState, useEffect } from "react";

// ==========================================
// 1. ข้อมูลตั้งต้น (Icons & Constants)
// ==========================================
const LOGO_URL="data:image/webp;base64,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";

const ICON = {
  ruler_short: `<svg viewBox="0 0 64 64"><rect x="8" y="22" width="48" height="20" rx="2" fill="#fde047" stroke="#854d0e" stroke-width="2"/><line x1="14" y1="22" x2="14" y2="30" stroke="#854d0e" stroke-width="2"/><line x1="22" y1="22" x2="22" y2="34" stroke="#854d0e" stroke-width="2"/><line x1="30" y1="22" x2="30" y2="30" stroke="#854d0e" stroke-width="2"/><line x1="38" y1="22" x2="38" y2="34" stroke="#854d0e" stroke-width="2"/><line x1="46" y1="22" x2="46" y2="30" stroke="#854d0e" stroke-width="2"/></svg>`,
  ruler_long: `<svg viewBox="0 0 64 64"><rect x="4" y="24" width="56" height="16" rx="2" fill="#fcd34d" stroke="#854d0e" stroke-width="2"/><line x1="10" y1="24" x2="10" y2="32" stroke="#854d0e" stroke-width="1.5"/><line x1="16" y1="24" x2="16" y2="36" stroke="#854d0e" stroke-width="1.5"/><line x1="22" y1="24" x2="22" y2="32" stroke="#854d0e" stroke-width="1.5"/><line x1="28" y1="24" x2="28" y2="36" stroke="#854d0e" stroke-width="1.5"/><line x1="34" y1="24" x2="34" y2="32" stroke="#854d0e" stroke-width="1.5"/><line x1="40" y1="24" x2="40" y2="36" stroke="#854d0e" stroke-width="1.5"/><line x1="46" y1="24" x2="46" y2="32" stroke="#854d0e" stroke-width="1.5"/><line x1="52" y1="24" x2="52" y2="36" stroke="#854d0e" stroke-width="1.5"/></svg>`,
  cutter: `<svg viewBox="0 0 64 64"><rect x="8" y="26" width="40" height="12" rx="2" fill="#fbbf24" stroke="#78350f" stroke-width="2"/><polygon points="48,26 60,30 60,34 48,38" fill="#e5e7eb" stroke="#475569" stroke-width="2"/><circle cx="20" cy="32" r="2" fill="#78350f"/><circle cx="32" cy="32" r="2" fill="#78350f"/></svg>`,
  pen_blue: `<svg viewBox="0 0 64 64"><rect x="20" y="8" width="14" height="40" rx="2" fill="#3b82f6" stroke="#1e3a8a" stroke-width="2"/><polygon points="20,48 34,48 27,58" fill="#1e3a8a"/><rect x="20" y="14" width="14" height="4" fill="#1e40af"/><rect x="36" y="16" width="3" height="20" rx="1" fill="#1e3a8a"/></svg>`,
  pen_red: `<svg viewBox="0 0 64 64"><rect x="20" y="8" width="14" height="40" rx="2" fill="#ef4444" stroke="#7f1d1d" stroke-width="2"/><polygon points="20,48 34,48 27,58" fill="#7f1d1d"/><rect x="20" y="14" width="14" height="4" fill="#b91c1c"/><rect x="36" y="16" width="3" height="20" rx="1" fill="#7f1d1d"/></svg>`,
  pen_black: `<svg viewBox="0 0 64 64"><rect x="20" y="8" width="14" height="40" rx="2" fill="#1f2937" stroke="#000" stroke-width="2"/><polygon points="20,48 34,48 27,58" fill="#000"/><rect x="20" y="14" width="14" height="4" fill="#374151"/><rect x="36" y="16" width="3" height="20" rx="1" fill="#000"/></svg>`,
  liquid_water: `<svg viewBox="0 0 64 64"><rect x="22" y="12" width="20" height="36" rx="3" fill="#fff" stroke="#0284c7" stroke-width="2"/><rect x="26" y="6" width="12" height="8" rx="1" fill="#0ea5e9" stroke="#0284c7" stroke-width="2"/><rect x="24" y="20" width="16" height="14" fill="#dbeafe"/><text x="32" y="32" font-size="9" text-anchor="middle" fill="#0284c7" font-weight="bold">LIQ</text></svg>`,
  liquid_tape: `<svg viewBox="0 0 64 64"><rect x="14" y="18" width="36" height="28" rx="4" fill="#f1f5f9" stroke="#475569" stroke-width="2"/><circle cx="24" cy="32" r="6" fill="#fff" stroke="#475569" stroke-width="2"/><circle cx="40" cy="32" r="6" fill="#fff" stroke="#475569" stroke-width="2"/><rect x="20" y="12" width="24" height="8" rx="2" fill="#94a3b8"/></svg>`,
  stapler_refill: `<svg viewBox="0 0 64 64"><rect x="10" y="22" width="44" height="20" rx="2" fill="#fbbf24" stroke="#78350f" stroke-width="2"/><line x1="16" y1="22" x2="16" y2="42" stroke="#78350f"/><line x1="22" y1="22" x2="22" y2="42" stroke="#78350f"/><line x1="28" y1="22" x2="28" y2="42" stroke="#78350f"/><line x1="34" y1="22" x2="34" y2="42" stroke="#78350f"/><line x1="40" y1="22" x2="40" y2="42" stroke="#78350f"/><line x1="46" y1="22" x2="46" y2="42" stroke="#78350f"/></svg>`,
  eraser: `<svg viewBox="0 0 64 64"><rect x="12" y="22" width="40" height="20" rx="3" fill="#fda4af" stroke="#9f1239" stroke-width="2"/><rect x="12" y="22" width="40" height="6" fill="#fb7185"/></svg>`,
  pencil: `<svg viewBox="0 0 64 64"><rect x="22" y="14" width="14" height="34" fill="#fbbf24" stroke="#78350f" stroke-width="2"/><polygon points="22,48 36,48 29,60" fill="#1f2937"/><polygon points="22,48 36,48 29,54" fill="#fde68a"/><rect x="22" y="8" width="14" height="8" fill="#dc2626" stroke="#78350f" stroke-width="2"/></svg>`,
  tape_clear: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="#06b6d4" stroke-width="3"/><circle cx="32" cy="32" r="22" fill="#a5f3fc" opacity="0.4"/><circle cx="32" cy="32" r="10" fill="#cffafe" stroke="#06b6d4" stroke-width="2"/></svg>`,
  sharpener: `<svg viewBox="0 0 64 64"><rect x="14" y="18" width="36" height="28" rx="4" fill="#a78bfa" stroke="#5b21b6" stroke-width="2"/><circle cx="32" cy="32" r="6" fill="#1f2937" stroke="#5b21b6" stroke-width="2"/><circle cx="32" cy="32" r="2" fill="#fff"/></svg>`,
  stapler: `<svg viewBox="0 0 64 64"><path d="M 8 36 L 56 28 L 56 38 L 8 42 Z" fill="#f43f5e" stroke="#881337" stroke-width="2"/><rect x="10" y="40" width="44" height="6" rx="2" fill="#9f1239" stroke="#881337" stroke-width="2"/><rect x="14" y="32" width="32" height="3" fill="#fbbf24"/></svg>`,
  paper_clip: `<svg viewBox="0 0 64 64"><path d="M 22 12 L 22 48 Q 22 54 28 54 Q 34 54 34 48 L 34 18 Q 34 14 38 14 Q 42 14 42 18 L 42 44" stroke="#f59e0b" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  scissors: `<svg viewBox="0 0 64 64"><circle cx="18" cy="20" r="8" fill="none" stroke="#a855f7" stroke-width="3"/><circle cx="18" cy="44" r="8" fill="none" stroke="#a855f7" stroke-width="3"/><line x1="24" y1="24" x2="54" y2="40" stroke="#64748b" stroke-width="3" stroke-linecap="round"/><line x1="24" y1="40" x2="54" y2="24" stroke="#64748b" stroke-width="3" stroke-linecap="round"/></svg>`,
  paper_a4: `<svg viewBox="0 0 64 64"><rect x="14" y="8" width="36" height="48" rx="2" fill="#fff" stroke="#64748b" stroke-width="2"/><line x1="20" y1="18" x2="44" y2="18" stroke="#cbd5e1" stroke-width="2"/><line x1="20" y1="26" x2="44" y2="26" stroke="#cbd5e1" stroke-width="2"/><line x1="20" y1="34" x2="44" y2="34" stroke="#cbd5e1" stroke-width="2"/><line x1="20" y1="42" x2="38" y2="42" stroke="#cbd5e1" stroke-width="2"/><text x="32" y="54" font-size="6" text-anchor="middle" fill="#64748b" font-weight="bold">A4</text></svg>`,
  tape_clear_l: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#06b6d4" stroke-width="3"/><circle cx="32" cy="32" r="26" fill="#a5f3fc" opacity="0.4"/><circle cx="32" cy="32" r="10" fill="#cffafe" stroke="#06b6d4" stroke-width="2"/><text x="32" y="36" font-size="7" text-anchor="middle" fill="#06b6d4" font-weight="bold">L</text></svg>`,
  tape_clear_m: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="#06b6d4" stroke-width="3"/><circle cx="32" cy="32" r="22" fill="#a5f3fc" opacity="0.4"/><circle cx="32" cy="32" r="9" fill="#cffafe" stroke="#06b6d4" stroke-width="2"/><text x="32" y="35" font-size="6" text-anchor="middle" fill="#06b6d4" font-weight="bold">M</text></svg>`,
  tape_clear_s: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="none" stroke="#06b6d4" stroke-width="3"/><circle cx="32" cy="32" r="18" fill="#a5f3fc" opacity="0.4"/><circle cx="32" cy="32" r="8" fill="#cffafe" stroke="#06b6d4" stroke-width="2"/><text x="32" y="35" font-size="6" text-anchor="middle" fill="#06b6d4" font-weight="bold">S</text></svg>`
};
ICON.pen_horse_blue = ICON.pen_blue;
const FALLBACK_ICON = `<svg viewBox="0 0 64 64"><rect x="14" y="14" width="36" height="36" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/><text x="32" y="38" font-size="20" text-anchor="middle" fill="#64748b">?</text></svg>`;

function getIcon(type) { return ICON[type] || FALLBACK_ICON; }

const YEAR1_ROSTER=[{"id":"6824493016","name":"นางสาวบุณยานุช ธรรมจรรโลง"},{"id":"6824763012","name":"นางสาวกชพรรณ แก้วมา"},{"id":"6824763020","name":"นางสาวกฤษณวรรศ อินทนิล"},{"id":"6824763038","name":"นางสาวกวินทรา ปรีชาญาณ"},{"id":"6824763046","name":"นางสาวกวินธิดา โชติกพนิช"},{"id":"6824763053","name":"นางสาวกัญญาณัฐ ลายนาค"},{"id":"6824763061","name":"นางสาวกัลยรัตน์ เกตุศรี"},{"id":"6824763079","name":"นางสาวกานต์ธิดา ปลอดทอง"},{"id":"6824763087","name":"นางสาวกีรัตติยา วงศ์มีแก้ว"},{"id":"6824763103","name":"นางสาวจุฑารัตน์ ตันเจริญ"},{"id":"6824763111","name":"นายฉันทวัฒน์ นิธินรเศรษฐ"},{"id":"6824763129","name":"นางสาวชนิศา วิวัฒน์พงศ์กิจ"},{"id":"6824763137","name":"นายชาคริต ชัยวิชิต"},{"id":"6824763145","name":"นายชุติเดช ศรีไทย"},{"id":"6824763152","name":"นางสาวชุติมา ทวีสมาน"},{"id":"6824763160","name":"นางสาวญาณิศา อภิบาลศรี"},{"id":"6824763178","name":"นางสาวฐิตาภรณ์ อ่อนแก้ว"},{"id":"6824763186","name":"นางสาวฐิติวรดา เตชะศรี"},{"id":"6824763194","name":"นางสาวฐิติวรดา ฟักขาว"},{"id":"6824763202","name":"นายณัฏฐพล ทัยคง"},{"id":"6824763210","name":"นายณัฐพล วีระวงศ์"},{"id":"6824763228","name":"นางสาวณิชกานต์ เตสุชาตะ"},{"id":"6824763244","name":"นางสาวณิชาภัทร ยิ่งดำนุ่น"},{"id":"6824763251","name":"นางสาวทยา ประสารการ"},{"id":"6824763269","name":"นางสาวธณัสนันท์ ทองทาย"},{"id":"6824763277","name":"นายธนเดช อุดมเสรีย์"},{"id":"6824763285","name":"นายธนวัฒน์ พันทะบุตร"},{"id":"6824763293","name":"นายธนวินท์ สำลีวงค์"},{"id":"6824763327","name":"นางสาวธันยากานต์ วัฒน์ธนินโภคิน"},{"id":"6824763335","name":"นางสาวธิญาดา แสนจันทร์"},{"id":"6824763343","name":"นายธีรวัฒน์ ขุนเพชร"},{"id":"6824763350","name":"นางสาวนติกานต์ ศรีจันทร์"},{"id":"6824763368","name":"นางสาวนวพร วีรประเสริฐสกุล"},{"id":"6824763384","name":"นางสาวเนติมากร แสงจันทร์"},{"id":"6824763392","name":"นางสาวบัณฑิตา เมฆแดง"},{"id":"6824763400","name":"นางสาวปริยากร ทองด้วง"},{"id":"6824763418","name":"นางสาวปริยากร ปานจันทร์"},{"id":"6824763426","name":"นางสาวปวริศา สุขเจริญ"},{"id":"6824763434","name":"นางสาวปาทิตตา สุนทรศารทูล"},{"id":"6824763442","name":"นางสาวปาริชาติ ราชนาวี"},{"id":"6824763459","name":"นายปิยพัทธ์ ปานะ"},{"id":"6824763467","name":"นายปิยพัทธ์ ญาณหาญ"},{"id":"6824763475","name":"นางสาวปุณณาสา ถนอมสิน"},{"id":"6824763483","name":"นางสาวปุณยาพร เจริญพานิชเสรี"},{"id":"6824763491","name":"นายพณศักดิ์ สังข์ขำ"},{"id":"6824763509","name":"นางสาวพฤกษารัฐ แก้วสกุล"},{"id":"6824763517","name":"นางสาวพิมพ์พรรษา พร้อมสุข"},{"id":"6824763525","name":"นางสาวเพ็ญนีตี้ สุรพงษ์ชาญเดช"},{"id":"6824763533","name":"นางสาวมนัญญา โสตติยัง"},{"id":"6824763558","name":"นางสาวมัชฌิมา แดงสากล"},{"id":"6824763574","name":"นางสาวมาริสา จินดาวงษ์"},{"id":"6824763582","name":"นางสาวรมิตา เพาะปลูก"},{"id":"6824763590","name":"นายรักษ์สิริ ปานเนตรแก้ว"},{"id":"6824763608","name":"นางสาวรัตนประภา อินทรบุญ"},{"id":"6824763616","name":"นางสาวลภัสรดา เพ็งพูน"},{"id":"6824763624","name":"นางสาววนัสนันท์ คงสมบูรณ์"},{"id":"6824763632","name":"นางสาววริษฐา เทศนอก"},{"id":"6824763640","name":"นายวาทศิลป์ สัตย์ซื่อ"},{"id":"6824763665","name":"นายวีราทร สำเภาเงิน"},{"id":"6824763673","name":"นางสาวศิรดา สุขสม"},{"id":"6824763699","name":"นางสาวสุพัตรา สายอินทร์"},{"id":"6824763707","name":"นางสาวสุภัสสรา หวังสุข"},{"id":"6824763715","name":"นางสาวสุภาพร อัลท์แฮร์"},{"id":"6824763723","name":"นางสาวอภิชญา สมวะเวียง"},{"id":"6824763749","name":"นางสาวอรพิน น้อยฉวี"},{"id":"6824763756","name":"นางสาวอรรัมภา ราชเครือ"},{"id":"6824763764","name":"นายอาณกร สุขสำราญ"},{"id":"6824763772","name":"นางสาวอิษฎาอร ช่วยศรี"},{"id":"6824763798","name":"นางสาวจินดามณี ฟุ้งพิมาย"},{"id":"6824763806","name":"นางสาวจุฑาทิพย์ หาญทะเล"},{"id":"6824763814","name":"นางสาวชุติกาญจน์ ทองธานี"},{"id":"6824763822","name":"นายฐูปกร แสงโพธิ์"},{"id":"6824763830","name":"นายฐิติวัสส์ พยัมบุตร"},{"id":"6824763848","name":"นางสาวณัฏฐ์ภัสสร ธนาเพ็ญภาส"},{"id":"6824763855","name":"นางสาวนฤธร เชียงหลี"},{"id":"6824763863","name":"นางสาวนิชาพร พิมธรรมมา"},{"id":"6824763871","name":"นายบวรวิชญ์ ระหัส"},{"id":"6824763889","name":"นางสาวบัณฑิตา พรมสิงห์"},{"id":"6824763897","name":"นางสาวปัณณภัสสร์ มธุรอัมพิลานันต์"},{"id":"6824763905","name":"นายพิศณุพงศ์ สมศรี"},{"id":"6824763913","name":"นางสาวเพียงขวัญ สันตินันตรักษ์"},{"id":"6824763921","name":"นางสาวแพรวา นิ่มมา"},{"id":"6824763939","name":"นางสาวภูริชญา กุหลาบ"},{"id":"6824763947","name":"นางสาวมณฑกาญจน์ คชกูล"},{"id":"6824763954","name":"นางสาวมนัสชนก จันทร์วิภาค"},{"id":"6824763962","name":"นางสาวมัตติกา สุนทรวิทย์"},{"id":"6824763970","name":"นางสาวฤามเม ภัทรสิงหสิริกุล"},{"id":"6824763988","name":"นางสาววริศรา เทศนะ"},{"id":"6824763996","name":"นางสาววิรัชชยากร นพรัตน์ธนัย"},{"id":"6824764002","name":"นางสาววิลาสินี อุดมเวช"},{"id":"6824764010","name":"นางสาวศรัญภา ศรีแฉล้ม"},{"id":"6824764028","name":"นางสาวสุรภา คูหะสุวรรณ"},{"id":"6824764036","name":"นางสาวสุวพิชชา กุลน้อย"},{"id":"6824764044","name":"นายแอล สวนจันทร์"},{"id":"6824764051","name":"นางสาวกนกพรรณ ศรีอ่อน"},{"id":"6824764069","name":"นางสาวกุลณัฐ ชนะกุล"},{"id":"6824764077","name":"นางสาวขวัญชนก นาคสงวน"},{"id":"6824764085","name":"นายโฆษิต ชัยราษฎร์"},{"id":"6824764093","name":"นายชยพล แสงม่วง"},{"id":"6824764101","name":"นางสาวชลนิภา ขรัวทองเขียว"},{"id":"6824764119","name":"นางสาวชวัลนุช พฤกษจำรูญ"},{"id":"6824764127","name":"นางสาวชาลิสา พิพัฒน์ธนสกุล"},{"id":"6824764135","name":"นางสาวชาลิสา เทียนบูชา"},{"id":"6824764143","name":"นางสาวชีรีน ปาทาน"},{"id":"6824764150","name":"นางสาวณณัฐ ชนะกิจ"},{"id":"6824764168","name":"นายณนน อินทชาติ"},{"id":"6824764176","name":"นายธนบดี ไชยคำภา"},{"id":"6824764184","name":"นายธนพจน์ เฉลิมพันธ์"},{"id":"6824764192","name":"นางสาวธนินีกานต์ มณีเนตร"},{"id":"6824764200","name":"นางสาวธยานี รัตนศรี"},{"id":"6824764218","name":"นางสาวนิชาภา ธรรมานนท์"},{"id":"6824764226","name":"นางสาวบุญญาดา จันทรสิทธิ์"},{"id":"6824764234","name":"นางสาวเบญจรัตน์ นามวงค์"},{"id":"6824764242","name":"นางสาวปทิตตา ทานะมัย"},{"id":"6824764259","name":"นายปพนธีร์ ชัยมา"},{"id":"6824764267","name":"นางสาวปภาวรินทร์ ประทุมมาตย์"},{"id":"6824764275","name":"นางสาวปริยากร จารุประวิทย์"},{"id":"6824764283","name":"นางสาวปริยาภัทร เมิดไธสง"},{"id":"6824764291","name":"นางสาวปรียาพร ศรีอุดม"},{"id":"6824764309","name":"นางสาวปลายฟ้า บุปผาลุน"},{"id":"6824764317","name":"นายปวีณ ภัทรมงคลกุล"},{"id":"6824764325","name":"นางสาวปิยากร บัวผัด"},{"id":"6824764333","name":"นางสาวพรปวีณ์ ขุนพิทักษ์"},{"id":"6824764341","name":"นางสาวพิชญธิดา คงฤทธิ์"},{"id":"6824764358","name":"นางสาวพีรดา พุ่มขจร"},{"id":"6824764366","name":"นายภัทรดล คงนิล"},{"id":"6824764374","name":"นางสาวภัทรธิดา จงโปรย"},{"id":"6824764382","name":"นางสาวเมนี่ ไพศาลพนา"},{"id":"6824764390","name":"นางสาวรัจศุมณค์ เพชรพรศิริกุล"},{"id":"6824764408","name":"นางสาวรัตติกา รัตนมงคล"},{"id":"6824764416","name":"นางสาวรัตนาวดี บุตรน้อย"},{"id":"6824764424","name":"นายโรแมน คลีเมนท์"},{"id":"6824764432","name":"นางสาวลิเดีย ดวงปัญญา"},{"id":"6824764440","name":"นางสาววยากร ชยานุกูล"},{"id":"6824764457","name":"นายวรพิชญ์ มูลปา"},{"id":"6824764465","name":"นางสาววรรณวนัช กิจเอื้อวิริยะ"},{"id":"6824764473","name":"นายวรวุฒิ สุวรรณชัย"},{"id":"6824764481","name":"นางสาวสาริศา พรหมภักดี"},{"id":"6824764499","name":"นางสาวสิรภัทร บุตรสาทร"},{"id":"6824764507","name":"นางสาวสุทธิดา ไชยวรณ์"},{"id":"6824764515","name":"นางสาวสุธีรา สินาคมมาศ"},{"id":"6824764523","name":"นางสาวสุพิชฌา ช่วยนุกูล"},{"id":"6824764531","name":"นางสาวอนัญญา รัตนวิเชียร"},{"id":"6824764549","name":"นางสาวอัฐภิญญา เดชกุล"},{"id":"6824764556","name":"นางสาวอิศริญา ประดับศิลป"},{"id":"6824764564","name":"นายอุกฤษณ์ คำวิงวร"}];
const YEAR2_ROSTER=[{"id":"6724763013","name":"นางสาวกชมน นเรนทร์ราช"},{"id":"6724763021","name":"นางสาวกรรวี รสหวาน"},{"id":"6724763039","name":"นายกฤตยชญ์ ชาวเนียม"},{"id":"6724763047","name":"นางสาวก้องกฤดากร จันทร์เมือง"},{"id":"6724763054","name":"นางสาวกานต์พิชชา คงทอง"},{"id":"6724763070","name":"นางสาวเข็มอัปสร เกิดผล"},{"id":"6724763088","name":"นางสาวจิรสุดา สุทธิเดช"},{"id":"6724763096","name":"นายจีระพัชร กัดเกื้อ"},{"id":"6724763104","name":"นางสาวจุไลลา เทศแท้"},{"id":"6724763112","name":"นางสาวฉัตรชนก ณ ประเสริฐ"},{"id":"6724763120","name":"นางสาวชนัญชิดา สอนเลิศ"},{"id":"6724763138","name":"นางสาวชนัญญา จันทรา"},{"id":"6724763146","name":"นางสาวชนารดี นันตโลหิต"},{"id":"6724763153","name":"นางสาวชลธิชา ศรมณี"},{"id":"6724763161","name":"นางสาวณิชากร รักษายศ"},{"id":"6724763179","name":"นายตรัยคุณ ไชยศร"},{"id":"6724763203","name":"นายนนทพัทธ์ สระทองขาว"},{"id":"6724763211","name":"นางสาวนภัสสรณ์ หรรษานุกรม"},{"id":"6724763229","name":"นางสาวนภสร แสนกาสา"},{"id":"6724763245","name":"นางสาวปวรัมภา ลีลาวัฒนสุข"},{"id":"6724763252","name":"นางสาวปาริฉัตร ตันทวงค์"},{"id":"6724763278","name":"นางสาวปุณยาภา ไชยรัตน์"},{"id":"6724763286","name":"นางสาวปุณิกา กาญจนบุติ"},{"id":"6724763294","name":"นางสาวพรนภา ส่วยสม"},{"id":"6724763302","name":"นางสาวพลอยชมพู แนมเถื่อน"},{"id":"6724763310","name":"นางสาวพิชญ์นาท วิศพันธุ์"},{"id":"6724763328","name":"นางสาวพิชญาภา ดาวเรือง"},{"id":"6724763336","name":"นางสาวพีรดา แสงรัตน์"},{"id":"6724763344","name":"นายภักดี กลิ่นภักดี"},{"id":"6724763351","name":"นางสาวภัทรวดี รุ่งสกุลลิขิต"},{"id":"6724763369","name":"นางสาวภูริชญา แพน้อย"},{"id":"6724763377","name":"นางสาวภูษณิศา พ่วงภักดี"},{"id":"6724763393","name":"นางสาวยศวดี ดีสิน"},{"id":"6724763427","name":"นางสาวร้อยทองทา ด้วงทอง"},{"id":"6724763435","name":"นายรัชพล วรงไชย"},{"id":"6724763443","name":"นางสาวริญญ์รัตน์ ธัญเลิศพัฒนากิจ"},{"id":"6724763450","name":"นางสาววรัญญา แหลมกีกำ"},{"id":"6724763468","name":"นายวรัทย์พล พันธุ์โอสถ"},{"id":"6724763476","name":"นางสาววริศรา แสนเสนาะ"},{"id":"6724763484","name":"นางสาววริศรา กรเกษม"},{"id":"6724763492","name":"นางสาววรินทิพย์ บุญธรรม"},{"id":"6724763500","name":"นายวิภาส มุนีพรหม"},{"id":"6724763518","name":"นายวีรภัทร ผิวเกลี้ยง"},{"id":"6724763526","name":"นางสาวศุภิสรา วรุณธาพิทย์"},{"id":"6724763534","name":"นางสาวศุลีพร หดกระโทก"},{"id":"6724763542","name":"นายสรัล วรรณพงษ์"},{"id":"6724763559","name":"นางสาวสิริลักษณ์ กุลศิริ"},{"id":"6724763567","name":"นางสาวสุธาดา พวงทอง"},{"id":"6724763575","name":"นางสาวสุรัตน์วดี พลวงษ์ศรี"},{"id":"6724763583","name":"นางสาวอรณัญช์ บัวเกิด"},{"id":"6724763591","name":"นางสาวอริสรา ติณราช"},{"id":"6724763609","name":"นางสาวอัจฉรา เรืองคำโฮ"},{"id":"6724763617","name":"นายอันดา บุญมาแย้ม"},{"id":"6724763625","name":"นางสาวอารยา แมคแคมมอน"},{"id":"6724763633","name":"นางสาวอุรชา เชียงหลี"},{"id":"6724763641","name":"นางสาวกรวรรณ ทองสัมฤทธิ์"},{"id":"6724763658","name":"นางสาวกัญญาภัค ประเสริฐ"},{"id":"6724763666","name":"นายกันต์กวี รัตนสาขา"},{"id":"6724763674","name":"นายกันต์กษิดิศ สุชนกิจสกุล"},{"id":"6724763682","name":"นางสาวครองขวัญ สมศรีราช"},{"id":"6724763690","name":"นายชนุตม์ วรรณา"},{"id":"6724763708","name":"นายชยุต ทองพราว"},{"id":"6724763716","name":"นางสาวญาณภัทร เวทยานนท์"},{"id":"6724763724","name":"นางสาวญาณิกา วงษ์สกุล"},{"id":"6724763732","name":"นางสาวฐิติกานต์ แย้มแสน"},{"id":"6724763740","name":"นางสาวณญาดา ตั้งจริยธรรม"},{"id":"6724763757","name":"นายนภัทร สุวรรณมณี"},{"id":"6724763765","name":"นายธิรพิชญ์ ศิริสัมพันธ์"},{"id":"6724763781","name":"นางสาวเบญญรินทร์ ศรีธนาธิชานนท์"},{"id":"6724763799","name":"นางสาวเบญญภัสสร์ ศรีธนาธิชานนท์"},{"id":"6724763807","name":"นางสาวปิยพัทธ์ เก่งรัมย์"},{"id":"6724763815","name":"นางสาวพชรกมล มิยะพันธ์"},{"id":"6724763823","name":"นางสาวพรพันธ์ โอฆะคุปต์"},{"id":"6724763831","name":"นางสาวภณิดา อู่ใหม่"},{"id":"6724763849","name":"นางสาวมนัสนันท์ ธรรมบวร"},{"id":"6724763856","name":"นางสาวลักษิกา ยังประเสริฐ"},{"id":"6724763864","name":"นายสรัชญ์ ขวัญเงิน"},{"id":"6724763872","name":"นางสาวสุกาญ์ดา มูละสีวะ"},{"id":"6724763880","name":"นางสาวสุพรรษา บัวคลี่"},{"id":"6724763898","name":"นางสาวอธิฐา โพธิสวัสดิ์"},{"id":"6724763906","name":"นางสาวอารียา นามมุง"},{"id":"6724763914","name":"นางสาวกมลรัตน์ จำปาทอง"},{"id":"6724763922","name":"นางสาวกมลลักษณ์ เพชรศร"},{"id":"6724763930","name":"นายกรุงศรี แซ่เลี่ยง"},{"id":"6724763948","name":"นางสาวกัญญาภัค คุ้มศิลป์"},{"id":"6724763955","name":"นายกิตติพัชญ์ เอกปิยะนันท์"},{"id":"6724763971","name":"นายจัรภพ ณพีร์ชญภัส เหล่าพร"},{"id":"6724763989","name":"นางสาวจิรัชยา จันทะวงค์"},{"id":"6724764003","name":"นางสาวชญาพรรธน์ เศวตศิริกาญจน์"},{"id":"6724764011","name":"นางสาวชณพร บุญส่งนาค"},{"id":"6724764029","name":"นายชลพีร ปัดยะบุตร"},{"id":"6724764037","name":"นายชัยธัช พิสิษฐ์พงศ์พัทธ์"},{"id":"6724764045","name":"นางสาวชาลิสา ชมชื่น"},{"id":"6724764052","name":"นางสาวญานิกา ใยสำลี"},{"id":"6724764060","name":"นางสาวญาติกานต์ วัตรายุวงค์"},{"id":"6724764078","name":"นายณภัทรพงศ์ ฆ้องแก้ว"},{"id":"6724764086","name":"นายณัฐวัฒน์ ตระการเอี่ยม"},{"id":"6724764094","name":"นางสาวณิชาภัทร สาระพัดนึก"},{"id":"6724764102","name":"นางสาวดรุณรัตน์ ชูหมื่นไวย์"},{"id":"6724764110","name":"นายถิรวัฒน์ เกาะเหม"},{"id":"6724764128","name":"นางสาวทานตะวัน จูทิม"},{"id":"6724764136","name":"นายธนวัฒน์ ผาคำ"},{"id":"6724764144","name":"นางสาวธัญสินี ใช้สงวนทรัพย์"},{"id":"6724764177","name":"นางสาวนฤภร หมื่นจำเริญ"},{"id":"6724764185","name":"นางสาวนวิยา คงสถิตย์"},{"id":"6724764193","name":"นายนันทพงศ์ ติษบรรจง"},{"id":"6724764219","name":"นายนิธิพัฒน์ สันตะวงค์"},{"id":"6724764227","name":"นางสาวปรียาภัทร สุภาจารุวงค์"},{"id":"6724764235","name":"นางสาวปุญญิศา หงษ์ทอง"},{"id":"6724764243","name":"นางสาวผุสฎี นรากร"},{"id":"6724764250","name":"นายพรรวินท์ ธเนศชัยวัฒน์"},{"id":"6724764268","name":"นางสาวพลอยพิสุทธิ์ มุทุตา"},{"id":"6724764276","name":"นางสาวพัชรพร รื่นโต"},{"id":"6724764284","name":"นางสาวพัณณิน พวงขาว"},{"id":"6724764292","name":"นางสาวพัทธ์ธีรา จันทรพัชร"},{"id":"6724764300","name":"นางสาวพิชญาภัค ส่องศรี"},{"id":"6724764318","name":"นางสาวฟ้าใส ทองพุ่ม"},{"id":"6724764326","name":"นางสาวภัทรธิดา ดาทอง"},{"id":"6724764334","name":"นางสาวภาสวีร์ ไลออน"},{"id":"6724764359","name":"นางสาวมนสิการ์ ยั่งยืน"},{"id":"6724764367","name":"นายยศกร เทพวรรณ์"},{"id":"6724764375","name":"นางสาวรัตนาภรณ์ บรรจงปรุ"},{"id":"6724764391","name":"นางสาวเรือนไทย สีสมุดคำ"},{"id":"6724764409","name":"นายวงศกร วงศิริ"},{"id":"6724764417","name":"นางสาววรนุช จงแจ้งกลาง"},{"id":"6724764425","name":"นางสาววรัญญา ตระกูลฮุน"},{"id":"6724764433","name":"นางสาววศินี ทองคำ"},{"id":"6724764441","name":"นายศรพิรมย์ มหรรทัศนพงศ์"},{"id":"6724764458","name":"นางสาวศศิดาภา ช่อทับทิม"},{"id":"6724764466","name":"นางสาวศศิธร บำรุง"},{"id":"6724764474","name":"นางสาวศิวัสส์ ทะนันรัมย์"},{"id":"6724764482","name":"นายศิระ ชื่นศิริ"},{"id":"6724764490","name":"นางสาวศุภานัน บำรุงศรี"},{"id":"6724764508","name":"นายสรณ์สิริ สุภาพ"},{"id":"6724764516","name":"นางสาวสิริรักษ์ ปานเนตรแก้ว"},{"id":"6724764524","name":"นางสาวสุภัสสรา เรืองขจร"},{"id":"6724764532","name":"นางสาวอณิชชา ชูจันทร์"},{"id":"6724764540","name":"นายอริย์ธัช นิวัติธำรงสิทธิ์"},{"id":"6724764557","name":"นางสาวอริสรา ตันทรรษ์"},{"id":"6724764565","name":"นางสาวอาทิมา ทัศนิยม"},{"id":"6724764573","name":"นางสาวอิงทิวา บัญญัติศิลป์"},{"id":"6724764581","name":"นางสาวอุษณิษา สมพงษ์"}];

const WORK_START = "08:00";
const WORK_END = "17:00";

function nowHM() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return p(d.getHours()) + ":" + p(d.getMinutes());
}

function isWorkTime() {
  const t = nowHM();
  return t >= WORK_START && t < WORK_END;
}

function fmtDate(s) {
  if (!s) return "-";
  const d = new Date(s);
  const p = n => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ------------------------------------------
// แปลงเวลาเป็นภาษาไทย เช่น "วันนี้ เวลา 13:30", "เมื่อวาน เวลา 14:00"
// ------------------------------------------
const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function fmtThaiTime(input) {
  if (!input) return "-";
  
  // รองรับทั้ง Firestore Timestamp, ISO string, หรือ Date object
  let d;
  if (typeof input === "object" && (input._seconds || input.seconds)) {
    d = new Date((input._seconds || input.seconds) * 1000);
  } else {
    d = new Date(input);
  }
  if (isNaN(d)) return "-";
  
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  
  // ตัดเอาเฉพาะวัน (ไม่เอาเวลา) เพื่อเปรียบเทียบ
  const startOf = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = startOf(now);
  const target = startOf(d);
  const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));
  
  // วันนี้
  if (diffDays === 0) return `วันนี้ เวลา ${time}`;
  
  // เมื่อวาน
  if (diffDays === 1) return `เมื่อวาน เวลา ${time}`;
  
  // ภายใน 7 วันที่ผ่านมา → บอกชื่อวัน
  if (diffDays > 1 && diffDays < 7) {
    return `วัน${THAI_DAYS[d.getDay()]} เวลา ${time}`;
  }
  
  // เกิน 1 สัปดาห์ → บอกวัน + วันที่ + เดือน
  // ถ้าเป็นปีเดียวกัน ไม่ต้องใส่ปี
  if (d.getFullYear() === now.getFullYear()) {
    return `วัน${THAI_DAYS[d.getDay()]}ที่ ${d.getDate()} ${THAI_MONTHS[d.getMonth()]} เวลา ${time}`;
  }
  
  // ต่างปี ใส่ปีพ.ศ. ด้วย
  const buddhistYear = d.getFullYear() + 543;
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${buddhistYear} เวลา ${time}`;
}

// ------------------------------------------
// [เพิ่มใหม่] ฟังก์ชันแสดงรูปภาพหรือไอคอน SVG
// ------------------------------------------
const renderIcon = (type, imgUrl) => {
  if (imgUrl) return <img src={imgUrl} alt={type} className="w-full h-full object-contain drop-shadow-md rounded-lg" />;
  return <div dangerouslySetInnerHTML={{ __html: getIcon(type) }} className="w-full h-full" />;
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState("1");
  const [inputId, setInputId] = useState("");
  const [inputName, setInputName] = useState("");
  
  const [itemsCache, setItemsCache] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [layoutOrder, setLayoutOrder] = useState([]); 
  const [config, setConfig] = useState({ manualUnlock: false });
  
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [recentActivities, setRecentActivities] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(nowHM());
  
  const [modalItem, setModalItem] = useState(null);
  const [bookingForm, setBookingForm] = useState({ qty: 1, startTime: "", endTime: "" });

  const fetchConfig = async () => {
    try {
      const res = await fetch("https://studystation-api.onrender.com/api/settings/config");
      const data = await res.json();
      setConfig(data);
    } catch (e) { console.error(e); }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const resItems = await fetch("https://studystation-api.onrender.com/api/items");
      const dataItems = await resItems.json();
      setItemsCache(Array.isArray(dataItems) ? dataItems : []);
      
      const resLayout = await fetch("https://studystation-api.onrender.com/api/settings/layout");
      const dataLayout = await resLayout.json();
      setLayoutOrder(dataLayout.typeOrder || []);
    } catch (error) {
      console.error("โหลดข้อมูลไม่สำเร็จ:", error);
      setItemsCache([]); 
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`https://studystation-api.onrender.com/api/my-bookings/${user.studentId}`);
      const data = await response.json();
      setMyBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("ดึงประวัติไม่ได้:", error);
      setMyBookings([]); 
    } finally {
      setLoading(false);
    }
  };

const fetchRecentActivities = async () => {
    if (!user) return;
    try {
      const res = await fetch(`https://studystation-api.onrender.com/api/my-bookings/${user.studentId}`);
      const data = await res.json();
      if (!Array.isArray(data)) return setRecentActivities([]);
      
      // เรียงจากใหม่ไปเก่า เอาแค่ 3 รายการล่าสุด
      const sorted = data
        .filter(b => b.createdAt)
        .sort((a, b) => {
          const ta = (a.createdAt._seconds || a.createdAt.seconds || 0);
          const tb = (b.createdAt._seconds || b.createdAt.seconds || 0);
          return tb - ta;
        })
        .slice(0, 3);
      
      setRecentActivities(sorted);
    } catch (error) {
      console.error("โหลดกิจกรรมล่าสุดไม่ได้:", error);
      setRecentActivities([]);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("studystation_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    // อัปเดตนาฬิกาทุก 30 วินาที
    const timer = setInterval(() => {
      setCurrentTime(nowHM());
    }, 30000);
    // fetchConfig แค่ครั้งเดียวตอนเริ่ม
    fetchConfig();
    return () => clearInterval(timer);
  }, []);

  // fetchConfig ทุก 60 วินาทีเฉพาะตอน login แล้ว
  useEffect(() => {
    if (!user) return;
    const configTimer = setInterval(fetchConfig, 60000);
    return () => clearInterval(configTimer);
  }, [user]);

useEffect(() => {
    if (user) {
      if (currentPage === "home") {
        fetchItems();
        fetchRecentActivities();
      }
      if (currentPage === "bookings") fetchMyBookings();
    }
  }, [user, currentPage]);

const handleLogin = async (e) => {
    e.preventDefault();
    if (inputId.length !== 10) return alert("รหัสนักศึกษาต้องเป็นตัวเลข 10 หลัก");
    
    let finalName = inputName;
    if (selectedYear === "1") {
      const rec = YEAR1_ROSTER.find(r => r.id === inputId);
      if (!rec) return alert("ไม่พบรหัสนี้ในฐานข้อมูลปี 1");
      finalName = rec.name;
    } else if (selectedYear === "2") {
      const rec = YEAR2_ROSTER.find(r => r.id === inputId);
      if (!rec) return alert("ไม่พบรหัสนี้ในฐานข้อมูลปี 2");
      finalName = rec.name;
    } else {
      if (inputName.trim().length < 3) return alert("กรุณากรอกชื่อ-นามสกุล");
    }
    
    const userData = { studentId: inputId, fullName: finalName, yearOfStudy: selectedYear };
    
    // ★ ส่งข้อมูลไปบันทึกลง DB ฝั่ง server
    try {
      await fetch("https://studystation-api.onrender.com/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
    } catch (err) {
      console.error("บันทึกผู้ใช้ไม่สำเร็จ:", err);
      // ถึงจะ error ก็ให้ล็อกอินได้ ไม่ block
    }
    
    setUser(userData);
    localStorage.setItem("studystation_user", JSON.stringify(userData));
  };

  const logout = () => {
    if (window.confirm("ยืนยันการออกจากระบบ")) {
      setUser(null);
      setItemsCache([]);
      setMyBookings([]);
      setCurrentPage("home");
      localStorage.removeItem("studystation_user");
    }
  };

  const handleNav = (page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false);
  };

  const buildTypeGroups = () => {
    const map = new Map();
    const safeItems = Array.isArray(itemsCache) ? itemsCache : [];
    
    for (const it of safeItems) {
      if (!it.type) continue;
      let g = map.get(it.type);
      if (!g) { 
        g = { type: it.type, name: it.name || it.type, color: it.color || "from-slate-100 to-gray-200", consumable: !!it.consumable, imageUrl: it.imageUrl || "", units: [], stockRec: null }; 
        map.set(it.type, g); 
      }
      if (it.consumable) { 
        g.consumable = true; g.stockRec = it; if (it.name) g.name = it.name; if (it.color) g.color = it.color; if (it.imageUrl) g.imageUrl = it.imageUrl;
      } else { 
        g.units.push(it); if (it.name) g.name = it.name; if (it.color) g.color = it.color; if (it.imageUrl) g.imageUrl = it.imageUrl;
      }
    }
    
    return [...map.values()].sort((a, b) => {
      const ai = layoutOrder.indexOf(a.type);
      const bi = layoutOrder.indexOf(b.type);
      
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  };

  const isTimeValid = isWorkTime();
  const canBorrow = isTimeValid || config.manualUnlock;
  const timeProps = config.manualUnlock ? {} : { min: "08:00", max: "17:00" };

  const handleOpenModal = (g) => {
    if (!canBorrow) {
      alert(`นอกเวลาทำการ โปรดยืมตอน ${WORK_START} - ${WORK_END}`);
      return;
    }
    
    const pad = n => String(n).padStart(2, "0");
    const now = new Date();
    let sh = now.getHours(), sm = now.getMinutes();
    
    if (!config.manualUnlock) {
      if (sh < 8) { sh = 8; sm = 0; } else if (sh >= 17) { sh = 8; sm = 0; }
    }
    
    let eh = sh + 1, em = sm; 
    if (!config.manualUnlock && eh > 17) { eh = 17; em = 0; }

    setBookingForm({
      qty: 1,
      startTime: `${pad(sh)}:${pad(sm)}`,
      endTime: `${pad(eh)}:${pad(em)}`
    });
    setModalItem(g);
  };

  const submitBorrow = async (e) => {
    e.preventDefault();
    if (!canBorrow) {
      setModalItem(null);
      return alert(`นอกเวลาทำการ โปรดยืมตอน ${WORK_START} - ${WORK_END}`);
    }

    let targetItemId = null;
    let qtyToSend = 1;
    let finalStartTime = bookingForm.startTime;
    let finalEndTime = bookingForm.endTime;

    if (modalItem.consumable) {
      qtyToSend = parseInt(bookingForm.qty, 10);
      if (!Number.isFinite(qtyToSend) || qtyToSend < 1) return alert("กรุณากรอกจำนวนให้ถูกต้อง");
      if (qtyToSend > modalItem.stockRec.stock) return alert(`เบิกได้สูงสุด ${modalItem.stockRec.stock} ชิ้น`);
      targetItemId = modalItem.stockRec.id;
    } else {
      const availableUnits = modalItem.units.filter(i => i.status === "Available");
      if (availableUnits.length === 0) return alert("อุปกรณ์นี้หมด");
      targetItemId = availableUnits[0].id;

      if (!bookingForm.startTime || !bookingForm.endTime) return alert("กรุณากรอกเวลาให้ครบ");
      
      if (!config.manualUnlock) {
        if (bookingForm.startTime < "08:00" || bookingForm.startTime > "17:00") return alert("เวลาเริ่มต้องอยู่ในช่วง 08:00 - 17:00");
        if (bookingForm.endTime < "08:00" || bookingForm.endTime > "17:00") return alert("เวลาสิ้นสุดต้องอยู่ในช่วง 08:00 - 17:00");
      }
      if (bookingForm.endTime <= bookingForm.startTime) return alert("เวลาสิ้นสุดต้องหลังเวลาเริ่ม");

      const now = new Date();
      const pad = n => String(n).padStart(2, "0");
      const datePrefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      
      finalStartTime = `${datePrefix}T${bookingForm.startTime}`;
      finalEndTime = `${datePrefix}T${bookingForm.endTime}`;
    }

    try {
      const response = await fetch("https://studystation-api.onrender.com/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          itemId: targetItemId,
          studentId: user.studentId,
          studentName: user.fullName,
          yearOfStudy: user.yearOfStudy,
          qty: qtyToSend,
          startTime: finalStartTime,
          endTime: finalEndTime
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("ทำรายการสำเร็จ");
        setModalItem(null);
        fetchItems();
      } else {
        alert("ผิดพลาด: " + data.error);
      }
    } catch (error) {
      alert("ติดต่อเซิร์ฟเวอร์ไม่ได้");
    }
  };

  const handleReturn = async (bookingId, itemId) => {
    if (!window.confirm("ยืนยันการคืนอุปกรณ์นี้ใช่ไหม")) return;
    try {
      const response = await fetch("https://studystation-api.onrender.com/api/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, itemId }), 
      });
      const data = await response.json();
      if (response.ok) {
        alert("คืนอุปกรณ์สำเร็จ");
        fetchMyBookings(); 
      } else {
        alert("ผิดพลาด: " + data.error);
      }
    } catch (error) {
      alert("ติดต่อเซิร์ฟเวอร์ไม่ได้");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-fade">
        <div className="glass rounded-3xl card-shadow w-full max-w-md p-6 sm:p-8 md:p-10 my-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-white mb-4 shadow-xl overflow-hidden float-anim p-2" style={{ boxShadow: "0 20px 40px -10px rgba(244,63,94,0.35)" }}>
              <img src={LOGO_URL} alt="logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Study Station CISTU</h1>
            <p className="text-slate-500 text-sm mt-2">ระบบยืมอุปกรณ์ห้องคอมมอน วิทยาลัยสหวิทยาการ</p>
          </div>
          
          <div className="flex gap-1 mb-5 bg-white/50 p-1 rounded-2xl">
            {["1", "2", "3"].map(y => (
              <button 
                key={y}
                type="button" 
                onClick={() => setSelectedYear(y)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${selectedYear === y ? 'gradient-btn text-white' : 'text-slate-600'}`}
              >
                ปี {y}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">รหัสนักศึกษา</label>
              <input 
                type="text" 
                inputMode="numeric" 
                autoComplete="off" 
                maxLength="10" 
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/80 focus:outline-none focus:ring-2 focus:ring-rose-400" 
                placeholder="กรอกรหัสนักศึกษา 10 หลัก" 
              />
            </div>
            <div className={selectedYear === "1" || selectedYear === "2" ? "hidden" : ""}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ชื่อ - นามสกุล</label>
              <input 
                type="text" 
                autoComplete="off" 
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/80 focus:outline-none focus:ring-2 focus:ring-rose-400" 
                placeholder="เช่น นางสาวเมนี่ ไพศาลพนา" 
              />
            </div>
            <p className={`text-xs px-3 py-2 rounded-lg ${selectedYear === "1" || selectedYear === "2" ? "text-sky-600 bg-sky-50" : "text-amber-600 bg-amber-50"}`}>
              {selectedYear === "1" || selectedYear === "2" ? "ระบบจะดึงชื่อจากฐานข้อมูลอัตโนมัติ" : `ปี ${selectedYear}: กรอกชื่อ-นามสกุลเพื่อบันทึกลงฐานข้อมูล`}
            </p>
            <button type="submit" className="w-full gradient-btn text-white font-bold py-3 rounded-xl text-lg">เข้าสู่ระบบ</button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-5">© 2026 Study Station CIS Thammasat University</p>
        </div>
      </div>
    );
  }

  const renderHome = () => {
    const groups = buildTypeGroups();
    const reusable = Array.isArray(itemsCache) ? itemsCache.filter(i => !i.consumable) : [];
    const totalUnits = reusable.length;
    const availUnits = reusable.filter(i => i.status === "Available").length;
    const borrowedUnits = totalUnits - availUnits;

    return (
      <div className="animate-fade">
        <div className="glass rounded-3xl card-shadow p-6 lg:p-8 mb-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-rose-200 to-pink-300 opacity-30 blur-2xl"></div>
          <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-200 to-blue-300 opacity-25 blur-2xl"></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                สวัสดี, <span className="gradient-text">{user.fullName}</span> <span className="inline-block float-anim">👋</span>
              </h1>
              <p className="text-slate-500 mt-1">เลือกอุปกรณ์ที่ต้องการยืมได้เลย</p>
            </div>
            <button onClick={fetchItems} className="px-5 py-2.5 rounded-2xl glass-dark hover:bg-white text-slate-700 font-semibold transition flex items-center gap-2 self-start sm:self-auto card-hover">
              <span>🔄</span> รีเฟรช
            </button>
          </div>
          
          <div className="relative mt-4">
            {config.manualUnlock ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-400 shadow-sm">
                <span className="text-xl">🔓</span>
                <div className="flex-1">
                  <div className="font-bold text-emerald-800 text-sm">แอดมินปลดล็อกชั่วคราว</div>
                  <div className="text-xs text-emerald-700">คุณสามารถทำรายการยืม-เบิกอุปกรณ์ได้ตามปกติตลอด 24 ชม.</div>
                </div>
              </div>
            ) : isTimeValid ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-lg" style={{ boxShadow: "0 0 8px #3b82f6", animation: "pulse-ring 2s infinite" }}></span>
                <div className="flex-1">
                  <div className="font-bold text-blue-700 text-sm">เปิดทำการ • ยืมอุปกรณ์ได้</div>
                  <div className="text-xs text-blue-600">เวลาขณะนี้ {currentTime} (ทำการ {WORK_START} - {WORK_END})</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-lg" style={{ boxShadow: "0 0 8px #ef4444" }}></span>
                <div className="flex-1">
                  <div className="font-bold text-red-700 text-sm">นอกเวลาทำการ • ยืมไม่ได้</div>
                  <div className="text-xs text-red-600">เวลาขณะนี้ {currentTime} • โปรดกลับมาช่วง {WORK_START} - {WORK_END}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
          <div className="stat-card rounded-2xl p-4 lg:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-xl lg:text-2xl">📦</div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-slate-800">{totalUnits}</div>
                <div className="text-xs text-slate-500">อุปกรณ์ยืม-คืน</div>
              </div>
            </div>
          </div>
          <div className="stat-card rounded-2xl p-4 lg:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-xl lg:text-2xl">✓</div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-emerald-600">{availUnits}</div>
                <div className="text-xs text-slate-500">พร้อมใช้</div>
              </div>
            </div>
          </div>
          <div className="stat-card rounded-2xl p-4 lg:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-xl lg:text-2xl">🔒</div>
              <div>
                <div className="text-xl lg:text-2xl font-bold text-rose-600">{borrowedUnits}</div>
                <div className="text-xs text-slate-500">ถูกยืม</div>
              </div>
            </div>
          </div>
        </div>
{/* ===== กิจกรรมล่าสุด ===== */}
        {recentActivities.length > 0 && (
          <div className="glass rounded-3xl card-shadow p-5 lg:p-6 mb-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-sky-200 to-cyan-300 opacity-30 blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl float-anim">⏱️</span>
                    กิจกรรมล่าสุดของคุณ
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">3 รายการที่คุณทำล่าสุด</p>
                </div>
                <button 
                  onClick={() => setCurrentPage("bookings")} 
                  className="text-xs lg:text-sm text-rose-500 hover:text-rose-600 font-semibold whitespace-nowrap"
                >
                  ดูทั้งหมด →
                </button>
              </div>
              
              <div className="space-y-2">
                {recentActivities.map((b) => {
                  const eq = (Array.isArray(itemsCache) ? itemsCache.find(e => e.type === b.itemType) : null) || { color: 'from-slate-200 to-gray-300' };
                  const isConsumable = b.consumable || b.status === "Consumed";
                  const isReturned = b.status === "Returned";
                  
                  let statusLabel, statusColor;
                  if (isConsumable) {
                    statusLabel = `เบิก ${b.quantity || 1} ชิ้น`;
                    statusColor = "bg-orange-100 text-orange-700";
                  } else if (isReturned) {
                    statusLabel = "คืนแล้ว";
                    statusColor = "bg-emerald-100 text-emerald-700";
                  } else {
                    statusLabel = "กำลังยืม";
                    statusColor = "bg-amber-100 text-amber-700";
                  }
                  
                  return (
                    <div 
                      key={b.id} 
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 hover:bg-white/80 transition-all"
                    >
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br ${eq.color} flex items-center justify-center p-2 icon-wrap shadow-inner flex-shrink-0`}>
                        {renderIcon(b.itemType, eq.imageUrl)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm lg:text-base text-slate-800 truncate">
                          {b.itemName}
                        </p>
                        <p className="text-[11px] lg:text-xs text-slate-500 truncate">
                          {fmtThaiTime(b.createdAt)}
                        </p>
                      </div>
                      <span className={`text-[10px] lg:text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap flex-shrink-0 ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {/* ===== END กิจกรรมล่าสุด ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              <div className="spinner mr-2"></div>กำลังโหลด...
            </div>
          ) : groups.length === 0 ? (
            <div className="col-span-full glass rounded-2xl p-8 text-center text-slate-500">ยังไม่มีอุปกรณ์ในระบบ</div>
          ) : (
            groups.map(g => {
              if (g.consumable) {
                const stock = g.stockRec?.stock || 0;
                const initial = g.stockRec?.initialStock || stock || 1;
                const out = stock <= 0;
                const pct = initial ? Math.round((stock / initial) * 100) : 0;
                
                return (
                  <div key={g.type} onClick={() => !out && canBorrow && handleOpenModal(g)} className={`type-card card-hover glass rounded-2xl p-4 lg:p-5 cursor-pointer ${out || !canBorrow ? "disabled" : ""}`}>
                    <div className={`aspect-square rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center mb-3 shadow-inner p-3 lg:p-4 icon-wrap icon-bg-glow relative`}>
                      {renderIcon(g.type, g.imageUrl)}
                      <span className="absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500 text-white font-bold shadow">เบิก</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-xs lg:text-sm leading-tight line-clamp-2">{g.name}</h3>
                    <div className="mt-2 lg:mt-3 flex items-center justify-between gap-1">
                      <span className={`text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-full ${out ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"} font-semibold whitespace-nowrap`}>
                        {out ? "● หมด" : "● วัสดุสิ้นเปลือง"}
                      </span>
                      <span className="text-[10px] lg:text-xs font-bold text-slate-600 whitespace-nowrap">{stock}/{initial}</span>
                    </div>
                    <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${out ? 'from-red-400 to-rose-400' : 'from-orange-400 to-amber-400'} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              }
              
              const total = g.units.length;
              const avail = g.units.filter(i => i.status === "Available").length;
              const out = avail === 0;
              const pct = total ? Math.round((avail / total) * 100) : 0;
              
              return (
                <div key={g.type} onClick={() => !out && canBorrow && handleOpenModal(g)} className={`type-card card-hover glass rounded-2xl p-4 lg:p-5 cursor-pointer ${out || !canBorrow ? "disabled" : ""}`}>
                  <div className={`aspect-square rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center mb-3 shadow-inner p-3 lg:p-4 icon-wrap icon-bg-glow`}>
                    {renderIcon(g.type, g.imageUrl)}
                  </div>
                  <h3 className="font-bold text-slate-800 text-xs lg:text-sm leading-tight line-clamp-2">{g.name}</h3>
                  <div className="mt-2 lg:mt-3 flex items-center justify-between gap-1">
                    <span className={`text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded-full ${out ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"} font-semibold whitespace-nowrap`}>
                      {out ? "● หมด" : "● ว่าง"}
                    </span>
                    <span className="text-[10px] lg:text-xs font-bold text-slate-600 whitespace-nowrap">{avail}/{total}</span>
                  </div>
                  <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${out ? 'from-red-400 to-rose-400' : 'from-emerald-400 to-teal-400'} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderBookings = () => {
    const active = Array.isArray(myBookings) ? myBookings.filter(b => b.status === "Active").length : 0;
    const returned = Array.isArray(myBookings) ? myBookings.filter(b => b.status === "Returned").length : 0;
    const consumed = Array.isArray(myBookings) ? myBookings.filter(b => b.status === "Consumed").length : 0;

    return (
      <div className="animate-fade">
        <div className="glass rounded-3xl card-shadow p-6 lg:p-8 mb-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-rose-200 to-pink-300 opacity-30 blur-2xl"></div>
          <div className="relative">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-3"><span className="text-3xl float-anim">📋</span>การยืมของฉัน</h1>
            <p className="text-slate-500 mt-1">ประวัติและรายการยืมทั้งหมด</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
          <div className="stat-card rounded-2xl p-4 lg:p-5 text-center">
            <div className="text-2xl lg:text-3xl font-bold gradient-text">{Array.isArray(myBookings) ? myBookings.length : 0}</div>
            <div className="text-xs lg:text-sm text-slate-500 mt-1">ทั้งหมด</div>
          </div>
          <div className="stat-card rounded-2xl p-4 lg:p-5 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-amber-500">{active}</div>
            <div className="text-xs lg:text-sm text-slate-500 mt-1">กำลังยืม</div>
          </div>
          <div className="stat-card rounded-2xl p-4 lg:p-5 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-emerald-500">{returned + consumed}</div>
            <div className="text-xs lg:text-sm text-slate-500 mt-1">เสร็จสิ้น</div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="glass rounded-2xl p-12 text-center text-slate-500"><div className="spinner mr-2"></div> กำลังโหลด...</div>
          ) : !Array.isArray(myBookings) || myBookings.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-slate-500"><div className="text-6xl mb-3 opacity-50">📭</div>ยังไม่มีรายการยืม</div>
          ) : (
            myBookings.map(b => {
              const eq = (Array.isArray(itemsCache) ? itemsCache.find(e => e.type === b.itemType) : null) || { color: 'from-slate-200 to-gray-300' };
              const colorClass = eq.color;
              
              if (b.status === "Consumed" || b.consumable) {
                return (
                  <div key={b.id} className="glass rounded-2xl p-4 lg:p-5 card-shadow flex flex-col sm:flex-row sm:items-center gap-4 border-l-4 border-orange-400">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center p-2 icon-wrap flex-shrink-0 shadow-inner`}>
                        {renderIcon(b.itemType, eq.imageUrl)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-base lg:text-lg truncate">{b.itemName}</h3>
                        <p className="text-xs text-orange-600 font-semibold">📦 วัสดุสิ้นเปลือง</p>
                        <p className="text-sm text-slate-700 mt-1 font-semibold">เบิกไป <span className="text-orange-600">{b.quantity || 1}</span> ชิ้น</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-orange-100 text-orange-700">✓ เบิกแล้ว</span>
                    </div>
                  </div>
                );
              }

              const ret = b.status === "Returned";
              return (
                <div key={b.id} className="glass rounded-2xl p-4 lg:p-5 card-shadow flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center p-2 icon-wrap flex-shrink-0 shadow-inner`}>
                      {renderIcon(b.itemType, eq.imageUrl)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-base lg:text-lg truncate">{b.itemName}</h3>
                      <p className="text-xs text-slate-500 font-mono">{b.itemId}</p>
                      <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1"><span>🕐</span>{fmtDate(b.startTime)} → {fmtDate(b.endTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${ret ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {ret ? '✓ คืนแล้ว' : '● กำลังยืม'}
                    </span>
                    {!ret && (
                      <button onClick={() => handleReturn(b.id, b.itemId)} className="return-btn text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5">
                        <span>↩</span>คืนอุปกรณ์
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderRules = () => (
    <div className="animate-fade">
      <div className="glass rounded-3xl card-shadow p-6 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">📜 กฎและข้อตกลง</h1>
        <p className="text-slate-500 mt-1">โปรดอ่านก่อนใช้บริการ</p>
      </div>
      <div className="glass rounded-2xl p-8 card-shadow space-y-4 text-slate-700">
        <div className="flex gap-3"><span className="text-rose-500 font-bold">1.</span><p>ผู้ยืมต้องเป็นนักศึกษาวิทยาลัยสหวิทยาการเท่านั้น</p></div>
        <div className="flex gap-3"><span className="text-rose-500 font-bold">2.</span><p>ยืมอุปกรณ์ได้เฉพาะช่วงเวลา <strong className="text-rose-500">08:00 - 17:00</strong> ของแต่ละวัน</p></div>
        <div className="flex gap-3"><span className="text-rose-500 font-bold">3.</span><p>วัสดุสิ้นเปลือง เป็นการเบิกใช้ ไม่ต้องคืน</p></div>
        <div className="flex gap-3"><span className="text-rose-500 font-bold">4.</span><p>กรุณาดูแลรักษาอุปกรณ์ และคืนตามเวลาที่กำหนด</p></div>
        <div className="flex gap-3"><span className="text-rose-500 font-bold">5.</span><p>หากอุปกรณ์ชำรุด สูญหาย ผู้ยืมต้องรับผิดชอบ</p></div>
        <div className="flex gap-3"><span className="text-rose-500 font-bold">6.</span><p>การคืนอุปกรณ์ล่าช้าจะถูกระงับสิทธิ์การยืม</p></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row animate-fade relative">
      <div className="lg:hidden sticky top-0 left-0 w-full z-40 glass-dark border-b border-white/40 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-2 text-slate-700 font-semibold px-3 py-1.5 rounded-xl hover:bg-slate-100/50 transition">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <span className="text-sm">เมนู</span>
        </button>
        <div className="flex items-center gap-2 pr-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white shadow overflow-hidden p-0.5 flex-shrink-0">
            <img src={LOGO_URL} alt="logo" className="w-full h-full object-contain" />
          </div>
          <div className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500 truncate">
            Study Station
          </div>
        </div>
      </div>

      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`lg:w-72 lg:min-h-[100dvh] p-0 lg:p-6 sidebar-mobile lg:!translate-x-0 lg:!static lg:!transform-none ${isSidebarOpen ? 'open' : ''}`}>
        <div className="glass rounded-none lg:rounded-3xl card-shadow p-6 lg:sticky lg:top-6 flex flex-col h-full lg:h-[calc(100vh-3rem)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden p-1 flex-shrink-0">
              <img src={LOGO_URL} alt="logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-bold text-lg gradient-text">Study Station</h2>
              <p className="text-xs text-slate-500">ยืมอุปกรณ์ห้องคอมมอน</p>
            </div>
          </div>
          
          <nav className="space-y-2 flex-1 overflow-y-auto pr-2 pb-4">
            <button onClick={() => handleNav("home")} className={`sidebar-item w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${currentPage === "home" ? "active" : "text-slate-600 hover:bg-white/50"}`}>
              <span className="text-lg">🏠</span><span>หน้าหลัก</span>
            </button>
            <button onClick={() => handleNav("bookings")} className={`sidebar-item w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${currentPage === "bookings" ? "active" : "text-slate-600 hover:bg-white/50"}`}>
              <span className="text-lg">📋</span><span>การยืมของฉัน</span>
            </button>
            <button onClick={() => handleNav("rules")} className={`sidebar-item w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${currentPage === "rules" ? "active" : "text-slate-600 hover:bg-white/50"}`}>
              <span className="text-lg">📜</span><span>กฎและข้อตกลง</span>
            </button>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-white/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                {user.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{user.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{user.studentId} • ปี {user.yearOfStudy}</p>
              </div>
            </div>
            <button onClick={logout} className="w-full px-4 py-2.5 rounded-xl bg-white/60 hover:bg-white text-slate-700 text-sm font-medium transition">
              ออกจากระบบ
            </button>
            <a href="/admin" className="block text-center mt-3 text-xs font-semibold text-slate-400 hover:text-rose-500 transition">
              🔒 เข้าสู่หน้าแอดมิน
            </a>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-8 min-w-0">
        {currentPage === "home" && renderHome()}
        {currentPage === "bookings" && renderBookings()}
        {currentPage === "rules" && renderRules()}
      </main>

      {modalItem && (
        <div className="fixed inset-0 modal-bg flex items-center justify-center p-4 z-50 animate-fade">
          <div className="glass-dark rounded-3xl card-shadow max-w-md w-full p-8 animate-scale">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${modalItem.color} flex items-center justify-center p-2 icon-wrap shadow-inner`}>
                {renderIcon(modalItem.type, modalItem.imageUrl)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-slate-800 truncate">{modalItem.name}</h3>
                {modalItem.consumable ? (
                  <>
                    <p className="text-xs text-orange-600 font-semibold mt-1">📌 วัสดุสิ้นเปลือง (ไม่ต้องคืน)</p>
                    <p className="text-xs text-emerald-600 font-semibold">คงเหลือ {modalItem.stockRec?.stock || 0} ชิ้น</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 font-mono mt-1">รหัส: {modalItem.units.filter(i => i.status === "Available")[0]?.itemId}</p>
                    <p className="text-xs text-emerald-600 font-semibold">พร้อมยืม {modalItem.units.filter(i => i.status === "Available").length} ชิ้น</p>
                  </>
                )}
              </div>
            </div>
            
            <form onSubmit={submitBorrow} className="space-y-4">
              {modalItem.consumable ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">จำนวนที่ต้องการเบิก</label>
                  <input 
                    type="number" min="1" max={modalItem.stockRec?.stock || 1} 
                    value={bookingForm.qty} 
                    onChange={e => setBookingForm({...bookingForm, qty: e.target.value})}
                    className="w-full text-center px-4 py-3 rounded-xl bg-white/70 border border-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-lg font-bold transition-all" 
                  />
                </div>
              ) : (
                <>
                  {!config.manualUnlock && <p className="text-xs text-slate-500 bg-sky-50 px-3 py-2 rounded-lg font-semibold">⏰ ยืมได้เฉพาะช่วง 08:00 - 17:00</p>}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">เวลาเริ่มต้น</label>
                    <input 
                      type="time" 
                      {...timeProps}
                      value={bookingForm.startTime} 
                      onChange={e => setBookingForm({...bookingForm, startTime: e.target.value})}
                      className="w-full text-center px-4 py-3 rounded-xl bg-white/70 border border-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">เวลาสิ้นสุด</label>
                    <input 
                      type="time" 
                      {...timeProps}
                      value={bookingForm.endTime} 
                      onChange={e => setBookingForm({...bookingForm, endTime: e.target.value})}
                      className="w-full text-center px-4 py-3 rounded-xl bg-white/70 border border-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all" 
                    />
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalItem(null)} className="flex-1 px-4 py-3 rounded-xl bg-white/70 hover:bg-white text-slate-700 font-bold transition-all shadow-sm">
                  ยกเลิก
                </button>
                <button type="submit" className="flex-1 gradient-btn text-white font-bold py-3 rounded-xl shadow-md">
                  {modalItem.consumable ? "ยืนยันเบิก" : "ยืนยันการยืม"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}