"use client";
import { useState, useEffect } from "react";
import { adminLogin, adminLogout, adminFetch, isTokenValid, getToken } from './auth';

const LOGO_URL="data:image/webp;base64,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";

const COLOR_PALETTE = [
  {v:"from-slate-100 to-gray-200",n:"เทา"},{v:"from-yellow-200 to-amber-300",n:"เหลือง"},
  {v:"from-amber-200 to-yellow-300",n:"อำพัน"},{v:"from-amber-300 to-orange-400",n:"ส้ม"},
  {v:"from-sky-200 to-blue-300",n:"ฟ้า"},{v:"from-slate-200 to-gray-300",n:"เทาอ่อน"},
  {v:"from-pink-200 to-rose-300",n:"ชมพู"},{v:"from-yellow-200 to-orange-300",n:"เหลืองส้ม"},
  {v:"from-red-200 to-rose-300",n:"แดง"},{v:"from-blue-200 to-indigo-300",n:"น้ำเงิน"},
  {v:"from-cyan-200 to-sky-300",n:"ครามใส"},{v:"from-teal-200 to-cyan-300",n:"เขียวน้ำทะเล"},
  {v:"from-purple-200 to-violet-300",n:"ม่วง"},{v:"from-rose-200 to-pink-300",n:"ชมพูกุหลาบ"},
  {v:"from-fuchsia-200 to-purple-300",n:"บานเย็น"},{v:"from-emerald-200 to-teal-300",n:"เขียว"}
];

const TYPE_ICONS = {
  paper_a4:'📄',ruler_short:'📏',ruler_long:'📐',cutter:'🔪',pen_horse_blue:'🖊️',
  liquid_water:'🧴',liquid_tape:'📼',stapler_refill:'📎',eraser:'🧽',pencil:'✏️',
  pen_red:'🖊️',pen_blue:'🖊️',pen_black:'🖊️',tape_clear_l:'🎞️',tape_clear_m:'🎞️',
  tape_clear_s:'🎞️',sharpener:'🔹',stapler:'📎',paper_clip:'📎',scissors:'✂️'
};

const YEAR1_ROSTER_SEED=[{"id":"6824493016","name":"นางสาวบุณยานุช ธรรมจรรโลง"},{"id":"6824763012","name":"นางสาวกชพรรณ แก้วมา"},{"id":"6824763020","name":"นางสาวกฤษณวรรศ อินทนิล"},{"id":"6824763038","name":"นางสาวกวินทรา ปรีชาญาณ"},{"id":"6824763046","name":"นางสาวกวินธิดา โชติกพนิช"},{"id":"6824763053","name":"นางสาวกัญญาณัฐ ลายนาค"},{"id":"6824763061","name":"นางสาวกัลยรัตน์ เกตุศรี"},{"id":"6824763079","name":"นางสาวกานต์ธิดา ปลอดทอง"},{"id":"6824763087","name":"นางสาวกีรัตติยา วงศ์มีแก้ว"},{"id":"6824763103","name":"นางสาวจุฑารัตน์ ตันเจริญ"},{"id":"6824763111","name":"นายฉันทวัฒน์ นิธินรเศรษฐ"},{"id":"6824763129","name":"นางสาวชนิศา วิวัฒน์พงศ์กิจ"},{"id":"6824763137","name":"นายชาคริต ชัยวิชิต"},{"id":"6824763145","name":"นายชุติเดช ศรีไทย"},{"id":"6824763152","name":"นางสาวชุติมา ทวีสมาน"},{"id":"6824763160","name":"นางสาวญาณิศา อภิบาลศรี"},{"id":"6824763178","name":"นางสาวฐิตาภรณ์ อ่อนแก้ว"},{"id":"6824763186","name":"นางสาวฐิติวรดา เตชะศรี"},{"id":"6824763194","name":"นางสาวฐิติวรดา ฟักขาว"},{"id":"6824763202","name":"นายณัฏฐพล ทัยคง"},{"id":"6824763210","name":"นายณัฐพล วีระวงศ์"},{"id":"6824763228","name":"นางสาวณิชกานต์ เตสุชาตะ"},{"id":"6824763244","name":"นางสาวณิชาภัทร ยิ่งดำนุ่น"},{"id":"6824763251","name":"นางสาวทยา ประสารการ"},{"id":"6824763269","name":"นางสาวธณัสนันท์ ทองทาย"},{"id":"6824763277","name":"นายธนเดช อุดมเสรีย์"},{"id":"6824763285","name":"นายธนวัฒน์ พันทะบุตร"},{"id":"6824763293","name":"นายธนวินท์ สำลีวงค์"},{"id":"6824763327","name":"นางสาวธันยากานต์ วัฒน์ธนินโภคิน"},{"id":"6824763335","name":"นางสาวธิญาดา แสนจันทร์"},{"id":"6824763343","name":"นายธีรวัฒน์ ขุนเพชร"},{"id":"6824763350","name":"นางสาวนติกานต์ ศรีจันทร์"},{"id":"6824763368","name":"นางสาวนวพร วีรประเสริฐสกุล"},{"id":"6824763384","name":"นางสาวเนติมากร แสงจันทร์"},{"id":"6824763392","name":"นางสาวบัณฑิตา เมฆแดง"},{"id":"6824763400","name":"นางสาวปริยากร ทองด้วง"},{"id":"6824763418","name":"นางสาวปริยากร ปานจันทร์"},{"id":"6824763426","name":"นางสาวปวริศา สุขเจริญ"},{"id":"6824763434","name":"นางสาวปาทิตตา สุนทรศารทูล"},{"id":"6824763442","name":"นางสาวปาริชาติ ราชนาวี"},{"id":"6824763459","name":"นายปิยพัทธ์ ปานะ"},{"id":"6824763467","name":"นายปิยพัทธ์ ญาณหาญ"},{"id":"6824763475","name":"นางสาวปุณณาสา ถนอมสิน"},{"id":"6824763483","name":"นางสาวปุณยาพร เจริญพานิชเสรี"},{"id":"6824763491","name":"นายพณศักดิ์ สังข์ขำ"},{"id":"6824763509","name":"นางสาวพฤกษารัฐ แก้วสกุล"},{"id":"6824763517","name":"นางสาวพิมพ์พรรษา พร้อมสุข"},{"id":"6824763525","name":"นางสาวเพ็ญนีตี้ สุรพงษ์ชาญเดช"},{"id":"6824763533","name":"นางสาวมนัญญา โสตติยัง"},{"id":"6824763558","name":"นางสาวมัชฌิมา แดงสากล"},{"id":"6824763574","name":"นางสาวมาริสา จินดาวงษ์"},{"id":"6824763582","name":"นางสาวรมิตา เพาะปลูก"},{"id":"6824763590","name":"นายรักษ์สิริ ปานเนตรแก้ว"},{"id":"6824763608","name":"นางสาวรัตนประภา อินทรบุญ"},{"id":"6824763616","name":"นางสาวลภัสรดา เพ็งพูน"},{"id":"6824763624","name":"นางสาววนัสนันท์ คงสมบูรณ์"},{"id":"6824763632","name":"นางสาววริษฐา เทศนอก"},{"id":"6824763640","name":"นายวาทศิลป์ สัตย์ซื่อ"},{"id":"6824763665","name":"นายวีราทร สำเภาเงิน"},{"id":"6824763673","name":"นางสาวศิรดา สุขสม"},{"id":"6824763699","name":"นางสาวสุพัตรา สายอินทร์"},{"id":"6824763707","name":"นางสาวสุภัสสรา หวังสุข"},{"id":"6824763715","name":"นางสาวสุภาพร อัลท์แฮร์"},{"id":"6824763723","name":"นางสาวอภิชญา สมวะเวียง"},{"id":"6824763749","name":"นางสาวอรพิน น้อยฉวี"},{"id":"6824763756","name":"นางสาวอรรัมภา ราชเครือ"},{"id":"6824763764","name":"นายอาณกร สุขสำราญ"},{"id":"6824763772","name":"นางสาวอิษฎาอร ช่วยศรี"},{"id":"6824763798","name":"นางสาวจินดามณี ฟุ้งพิมาย"},{"id":"6824763806","name":"นางสาวจุฑาทิพย์ หาญทะเล"},{"id":"6824763814","name":"นางสาวชุติกาญจน์ ทองธานี"},{"id":"6824763822","name":"นายฐูปกร แสงโพธิ์"},{"id":"6824763830","name":"นายฐิติวัสส์ พยัมบุตร"},{"id":"6824763848","name":"นางสาวณัฏฐ์ภัสสร ธนาเพ็ญภาส"},{"id":"6824763855","name":"นางสาวนฤธร เชียงหลี"},{"id":"6824763863","name":"นางสาวนิชาพร พิมธรรมมา"},{"id":"6824763871","name":"นายบวรวิชญ์ ระหัส"},{"id":"6824763889","name":"นางสาวบัณฑิตา พรมสิงห์"},{"id":"6824763897","name":"นางสาวปัณณภัสสร์ มธุรอัมพิลานันต์"},{"id":"6824763905","name":"นายพิศณุพงศ์ สมศรี"},{"id":"6824763913","name":"นางสาวเพียงขวัญ สันตินันตรักษ์"},{"id":"6824763921","name":"นางสาวแพรวา นิ่มมา"},{"id":"6824763939","name":"นางสาวภูริชญา กุหลาบ"},{"id":"6824763947","name":"นางสาวมณฑกาญจน์ คชกูล"},{"id":"6824763954","name":"นางสาวมนัสชนก จันทร์วิภาค"},{"id":"6824763962","name":"นางสาวมัตติกา สุนทรวิทย์"},{"id":"6824763970","name":"นางสาวฤามเม ภัทรสิงหสิริกุล"},{"id":"6824763988","name":"นางสาววริศรา เทศนะ"},{"id":"6824763996","name":"นางสาววิรัชชยากร นพรัตน์ธนัย"},{"id":"6824764002","name":"นางสาววิลาสินี อุดมเวช"},{"id":"6824764010","name":"นางสาวศรัญภา ศรีแฉล้ม"},{"id":"6824764028","name":"นางสาวสุรภา คูหะสุวรรณ"},{"id":"6824764036","name":"นางสาวสุวพิชชา กุลน้อย"},{"id":"6824764044","name":"นายแอล สวนจันทร์"},{"id":"6824764051","name":"นางสาวกนกพรรณ ศรีอ่อน"},{"id":"6824764069","name":"นางสาวกุลณัฐ ชนะกุล"},{"id":"6824764077","name":"นางสาวขวัญชนก นาคสงวน"},{"id":"6824764085","name":"นายโฆษิต ชัยราษฎร์"},{"id":"6824764093","name":"นายชยพล แสงม่วง"},{"id":"6824764101","name":"นางสาวชลนิภา ขรัวทองเขียว"},{"id":"6824764119","name":"นางสาวชวัลนุช พฤกษจำรูญ"},{"id":"6824764127","name":"นางสาวชาลิสา พิพัฒน์ธนสกุล"},{"id":"6824764135","name":"นางสาวชาลิสา เทียนบูชา"},{"id":"6824764143","name":"นางสาวชีรีน ปาทาน"},{"id":"6824764150","name":"นางสาวณณัฐ ชนะกิจ"},{"id":"6824764168","name":"นายณนน อินทชาติ"},{"id":"6824764176","name":"นายธนบดี ไชยคำภา"},{"id":"6824764184","name":"นายธนพจน์ เฉลิมพันธ์"},{"id":"6824764192","name":"นางสาวธนินีกานต์ มณีเนตร"},{"id":"6824764200","name":"นางสาวธยานี รัตนศรี"},{"id":"6824764218","name":"นางสาวนิชาภา ธรรมานนท์"},{"id":"6824764226","name":"นางสาวบุญญาดา จันทรสิทธิ์"},{"id":"6824764234","name":"นางสาวเบญจรัตน์ นามวงค์"},{"id":"6824764242","name":"นางสาวปทิตตา ทานะมัย"},{"id":"6824764259","name":"นายปพนธีร์ ชัยมา"},{"id":"6824764267","name":"นางสาวปภาวรินทร์ ประทุมมาตย์"},{"id":"6824764275","name":"นางสาวปริยากร จารุประวิทย์"},{"id":"6824764283","name":"นางสาวปริยาภัทร เมิดไธสง"},{"id":"6824764291","name":"นางสาวปรียาพร ศรีอุดม"},{"id":"6824764309","name":"นางสาวปลายฟ้า บุปผาลุน"},{"id":"6824764317","name":"นายปวีณ ภัทรมงคลกุล"},{"id":"6824764325","name":"นางสาวปิยากร บัวผัด"},{"id":"6824764333","name":"นางสาวพรปวีณ์ ขุนพิทักษ์"},{"id":"6824764341","name":"นางสาวพิชญธิดา คงฤทธิ์"},{"id":"6824764358","name":"นางสาวพีรดา พุ่มขจร"},{"id":"6824764366","name":"นายภัทรดล คงนิล"},{"id":"6824764374","name":"นางสาวภัทรธิดา จงโปรย"},{"id":"6824764382","name":"นางสาวเมนี่ ไพศาลพนา"},{"id":"6824764390","name":"นางสาวรัจศุมณค์ เพชรพรศิริกุล"},{"id":"6824764408","name":"นางสาวรัตติกา รัตนมงคล"},{"id":"6824764416","name":"นางสาวรัตนาวดี บุตรน้อย"},{"id":"6824764424","name":"นายโรแมน คลีเมนท์"},{"id":"6824764432","name":"นางสาวลิเดีย ดวงปัญญา"},{"id":"6824764440","name":"นางสาววยากร ชยานุกูล"},{"id":"6824764457","name":"นายวรพิชญ์ มูลปา"},{"id":"6824764465","name":"นางสาววรรณวนัช กิจเอื้อวิริยะ"},{"id":"6824764473","name":"นายวรวุฒิ สุวรรณชัย"},{"id":"6824764481","name":"นางสาวสาริศา พรหมภักดี"},{"id":"6824764499","name":"นางสาวสิรภัทร บุตรสาทร"},{"id":"6824764507","name":"นางสาวสุทธิดา ไชยวรณ์"},{"id":"6824764515","name":"นางสาวสุธีรา สินาคมมาศ"},{"id":"6824764523","name":"นางสาวสุพิชฌา ช่วยนุกูล"},{"id":"6824764531","name":"นางสาวอนัญญา รัตนวิเชียร"},{"id":"6824764549","name":"นางสาวอัฐภิญญา เดชกุล"},{"id":"6824764556","name":"นางสาวอิศริญา ประดับศิลป"},{"id":"6824764564","name":"นายอุกฤษณ์ คำวิงวร"}];
const YEAR2_ROSTER_SEED=[{"id":"6724763013","name":"นางสาวกชมน นเรนทร์ราช"},{"id":"6724763021","name":"นางสาวกรรวี รสหวาน"},{"id":"6724763039","name":"นายกฤตยชญ์ ชาวเนียม"},{"id":"6724763047","name":"นางสาวก้องกฤดากร จันทร์เมือง"},{"id":"6724763054","name":"นางสาวกานต์พิชชา คงทอง"},{"id":"6724763070","name":"นางสาวเข็มอัปสร เกิดผล"},{"id":"6724763088","name":"นางสาวจิรสุดา สุทธิเดช"},{"id":"6724763096","name":"นายจีระพัชร กัดเกื้อ"},{"id":"6724763104","name":"นางสาวจุไลลา เทศแท้"},{"id":"6724763112","name":"นางสาวฉัตรชนก ณ ประเสริฐ"},{"id":"6724763120","name":"นางสาวชนัญชิดา สอนเลิศ"},{"id":"6724763138","name":"นางสาวชนัญญา จันทรา"},{"id":"6724763146","name":"นางสาวชนารดี นันตโลหิต"},{"id":"6724763153","name":"นางสาวชลธิชา ศรมณี"},{"id":"6724763161","name":"นางสาวณิชากร รักษายศ"},{"id":"6724763179","name":"นายตรัยคุณ ไชยศร"},{"id":"6724763203","name":"นายนนทพัทธ์ สระทองขาว"},{"id":"6724763211","name":"นางสาวนภัสสรณ์ หรรษานุกรม"},{"id":"6724763229","name":"นางสาวนภสร แสนกาสา"},{"id":"6724763245","name":"นางสาวปวรัมภา ลีลาวัฒนสุข"},{"id":"6724763252","name":"นางสาวปาริฉัตร ตันทวงค์"},{"id":"6724763278","name":"นางสาวปุณยาภา ไชยรัตน์"},{"id":"6724763286","name":"นางสาวปุณิกา กาญจนบุติ"},{"id":"6724763294","name":"นางสาวพรนภา ส่วยสม"},{"id":"6724763302","name":"นางสาวพลอยชมพู แนมเถื่อน"},{"id":"6724763310","name":"นางสาวพิชญ์นาท วิศพันธุ์"},{"id":"6724763328","name":"นางสาวพิชญาภา ดาวเรือง"},{"id":"6724763336","name":"นางสาวพีรดา แสงรัตน์"},{"id":"6724763344","name":"นายภักดี กลิ่นภักดี"},{"id":"6724763351","name":"นางสาวภัทรวดี รุ่งสกุลลิขิต"},{"id":"6724763369","name":"นางสาวภูริชญา แพน้อย"},{"id":"6724763377","name":"นางสาวภูษณิศา พ่วงภักดี"},{"id":"6724763393","name":"นางสาวยศวดี ดีสิน"},{"id":"6724763427","name":"นางสาวร้อยทองทา ด้วงทอง"},{"id":"6724763435","name":"นายรัชพล วรงไชย"},{"id":"6724763443","name":"นางสาวริญญ์รัตน์ ธัญเลิศพัฒนากิจ"},{"id":"6724763450","name":"นางสาววรัญญา แหลมกีกำ"},{"id":"6724763468","name":"นายวรัทย์พล พันธุ์โอสถ"},{"id":"6724763476","name":"นางสาววริศรา แสนเสนาะ"},{"id":"6724763484","name":"นางสาววริศรา กรเกษม"},{"id":"6724763492","name":"นางสาววรินทิพย์ บุญธรรม"},{"id":"6724763500","name":"นายวิภาส มุนีพรหม"},{"id":"6724763518","name":"นายวีรภัทร ผิวเกลี้ยง"},{"id":"6724763526","name":"นางสาวศุภิสรา วรุณธาพิทย์"},{"id":"6724763534","name":"นางสาวศุลีพร หดกระโทก"},{"id":"6724763542","name":"นายสรัล วรรณพงษ์"},{"id":"6724763559","name":"นางสาวสิริลักษณ์ กุลศิริ"},{"id":"6724763567","name":"นางสาวสุธาดา พวงทอง"},{"id":"6724763575","name":"นางสาวสุรัตน์วดี พลวงษ์ศรี"},{"id":"6724763583","name":"นางสาวอรณัญช์ บัวเกิด"},{"id":"6724763591","name":"นางสาวอริสรา ติณราช"},{"id":"6724763609","name":"นางสาวอัจฉรา เรืองคำโฮ"},{"id":"6724763617","name":"นายอันดา บุญมาแย้ม"},{"id":"6724763625","name":"นางสาวอารยา แมคแคมมอน"},{"id":"6724763633","name":"นางสาวอุรชา เชียงหลี"},{"id":"6724763641","name":"นางสาวกรวรรณ ทองสัมฤทธิ์"},{"id":"6724763658","name":"นางสาวกัญญาภัค ประเสริฐ"},{"id":"6724763666","name":"นายกันต์กวี รัตนสาขา"},{"id":"6724763674","name":"นายกันต์กษิดิศ สุชนกิจสกุล"},{"id":"6724763682","name":"นางสาวครองขวัญ สมศรีราช"},{"id":"6724763690","name":"นายชนุตม์ วรรณา"},{"id":"6724763708","name":"นายชยุต ทองพราว"},{"id":"6724763716","name":"นางสาวญาณภัทร เวทยานนท์"},{"id":"6724763724","name":"นางสาวญาณิกา วงษ์สกุล"},{"id":"6724763732","name":"นางสาวฐิติกานต์ แย้มแสน"},{"id":"6724763740","name":"นางสาวณญาดา ตั้งจริยธรรม"},{"id":"6724763757","name":"นายนภัทร สุวรรณมณี"},{"id":"6724763765","name":"นายธิรพิชญ์ ศิริสัมพันธ์"},{"id":"6724763781","name":"นางสาวเบญญรินทร์ ศรีธนาธิชานนท์"},{"id":"6724763799","name":"นางสาวเบญญภัสสร์ ศรีธนาธิชานนท์"},{"id":"6724763807","name":"นางสาวปิยพัทธ์ เก่งรัมย์"},{"id":"6724763815","name":"นางสาวพชรกมล มิยะพันธ์"},{"id":"6724763823","name":"นางสาวพรพันธ์ โอฆะคุปต์"},{"id":"6724763831","name":"นางสาวภณิดา อู่ใหม่"},{"id":"6724763849","name":"นางสาวมนัสนันท์ ธรรมบวร"},{"id":"6724763856","name":"นางสาวลักษิกา ยังประเสริฐ"},{"id":"6724763864","name":"นายสรัชญ์ ขวัญเงิน"},{"id":"6724763872","name":"นางสาวสุกาญ์ดา มูละสีวะ"},{"id":"6724763880","name":"นางสาวสุพรรษา บัวคลี่"},{"id":"6724763898","name":"นางสาวอธิฐา โพธิสวัสดิ์"},{"id":"6724763906","name":"นางสาวอารียา นามมุง"},{"id":"6724763914","name":"นางสาวกมลรัตน์ จำปาทอง"},{"id":"6724763922","name":"นางสาวกมลลักษณ์ เพชรศร"},{"id":"6724763930","name":"นายกรุงศรี แซ่เลี่ยง"},{"id":"6724763948","name":"นางสาวกัญญาภัค คุ้มศิลป์"},{"id":"6724763955","name":"นายกิตติพัชญ์ เอกปิยะนันท์"},{"id":"6724763971","name":"นายจัรภพ ณพีร์ชญภัส เหล่าพร"},{"id":"6724763989","name":"นางสาวจิรัชยา จันทะวงค์"},{"id":"6724764003","name":"นางสาวชญาพรรธน์ เศวตศิริกาญจน์"},{"id":"6724764011","name":"นางสาวชณพร บุญส่งนาค"},{"id":"6724764029","name":"นายชลพีร ปัดยะบุตร"},{"id":"6724764037","name":"นายชัยธัช พิสิษฐ์พงศ์พัทธ์"},{"id":"6724764045","name":"นางสาวชาลิสา ชมชื่น"},{"id":"6724764052","name":"นางสาวญานิกา ใยสำลี"},{"id":"6724764060","name":"นางสาวญาติกานต์ วัตรายุวงค์"},{"id":"6724764078","name":"นายณภัทรพงศ์ ฆ้องแก้ว"},{"id":"6724764086","name":"นายณัฐวัฒน์ ตระการเอี่ยม"},{"id":"6724764094","name":"นางสาวณิชาภัทร สาระพัดนึก"},{"id":"6724764102","name":"นางสาวดรุณรัตน์ ชูหมื่นไวย์"},{"id":"6724764110","name":"นายถิรวัฒน์ เกาะเหม"},{"id":"6724764128","name":"นางสาวทานตะวัน จูทิม"},{"id":"6724764136","name":"นายธนวัฒน์ ผาคำ"},{"id":"6724764144","name":"นางสาวธัญสินี ใช้สงวนทรัพย์"},{"id":"6724764177","name":"นางสาวนฤภร หมื่นจำเริญ"},{"id":"6724764185","name":"นางสาวนวิยา คงสถิตย์"},{"id":"6724764193","name":"นายนันทพงศ์ ติษบรรจง"},{"id":"6724764219","name":"นายนิธิพัฒน์ สันตะวงค์"},{"id":"6724764227","name":"นางสาวปรียาภัทร สุภาจารุวงค์"},{"id":"6724764235","name":"นางสาวปุญญิศา หงษ์ทอง"},{"id":"6724764243","name":"นางสาวผุสฎี นรากร"},{"id":"6724764250","name":"นายพรรวินท์ ธเนศชัยวัฒน์"},{"id":"6724764268","name":"นางสาวพลอยพิสุทธิ์ มุทุตา"},{"id":"6724764276","name":"นางสาวพัชรพร รื่นโต"},{"id":"6724764284","name":"นางสาวพัณณิน พวงขาว"},{"id":"6724764292","name":"นางสาวพัทธ์ธีรา จันทรพัชร"},{"id":"6724764300","name":"นางสาวพิชญาภัค ส่องศรี"},{"id":"6724764318","name":"นางสาวฟ้าใส ทองพุ่ม"},{"id":"6724764326","name":"นางสาวภัทรธิดา ดาทอง"},{"id":"6724764334","name":"นางสาวภาสวีร์ ไลออน"},{"id":"6724764359","name":"นางสาวมนสิการ์ ยั่งยืน"},{"id":"6724764367","name":"นายยศกร เทพวรรณ์"},{"id":"6724764375","name":"นางสาวรัตนาภรณ์ บรรจงปรุ"},{"id":"6724764391","name":"นางสาวเรือนไทย สีสมุดคำ"},{"id":"6724764409","name":"นายวงศกร วงศิริ"},{"id":"6724764417","name":"นางสาววรนุช จงแจ้งกลาง"},{"id":"6724764425","name":"นางสาววรัญญา ตระกูลฮุน"},{"id":"6724764433","name":"นางสาววศินี ทองคำ"},{"id":"6724764441","name":"นายศรพิรมย์ มหรรทัศนพงศ์"},{"id":"6724764458","name":"นางสาวศศิดาภา ช่อทับทิม"},{"id":"6724764466","name":"นางสาวศศิธร บำรุง"},{"id":"6724764474","name":"นางสาวศิวัสส์ ทะนันรัมย์"},{"id":"6724764482","name":"นายศิระ ชื่นศิริ"},{"id":"6724764490","name":"นางสาวศุภานัน บำรุงศรี"},{"id":"6724764508","name":"นายสรณ์สิริ สุภาพ"},{"id":"6724764516","name":"นางสาวสิริรักษ์ ปานเนตรแก้ว"},{"id":"6724764524","name":"นางสาวสุภัสสรา เรืองขจร"},{"id":"6724764532","name":"นางสาวอณิชชา ชูจันทร์"},{"id":"6724764540","name":"นายอริย์ธัช นิวัติธำรงสิทธิ์"},{"id":"6724764557","name":"นางสาวอริสรา ตันทรรษ์"},{"id":"6724764565","name":"นางสาวอาทิมา ทัศนิยม"},{"id":"6724764573","name":"นางสาวอิงทิวา บัญญัติศิลป์"},{"id":"6724764581","name":"นางสาวอุษณิษา สมพงษ์"}];

function fmtDate(s) {
  if (!s) return "-";
  const d = new Date(s);
  if (isNaN(d)) return "-";
  const p = n => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtTs(t) {
  if (!t) return "-";
  try {
    const time = t._seconds ? t._seconds * 1000 : (t.seconds ? t.seconds * 1000 : t);
    return fmtDate(new Date(time).toISOString());
  } catch { return "-"; }
}

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  const c = { success: "from-emerald-500 to-teal-500", error: "from-red-500 to-rose-500", info: "from-blue-500 to-indigo-500" };
  return (
    <div className="toast glass-dark rounded-2xl px-5 py-3 card-shadow flex items-center gap-3 animate-fade" style={{ zIndex: 9999 }}>
      <div className={`w-2 h-10 rounded-full bg-gradient-to-b ${c[type] || c.info}`}></div>
      <span className="font-medium text-slate-700">{msg}</span>
    </div>
  );
}

function ConfirmDialog({ title, msg, isDanger, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 modal-bg flex items-center justify-center p-4 z-[100]" onClick={onCancel}>
      <div className="glass-dark rounded-3xl card-shadow max-w-sm w-full p-6 animate-scale" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-5">{msg}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn btn-secondary flex-1">ยกเลิก</button>
          <button onClick={onConfirm} className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'} flex-1`}>ยืนยัน</button>
        </div>
      </div>
    </div>
  );
}

const renderIcon = (type, imgUrl) => {
  if (imgUrl) return <img src={imgUrl} alt={type} className="w-full h-full object-contain drop-shadow-md rounded-lg" />;
  return <div className="w-full h-full flex items-center justify-center text-3xl">{TYPE_ICONS[type] || "📦"}</div>;
};

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [password, setPassword] = useState("");
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [roster, setRoster] = useState([]);
  const [roster2, setRoster2] = useState([]);
  const [layoutOrder, setLayoutOrder] = useState([]);
  const [config, setConfig] = useState({ manualUnlock: false });

  const [toastData, setToastData] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [itemGroupModal, setItemGroupModal] = useState(null);
  const [createTypeModal, setCreateTypeModal] = useState(null);
  const [editTypeModal, setEditTypeModal] = useState(null);
  const [rosterModal, setRosterModal] = useState(null); 
  const [bulkModal, setBulkModal] = useState(false);

  const [itemSearch, setItemSearch] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [bkSearch, setBkSearch] = useState("");
  const [bkFilter, setBkFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [rSearch, setRSearch] = useState("");
  const [r2Search, setR2Search] = useState("");

  const showToast = (msg, type = "success") => setToastData({ msg, type });
  const showConfirm = (title, msg, isDanger = false) => {
    return new Promise((resolve) => {
      setConfirmData({
        title, msg, isDanger,
        onConfirm: () => { setConfirmData(null); resolve(true); },
        onCancel: () => { setConfirmData(null); resolve(false); }
      });
    });
  };

  useEffect(() => {
    if (isTokenValid()) {
      setSession({ ok: true, at: Date.now() });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) fetchAllData();
  }, [session]);

  // ============================================================
  // [แก้ไข] fetchAllData — เติมโค้ด set state ให้สมบูรณ์
  // ============================================================
  const fetchAllData = async (showRefreshToast = false) => {
    setIsRefreshing(true);
    try {
      const res = await adminFetch("https://studystation-api.onrender.com/api/admin/all-data");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // ★ ส่วนที่เพิ่มมา — set state จากข้อมูลจริง
      setItems(data.items || []);
      setBookings(data.bookings || []);
      setUsers(data.users || []);
      setRoster(data.roster1 || []);
      setRoster2(data.roster2 || []);
      setLayoutOrder(data.layoutOrder || []);
      setConfig(data.config || { manualUnlock: false });
      
      if (showRefreshToast) showToast("รีเฟรชข้อมูลสำเร็จ");
    } catch (err) {
      // ถ้า token หมดอายุ → ล็อกเอาท์
      if (err.message.includes("หมดอายุ") || err.message.includes("Token")) {
        adminLogout();
        setSession(null);
        showToast("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่", "error");
        return;
      }
      showToast("โหลดข้อมูลไม่สำเร็จ: " + err.message, "error");
    } finally { setIsRefreshing(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await adminLogin(password);
      setSession({ ok: true, at: Date.now() });
      showToast("ยินดีต้อนรับเข้าสู่ระบบ");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const logout = async () => {
    if(!(await showConfirm("ออกจากระบบ", "ยืนยันการออก?"))) return;
    adminLogout();
    setSession(null); setItems([]); setBookings([]); setUsers([]);
    showToast("ออกจากระบบ", "info");
  };

  const callApi = async (url, method = "POST", body = null) => {
    try {
      const res = await adminFetch(`https://studystation-api.onrender.com/api/admin/${url}`, {
        method, headers: { "Content-Type": "application/json" },
        ...(body && { body: JSON.stringify(body) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message || "สำเร็จ");
      await fetchAllData();
      return true;
    } catch (err) { showToast("ผิดพลาด: " + err.message, "error"); return false; }
  };

  const buildTypeGroups = (sourceItems = items) => {
    const map = new Map();
    for (const it of sourceItems) {
      if (!it.type) continue;
      let g = map.get(it.type);
      if (!g) { 
        g = { type: it.type, name: it.name || it.type, color: it.color || "from-slate-100 to-gray-200", consumable: !!it.consumable, imageUrl: it.imageUrl || "", units: [], stockRec: null }; 
        map.set(it.type, g); 
      }
      if (it.consumable) { 
        g.consumable = true; g.stockRec = it; if (it.name) g.name = it.name; if (it.color) g.color = it.color; if(it.imageUrl) g.imageUrl = it.imageUrl;
      } else { 
        g.units.push(it); if (it.name) g.name = it.name; if (it.color) g.color = it.color; if(it.imageUrl) g.imageUrl = it.imageUrl;
      }
    }
    return Array.from(map.values()).sort((a,b) => a.name.localeCompare(b.name));
  };

  const forceReturn = async (bid, iid) => {
    if(await showConfirm("บังคับคืน", "ตั้งสถานะเป็นคืนแล้ว?")) {
      try {
        const res = await adminFetch("https://studystation-api.onrender.com/api/admin/force-return", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: bid, itemId: iid })
        });
        if(res.ok) { showToast("คืนแล้ว"); fetchAllData(); }
        else { const d = await res.json(); showToast("ผิดพลาด: "+d.error, "error"); }
      } catch(e) { showToast("ผิดพลาด: "+e.message, "error"); }
    }
  };
  const deleteBooking = async (id) => {
    if(await showConfirm("ลบรายการ", "ลบรายการนี้ถาวร?", true)) await callApi(`bookings/${id}`, "DELETE");
  };
  const deleteUser = async (id) => {
    if(await showConfirm("ลบผู้ใช้", "ลบผู้ใช้นี้?", true)) await callApi(`users/${id}`, "DELETE");
  };
  const deleteRoster = async (year, id) => {
    if(await showConfirm("ลบรายชื่อ", "ลบรายชื่อนี้จากฐานข้อมูล?", true)) await callApi(`roster/${year}/${id}`, "DELETE");
  };
  const seedRoster = async (year) => {
    const list = year === '1' ? YEAR1_ROSTER_SEED : YEAR2_ROSTER_SEED;
    if(await showConfirm("เติมรายชื่อตั้งต้น", `เพิ่มรายชื่อ ${list.length} คนจาก list เริ่มต้น? (รายชื่อเดิมจะไม่ถูกทับ)`)) {
      await callApi(`roster/${year}/seed`, "POST", { roster: list });
    }
  };
  const resetStatus = async () => {
    if(await showConfirm("รีเซ็ตสถานะ", "ยืนยันการรีเซ็ต?", true)) await callApi("danger/reset");
  };
  const batchDel = async (coll, label) => {
    if(await showConfirm(`ลบ${label}`, `ลบ${label}ทั้งหมด? ไม่สามารถย้อนกลับได้`, true)) await callApi(`danger/clear/${coll}`);
  };
  
  const toggleManualUnlock = async () => {
    const newState = !config.manualUnlock;
    const msg = newState ? "ยืนยันการเปิดระบบให้ผู้ใช้สามารถกดยืมได้แม้นอกเวลาทำการ?" : "ยืนยันการปิดระบบ (กลับสู่โหมดจำกัดเวลาปกติ)?";
    if(await showConfirm("ปลดล็อกชั่วคราว", msg)) {
      await callApi("settings/config", "POST", { manualUnlock: newState });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">⏳ กำลังโหลด...</div>;
  if (!session) {
    return (
      <>
        <div className="blob blob1"></div><div className="blob blob2"></div>
        {toastData && <Toast msg={toastData.msg} type={toastData.type} onClose={() => setToastData(null)} />}
        <div className="min-h-screen flex items-center justify-center p-4 animate-fade">
          <div className="glass rounded-3xl card-shadow w-full max-w-md p-8">
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-white mb-4 shadow-xl overflow-hidden p-2 animate-fade" style={{boxShadow:"0 20px 40px -10px rgba(244,63,94,0.35)"}}>
                <img src={LOGO_URL} alt="logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
              <p className="text-slate-500 mt-2">Study Station CISTU</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">รหัสผ่าน</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input" placeholder="••••••••••" autoComplete="off" />
              </div>
              <button type="submit" className="btn btn-primary w-full py-3 text-lg">เข้าสู่ระบบ</button>
              <a href="/" className="block text-center text-sm text-slate-500 hover:text-rose-500">← กลับหน้าผู้ใช้</a>
            </form>
          </div>
        </div>
      </>
    );
  }

  const renderDashboard = () => {
    const reusable = items.filter(i => !i.consumable);
    const avail = reusable.filter(i => i.status === "Available").length;
    const borrowed = reusable.filter(i => i.status === "Borrowed").length;
    const consumables = items.filter(i => i.consumable);
    const stockLow = consumables.filter(i => (i.stock || 0) <= (i.initialStock || 0) * 0.2).length;
    const active = bookings.filter(b => b.status === "Active").length;
    const today = new Date().toDateString();
    const todayCount = bookings.filter(b => b.createdAt && new Date((b.createdAt._seconds || b.createdAt.seconds || 0) * 1000).toDateString() === today).length;

    const StatCard = ({ic, val, lbl, grad}) => (
      <div className="glass rounded-2xl p-4 card-shadow">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-[10px] font-bold text-white shadow flex-shrink-0 px-1 text-center leading-tight`}>{ic}</div>
          <div className="min-w-0">
            <div className="text-2xl font-bold text-slate-800">{val}</div>
            <div className="text-xs text-slate-500 truncate">{lbl}</div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="animate-fade">
        <div className="mb-6"><h2 className="section-title">ภาพรวมระบบ</h2><p className="text-sm text-slate-500 mt-1">ข้อมูลสรุปทั้งหมด ณ ขณะนี้</p></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <StatCard ic="ยืม-คืน" val={reusable.length} lbl="อุปกรณ์ยืม-คืน" grad="from-blue-400 to-cyan-400" />
          <StatCard ic="ว่าง" val={avail} lbl="พร้อมใช้" grad="from-emerald-400 to-teal-400" />
          <StatCard ic="ถูกยืม" val={borrowed} lbl="ถูกยืม" grad="from-rose-400 to-pink-400" />
          <StatCard ic="สิ้นเปลือง" val={consumables.length} lbl="วัสดุสิ้นเปลือง" grad="from-orange-400 to-amber-400" />
          <StatCard ic="สต็อกต่ำ" val={stockLow} lbl="สต็อกใกล้หมด" grad="from-red-400 to-rose-500" />
          <StatCard ic="ยืม" val={active} lbl="กำลังยืม" grad="from-amber-400 to-yellow-400" />
          <StatCard ic="ผู้ใช้" val={users.length} lbl="ผู้ใช้" grad="from-purple-400 to-fuchsia-400" />
          <StatCard ic="วันนี้" val={todayCount} lbl="ยืมวันนี้" grad="from-sky-400 to-indigo-400" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 card-shadow">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">กิจกรรมล่าสุด</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {bookings.length === 0 ? <p className="text-sm text-slate-500 text-center py-6">ยังไม่มีกิจกรรม</p> : bookings.slice(0,8).map(b => (
                <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/40">
                  <div className="text-lg">{b.consumable?"📝":"📦"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{b.itemName || "-"}</p>
                    <p className="text-xs text-slate-500 truncate">{b.studentName || "-"} • {fmtTs(b.createdAt)}</p>
                  </div>
                  <span className={`chip ${b.status==="Active"?"bg-amber-100 text-amber-700":b.status==="Consumed"?"bg-orange-100 text-orange-700":"bg-emerald-100 text-emerald-700"}`}>
                    {b.status==="Active"?"กำลังยืม":b.status==="Consumed"?"เบิกแล้ว":"คืนแล้ว"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5 card-shadow">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">สต็อกวัสดุสิ้นเปลือง</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {consumables.length === 0 ? <p className="text-sm text-slate-500 text-center py-6">ไม่มีวัสดุสิ้นเปลือง</p> : consumables.map(i => {
                const init = i.initialStock || 1;
                const pct = Math.round(((i.stock || 0) / init) * 100);
                const low = pct <= 20;
                return (
                  <div key={i.id} className="p-3 rounded-lg bg-white/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-slate-700">{i.name}</span>
                      <span className={`text-xs font-bold ${low?'text-red-600':'text-slate-600'}`}>{i.stock||0}/{init}</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${low?'from-red-400 to-rose-400':'from-orange-400 to-amber-400'}`} style={{width:`${pct}%`}}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderItemsGrouped = () => {
    const groups = buildTypeGroups();
    let list = groups.filter(g => {
      const q = itemSearch.toLowerCase();
      if(q && ![g.name, g.type].some(x => (x||"").toLowerCase().includes(q))) return false;
      if(itemFilter === "reusable" && g.consumable) return false;
      if(itemFilter === "consumable" && !g.consumable) return false;
      return true;
    });

    return (
      <div className="animate-fade">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div><h2 className="section-title">จัดการอุปกรณ์ (จัดกลุ่ม)</h2><p className="text-sm text-slate-500 mt-1">มีอุปกรณ์ทั้งหมด {groups.length} ประเภท</p></div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={()=>setCreateTypeModal(true)} className="btn btn-primary">✨ สร้างประเภทอุปกรณ์ใหม่</button>
            <button onClick={()=>setBulkModal(true)} className="btn btn-secondary">เพิ่มเป็นชุด</button>
          </div>
        </div>

        <div className="glass rounded-2xl p-3 mb-4 card-shadow flex flex-col sm:flex-row gap-2">
          <input className="input flex-1" placeholder="ค้นหาชื่อ / ประเภท..." value={itemSearch} onChange={e=>setItemSearch(e.target.value)} />
          <select className="input sm:w-48" value={itemFilter} onChange={e=>setItemFilter(e.target.value)}>
            <option value="">ทุกประเภท</option><option value="reusable">ยืม-คืน</option><option value="consumable">วัสดุสิ้นเปลือง</option>
          </select>
        </div>

        <div className="glass rounded-2xl overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>รูป / ไอคอน</th><th>ประเภท</th><th>ชื่อ</th><th>ชนิด</th><th>จำนวนรวม / สต็อก</th><th>การกระทำ</th></tr></thead>
              <tbody>
                {list.length === 0 ? <tr><td colSpan="6" className="text-center text-slate-400 py-8">ไม่พบข้อมูล</td></tr> : list.map(g => {
                  let statusBadge;
                  if (g.consumable) {
                    const st = g.stockRec?.stock || 0;
                    const init = g.stockRec?.initialStock || 0;
                    statusBadge = <span className="chip bg-orange-100 text-orange-700">สต็อก: {st}/{init}</span>;
                  } else {
                    const total = g.units.length;
                    const availCount = g.units.filter(u => u.status === "Available").length;
                    statusBadge = <span className="chip bg-blue-100 text-blue-700">ทั้งหมด {total} (ว่าง {availCount})</span>;
                  }
                  return (
                    <tr key={g.type}>
                      <td data-label="รูปภาพ"><div className="w-12 h-12 rounded-lg bg-white shadow-sm p-1">{renderIcon(g.type, g.imageUrl)}</div></td>
                      <td data-label="ประเภท"><span className="font-mono text-xs">{g.type}</span></td>
                      <td data-label="ชื่อ"><span className="font-bold">{g.name}</span></td>
                      <td data-label="ชนิด"><span className="chip bg-slate-100 text-slate-700">{g.consumable ? "เบิก (ไม่คืน)" : "ยืม-คืน"}</span></td>
                      <td data-label="จำนวน">{statusBadge}</td>
                      <td data-label="การกระทำ"><button onClick={() => setItemGroupModal(g)} className="btn btn-secondary btn-xs bg-slate-200">⚙️ จัดการอุปกรณ์</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderLayoutSettings = () => {
    const uniqueGroups = buildTypeGroups();
    const currentList = [];
    
    layoutOrder.forEach(type => {
      const found = uniqueGroups.find(g => g.type === type);
      if (found) currentList.push(found);
    });
    
    uniqueGroups.forEach(g => {
      if (!layoutOrder.includes(g.type)) currentList.push(g);
    });

    const moveUp = (index) => {
      if (index === 0) return;
      const newList = [...currentList];
      const temp = newList[index];
      newList[index] = newList[index - 1];
      newList[index - 1] = temp;
      setLayoutOrder(newList.map(g => g.type));
    };

    const moveDown = (index) => {
      if (index === currentList.length - 1) return;
      const newList = [...currentList];
      const temp = newList[index];
      newList[index] = newList[index + 1];
      newList[index + 1] = temp;
      setLayoutOrder(newList.map(g => g.type));
    };

    const saveLayout = async () => {
      await callApi("settings/layout", "POST", { typeOrder: currentList.map(g => g.type) });
    };

    return (
      <div className="animate-fade">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div><h2 className="section-title">จัดเรียงหน้าจอ</h2><p className="text-sm text-slate-500 mt-1">ลำดับการแสดงผลในหน้าแรกของผู้ใช้</p></div>
          <button onClick={saveLayout} className="btn btn-primary">💾 บันทึกการจัดเรียง</button>
        </div>
        <div className="glass rounded-2xl p-5 card-shadow max-w-2xl mx-auto">
          <p className="text-sm text-slate-600 mb-4 bg-sky-50 p-3 rounded-xl">กดปุ่มลูกศรเพื่อเลื่อนตำแหน่งอุปกรณ์ เมื่อเรียงเสร็จแล้วให้กดปุ่มบันทึกด้านบน</p>
          <div className="space-y-2">
            {currentList.map((g, idx) => (
              <div key={g.type} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${g.color} flex items-center justify-center p-1 shadow-inner`}>
                    {renderIcon(g.type, g.imageUrl)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{g.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{g.type}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition">▲</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === currentList.length - 1} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition">▼</button>
                </div>
              </div>
            ))}
            {currentList.length === 0 && <p className="text-center text-sm text-slate-400 py-4">ไม่มีข้อมูลอุปกรณ์</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderBookings = () => {
    let list = bookings.filter(b => {
      const q = bkSearch.toLowerCase();
      if(q && ![b.itemName, b.studentName, b.studentId, b.itemId].some(x => (x||"").toLowerCase().includes(q))) return false;
      if(bkFilter && b.status !== bkFilter) return false;
      return true;
    });

    return (
      <div className="animate-fade">
        <div className="mb-5"><h2 className="section-title">การยืม / เบิก</h2><p className="text-sm text-slate-500 mt-1">ทั้งหมด {bookings.length} รายการ</p></div>
        <div className="glass rounded-2xl p-3 mb-4 card-shadow flex flex-col sm:flex-row gap-2">
          <input className="input flex-1" placeholder="ค้นหา ชื่อ / รหัสนักศึกษา / อุปกรณ์..." value={bkSearch} onChange={e=>setBkSearch(e.target.value)} />
          <select className="input sm:w-48" value={bkFilter} onChange={e=>setBkFilter(e.target.value)}>
            <option value="">ทุกสถานะ</option><option value="Active">กำลังยืม</option><option value="Returned">คืนแล้ว</option><option value="Consumed">เบิกแล้ว</option>
          </select>
        </div>
        <div className="glass rounded-2xl overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>อุปกรณ์</th><th>ผู้ยืม</th><th>เวลา/จำนวน</th><th>สถานะ</th><th>การกระทำ</th></tr></thead>
              <tbody>
                {list.length===0 ? <tr><td colSpan="5" className="text-center text-slate-400 py-8">ไม่พบข้อมูล</td></tr> : list.map(b => {
                  const isC = b.status==="Consumed"||b.consumable;
                  return (
                    <tr key={b.id}>
                      <td data-label="อุปกรณ์"><div className="font-semibold">{b.itemName||"-"}</div><div className="text-xs text-slate-500 font-mono">{b.itemId||"-"}</div></td>
                      <td data-label="ผู้ยืม"><div className="font-semibold">{b.studentName||"-"}</div><div className="text-xs text-slate-500">{b.studentId||"-"} • ปี {b.yearOfStudy||"-"}</div></td>
                      <td data-label="เวลา">
                        {isC ? <><span className="font-semibold text-orange-600">×{b.quantity||1} ชิ้น</span><br/><span className="text-xs text-slate-500">{fmtTs(b.createdAt)}</span></> : `${fmtDate(b.startTime)} → ${fmtDate(b.endTime)}`}
                      </td>
                      <td data-label="สถานะ">
                        {b.status==="Active"?<span className="chip bg-amber-100 text-amber-700">กำลังยืม</span>:b.status==="Returned"?<span className="chip bg-emerald-100 text-emerald-700">คืนแล้ว</span>:<span className="chip bg-orange-100 text-orange-700">เบิกแล้ว</span>}
                      </td>
                      <td data-label="การกระทำ">
                        <div className="flex gap-1 justify-end flex-wrap">
                          {b.status==="Active" && <button onClick={()=>forceReturn(b.id, b.itemId)} className="btn btn-success btn-xs">บังคับคืน</button>}
                          <button onClick={()=>deleteBooking(b.id)} className="btn btn-danger btn-xs">ลบ</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    const list = users.filter(u => {
      const q = userSearch.toLowerCase();
      if(q && ![u.studentId, u.fullName].some(x => (x||"").toLowerCase().includes(q))) return false;
      return true;
    });

    return (
      <div className="animate-fade">
        <div className="mb-5"><h2 className="section-title">ผู้ใช้งาน</h2><p className="text-sm text-slate-500 mt-1">ทั้งหมด {users.length} คน</p></div>
        <div className="glass rounded-2xl p-3 mb-4 card-shadow"><input className="input" placeholder="ค้นหา รหัส / ชื่อ..." value={userSearch} onChange={e=>setUserSearch(e.target.value)} /></div>
        <div className="glass rounded-2xl overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>รหัสนักศึกษา</th><th>ชื่อ - นามสกุล</th><th>ชั้นปี</th><th>ประวัติยืม</th><th>การกระทำ</th></tr></thead>
              <tbody>
                {list.length===0 ? <tr><td colSpan="5" className="text-center text-slate-400 py-8">ไม่พบผู้ใช้</td></tr> : list.map(u => (
                  <tr key={u.id}>
                    <td data-label="รหัส"><span className="font-mono font-semibold">{u.studentId}</span></td>
                    <td data-label="ชื่อ">{u.fullName}</td>
                    <td data-label="ปี"><span className="chip bg-blue-100 text-blue-700">ปี {u.yearOfStudy||"-"}</span></td>
                    <td data-label="ประวัติ">{bookings.filter(b=>b.studentId===u.studentId).length} ครั้ง</td>
                    <td data-label="การกระทำ"><button onClick={()=>deleteUser(u.id)} className="btn btn-danger btn-xs">ลบ</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderRoster = (dataList, year, search, setSearch) => {
    const list = dataList.filter(u => {
      const q = search.toLowerCase();
      if(q && ![u.studentId, u.fullName].some(x => (x||"").toLowerCase().includes(q))) return false;
      return true;
    });

    return (
      <div className="animate-fade">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div><h2 className="section-title">รายชื่อนักศึกษาปี {year}</h2><p className="text-sm text-slate-500 mt-1">ฐานข้อมูล {dataList.length} คน</p></div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={()=>setRosterModal({isNew:true, data:{studentId:"",fullName:""}, year})} className="btn btn-primary">เพิ่มรายชื่อ</button>
            <button onClick={()=>seedRoster(year)} className="btn btn-secondary">เติมจากค่าเริ่มต้น</button>
          </div>
        </div>
        <div className="glass rounded-2xl p-3 mb-4 card-shadow"><input className="input" placeholder="ค้นหา รหัส / ชื่อ..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
        <div className="glass rounded-2xl overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>รหัสนักศึกษา</th><th>ชื่อ - นามสกุล</th><th>การกระทำ</th></tr></thead>
              <tbody>
                {list.length===0 ? <tr><td colSpan="3" className="text-center text-slate-400 py-8">ไม่พบรายชื่อ</td></tr> : list.map(u => (
                  <tr key={u.id}>
                    <td data-label="รหัส"><span className="font-mono font-semibold">{u.studentId}</span></td>
                    <td data-label="ชื่อ">{u.fullName}</td>
                    <td data-label="การกระทำ"><div className="flex gap-1 justify-end">
                      <button onClick={()=>setRosterModal({isNew:false, data:u, year})} className="btn btn-primary btn-xs">แก้ไข</button>
                      <button onClick={()=>deleteRoster(year, u.id)} className="btn btn-danger btn-xs">ลบ</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDanger = () => (
    <div className="animate-fade">
      <div className="mb-5"><h2 className="section-title">ฟังก์ชันขั้นสูง</h2><p className="text-sm text-red-500 mt-1">การกระทำในหน้านี้ไม่สามารถย้อนกลับได้ โปรดใช้ด้วยความระมัดระวัง</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        
        <div className="glass rounded-2xl p-5 card-shadow border-2 border-blue-300">
          <h3 className="font-bold text-blue-800 mb-2">ปลดล็อกฉุกเฉิน (นอกเวลา)</h3>
          <p className="text-sm text-slate-600 mb-3">
            สถานะปัจจุบัน: {config.manualUnlock ? <span className="text-emerald-600 font-bold">เปิดใช้งาน (ยืมได้ตลอด)</span> : <span className="text-slate-500 font-bold">ปกติ (ตามเวลา)</span>}
          </p>
          <button onClick={toggleManualUnlock} className={`btn w-full ${config.manualUnlock ? 'btn-danger' : 'btn-success'}`}>
            {config.manualUnlock ? "ปิดการปลดล็อก" : "เปิดการปลดล็อกชั่วคราว"}
          </button>
        </div>

        <div className="glass rounded-2xl p-5 card-shadow border-2 border-amber-200">
          <h3 className="font-bold text-amber-700 mb-2">รีเซ็ตสถานะอุปกรณ์</h3>
          <p className="text-sm text-slate-600 mb-3">คืนสถานะอุปกรณ์ยืม-คืนทั้งหมดเป็น ว่าง และเติมสต็อกวัสดุสิ้นเปลืองกลับเต็ม</p>
          <button onClick={resetStatus} className="btn btn-primary w-full">รีเซ็ตสถานะ</button>
        </div>
        <div className="glass rounded-2xl p-5 card-shadow border-2 border-orange-200">
          <h3 className="font-bold text-orange-700 mb-2">ลบการยืมทั้งหมด</h3>
          <p className="text-sm text-slate-600 mb-3">ลบประวัติการยืม/เบิกทุกรายการ (อุปกรณ์จะไม่ถูกแตะ)</p>
          <button onClick={()=>batchDel("bookings", "ประวัติการยืม")} className="btn btn-danger w-full">ลบประวัติ</button>
        </div>
        <div className="glass rounded-2xl p-5 card-shadow border-2 border-red-200">
          <h3 className="font-bold text-red-700 mb-2">ลบผู้ใช้ทั้งหมด</h3>
          <p className="text-sm text-slate-600 mb-3">ลบข้อมูลผู้ใช้ทั้งหมดออกจากระบบ</p>
          <button onClick={()=>batchDel("users", "ข้อมูลผู้ใช้")} className="btn btn-danger w-full">ลบผู้ใช้</button>
        </div>
        <div className="glass rounded-2xl p-5 card-shadow border-2 border-red-300 md:col-span-2">
          <h3 className="font-bold text-red-800 mb-2">ลบอุปกรณ์ทั้งหมด</h3>
          <p className="text-sm text-slate-600 mb-3">ลบรายการอุปกรณ์ทุกชิ้น</p>
          <button onClick={()=>batchDel("items", "อุปกรณ์")} className="btn btn-danger w-full">ลบอุปกรณ์</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="blob blob1"></div><div className="blob blob2"></div>
      {toastData && <Toast msg={toastData.msg} type={toastData.type} onClose={() => setToastData(null)} />}
      {confirmData && <ConfirmDialog {...confirmData} />}

      <div className="min-h-screen animate-fade">
        <header className="glass-dark sticky top-0 z-30 border-b border-white/40">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white shadow-lg overflow-hidden p-0.5 flex-shrink-0">
                <img src={LOGO_URL} alt="logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-base sm:text-lg gradient-text truncate">Admin Panel</h1>
                <p className="text-[11px] text-slate-500 truncate">Study Station CISTU</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchAllData(true)} className="btn btn-secondary btn-xs">
                <span>{isRefreshing ? <span className="spinner" style={{width:12,height:12,borderWidth:1}}></span> : "รีเฟรช"}</span>
              </button>
              <button onClick={logout} className="btn btn-danger btn-xs"><span>ออกจากระบบ</span></button>
            </div>
          </div>
          <nav className="max-w-7xl mx-auto px-2 lg:px-4 pb-2 overflow-x-auto">
            <div className="flex gap-1.5 min-w-max">
              {[["items","📦 จัดการอุปกรณ์"], ["layout","🎨 จัดเรียงหน้าจอ"], ["dashboard","ภาพรวม"], ["bookings","การยืม"], ["users","ผู้ใช้"], ["roster","รายชื่อปี 1"], ["roster2","รายชื่อปี 2"], ["danger","ขั้นสูง"]].map(([k,l]) => (
                <button key={k} onClick={() => setCurrentTab(k)} className={`tab-btn px-4 py-2 rounded-xl font-medium text-sm ${currentTab === k ? "active" : "text-slate-600 hover:bg-white/50"}`}>
                  {l}
                </button>
              ))}
            </div>
          </nav>
        </header>

        <main className="max-w-7xl mx-auto p-4 lg:p-6" id="main">
          {currentTab === "dashboard" && renderDashboard()}
          {currentTab === "items" && renderItemsGrouped()}
          {currentTab === "layout" && renderLayoutSettings()}
          {currentTab === "bookings" && renderBookings()}
          {currentTab === "users" && renderUsers()}
          {currentTab === "roster" && renderRoster(roster, "1", rSearch, setRSearch)}
          {currentTab === "roster2" && renderRoster(roster2, "2", r2Search, setR2Search)}
          {currentTab === "danger" && renderDanger()}
        </main>
        
        <footer className="text-center text-xs text-slate-400 py-6">© 2026 Study Station CIS Thammasat University</footer>

        {/* --- MODALS --- */}
        {itemGroupModal && (() => {
          const g = itemGroupModal;
          return (
            <div className="fixed inset-0 modal-bg flex items-center justify-center p-4 z-50">
              <div className="glass-dark rounded-3xl card-shadow max-w-xl w-full p-6 animate-scale max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center p-2 shadow-inner`}>
                      {renderIcon(g.type, g.imageUrl)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-800">{g.name}</h3>
                        <button onClick={() => { setEditTypeModal(g); setItemGroupModal(null); }} className="text-blue-500 hover:text-blue-700 font-bold text-sm ml-2 px-2 py-1 bg-blue-50 rounded-lg border border-blue-200">แก้ไขกลุ่ม</button>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">Type: {g.type}</p>
                    </div>
                  </div>
                  <button onClick={()=>setItemGroupModal(null)} className="text-slate-400 hover:text-red-500 font-bold text-xl">✕</button>
                </div>

                {g.consumable ? (
                  <div className="glass rounded-xl p-5 bg-orange-50/50">
                    <h4 className="font-bold text-orange-800 mb-2">อัปเดตสต็อกวัสดุสิ้นเปลือง</h4>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm">สต็อกปัจจุบัน:</span>
                      <span className="text-2xl font-bold text-orange-600">{g.stockRec?.stock || 0}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {[1,5,10,50].map(n=><button key={n} onClick={()=>callApi(`items/${g.stockRec.id}/update`,"POST",{stock: (g.stockRec.stock||0)+n})} className="btn btn-success btn-xs">+{n}</button>)}
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[1,5,10,50].map(n=><button key={n} onClick={()=>callApi(`items/${g.stockRec.id}/update`,"POST",{stock: Math.max(0,(g.stockRec.stock||0)-n)})} className="btn btn-danger btn-xs">-{n}</button>)}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-700">รายการชิ้นย่อย ({g.units.length} ชิ้น)</h4>
                      <button onClick={async () => {
                        const btn = document.getElementById("autoAddBtn");
                        btn.disabled = true; btn.innerHTML = "กำลังสร้าง...";
                        await callApi("items/auto-add", "POST", { type: g.type, name: g.name, color: g.color, imageUrl: g.imageUrl });
                        btn.disabled = false; btn.innerHTML = "+ เพิ่ม 1 ชิ้น";
                      }} id="autoAddBtn" className="btn btn-primary btn-xs !py-1.5 shadow-sm">
                        + เพิ่ม 1 ชิ้น
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {g.units.sort((a,b)=>(a.number||0)-(b.number||0)).map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-white">
                          <div>
                            <div className="font-mono text-sm font-bold text-slate-700">{u.itemId}</div>
                            <div className="text-[10px] text-slate-500">เลขกำกับ: {u.number}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`chip ${u.status==="Available"?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700'}`}>{u.status==="Available"?"ว่าง":"ถูกยืม"}</span>
                            <button onClick={async () => {
                              if(await showConfirm("ลบชิ้นนี้", `ลบ ${u.itemId} ถาวร?`, true)) await callApi(`items/${u.id}`, "DELETE");
                            }} className="text-red-400 hover:text-red-600">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      {g.units.length === 0 && <p className="text-center text-sm text-slate-400 py-4">ไม่มีของในสต็อกเลย กดเพิ่มสิ!</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {editTypeModal && (() => {
          const g = editTypeModal;
          return (
            <div className="fixed inset-0 modal-bg flex items-center justify-center p-4 z-50">
              <div className="glass-dark rounded-3xl card-shadow max-w-md w-full p-6 animate-scale">
                <h3 className="text-xl font-bold text-slate-800 mb-5">✏️ แก้ไขข้อมูลกลุ่มอุปกรณ์</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  const payload = {
                    name: fd.get("name"), color: fd.get("color"), imageUrl: fd.get("imgUrl"),
                    consumable: fd.get("cons")==="on"
                  };
                  if(await callApi(`types/${g.type}/update`, "POST", payload)) setEditTypeModal(null);
                }} className="space-y-4">
                  
                  <div><label className="block text-sm font-semibold mb-1">รหัสประเภท</label><input className="input font-mono bg-slate-100" value={g.type} readOnly /></div>
                  <div><label className="block text-sm font-semibold mb-1">ชื่อเรียก</label><input name="name" className="input" defaultValue={g.name} required /></div>
                  <div><label className="block text-sm font-semibold mb-1">ลิงก์รูปภาพ (URL)</label><input name="imgUrl" className="input" placeholder="วางลิงก์รูป หรือเว้นว่างไว้" defaultValue={g.imageUrl || ""} /></div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">สีพื้นหลังไอคอน (กรณีไม่มีรูป)</label>
                    <select name="color" className="input" defaultValue={g.color}>{COLOR_PALETTE.map(c=><option key={c.v} value={c.v}>{c.n}</option>)}</select>
                  </div>
                  <div className="glass rounded-xl p-3 border-orange-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input name="cons" type="checkbox" className="w-5 h-5" defaultChecked={g.consumable} />
                      <div>
                        <div className="font-bold text-sm text-orange-700">เปลี่ยนเป็นวัสดุสิ้นเปลือง</div>
                        <div className="text-xs text-slate-600">หากติ๊ก ของชิ้นย่อยจะถูกลบและรวบเป็นคลังเดียวกันทั้งหมด</div>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={()=>setEditTypeModal(null)} className="btn btn-secondary flex-1">ยกเลิก</button>
                    <button type="submit" className="btn btn-primary flex-1">บันทึกการแก้ไข</button>
                  </div>
                </form>
              </div>
            </div>
          )
        })()}

        {createTypeModal && (
          <div className="fixed inset-0 modal-bg flex items-center justify-center p-4 z-50">
            <div className="glass-dark rounded-3xl card-shadow max-w-md w-full p-6 animate-scale">
              <h3 className="text-xl font-bold text-slate-800 mb-5">✨ สร้างประเภทอุปกรณ์ใหม่</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const t = fd.get("type"); const n = fd.get("name"); const c = fd.get("color"); const imgUrl = fd.get("imgUrl"); const isCons = fd.get("cons")==="on";
                
                const newId = isCons ? `${t}_stock` : `${t}_001`;
                const payload = {
                  itemId: newId, type: t, name: n, color: c, imageUrl: imgUrl,
                  consumable: isCons, status: "Available", number: 1, stock: isCons?10:0, initialStock: isCons?10:0
                };
                if(await callApi("items", "POST", payload)) setCreateTypeModal(false);
              }} className="space-y-4">
                
                <div><label className="block text-sm font-semibold mb-1">รหัสประเภท (ภาษาอังกฤษ)</label><input name="type" className="input font-mono" placeholder="เช่น laptop" required /></div>
                <div><label className="block text-sm font-semibold mb-1">ชื่อเรียก</label><input name="name" className="input" placeholder="เช่น โน้ตบุ๊ก Acer" required /></div>
                <div><label className="block text-sm font-semibold mb-1">ลิงก์รูปภาพ (URL)</label><input name="imgUrl" className="input" placeholder="วางลิงก์รูป หรือเว้นว่างไว้" /></div>
                <div>
                  <label className="block text-sm font-semibold mb-1">สีพื้นหลังไอคอน (กรณีไม่มีรูป)</label>
                  <select name="color" className="input">{COLOR_PALETTE.map(c=><option key={c.v} value={c.v}>{c.n}</option>)}</select>
                </div>
                <div className="glass rounded-xl p-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input name="cons" type="checkbox" className="w-5 h-5" />
                    <div><div className="font-semibold text-sm">ตั้งเป็นวัสดุสิ้นเปลืองแต่แรก</div></div>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={()=>setCreateTypeModal(false)} className="btn btn-secondary flex-1">ยกเลิก</button>
                  <button type="submit" className="btn btn-primary flex-1">สร้าง</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {bulkModal && (
          <div className="fixed inset-0 modal-bg flex items-center justify-center p-4 z-50">
            <div className="glass-dark rounded-3xl card-shadow max-w-md w-full p-6 animate-scale">
              <h3 className="text-xl font-bold mb-1">เพิ่มเป็นชุด</h3><p className="text-xs text-slate-500 mb-4">เพิ่มอุปกรณ์ยืม-คืนหลายชิ้นพร้อมกัน (type เดียว เลขต่อกัน)</p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const t=fd.get("t"), n=fd.get("n"), q=Number(fd.get("q")), s=Number(fd.get("s")), c=fd.get("c"), imgUrl=fd.get("imgUrl");
                const itemsList = [];
                for(let i=0; i<q; i++){
                  const num = s+i;
                  itemsList.push({ itemId: `${t}_${String(num).padStart(3,"0")}`, type: t, name: n, color: c, imageUrl: imgUrl, status: "Available", number: num, consumable: false });
                }
                if(await callApi("items/bulk", "POST", {items: itemsList})) setBulkModal(false);
              }} className="space-y-3">
                <div><label className="block text-sm font-semibold mb-1">Type</label><input name="t" className="input font-mono" placeholder="pencil" required /></div>
                <div><label className="block text-sm font-semibold mb-1">ชื่อ</label><input name="n" className="input" placeholder="ดินสอ 2B" required /></div>
                <div><label className="block text-sm font-semibold mb-1">ลิงก์รูปภาพ</label><input name="imgUrl" className="input" placeholder="วางลิงก์รูป หรือเว้นว่างไว้" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-semibold mb-1">จำนวน</label><input name="q" type="number" min="1" max="100" defaultValue="5" className="input" /></div>
                  <div><label className="block text-sm font-semibold mb-1">เริ่มที่เลข</label><input name="s" type="number" min="1" defaultValue="1" className="input" /></div>
                </div>
                <div><label className="block text-sm font-semibold mb-1">สีพื้นหลัง</label><select name="c" className="input">{COLOR_PALETTE.map(c=><option key={c.v} value={c.v}>{c.n}</option>)}</select></div>
                <div className="flex gap-2 pt-2"><button type="button" onClick={()=>setBulkModal(false)} className="btn btn-secondary flex-1">ยกเลิก</button><button type="submit" className="btn btn-primary flex-1">เพิ่มทั้งหมด</button></div>
              </form>
            </div>
          </div>
        )}

        {rosterModal && (() => {
          const { isNew, data, year } = rosterModal;
          return (
            <div className="fixed inset-0 modal-bg flex items-center justify-center p-4 z-50">
              <div className="glass-dark rounded-3xl card-shadow max-w-md w-full p-6 animate-scale">
                <h3 className="text-xl font-bold mb-4">{isNew?`เพิ่มรายชื่อนักศึกษาปี ${year}`:"แก้ไขรายชื่อ"}</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  if(await callApi(`roster/${year}`, "POST", {studentId: fd.get("sid"), fullName: fd.get("fn")})) setRosterModal(null);
                }} className="space-y-4" noValidate>
                  <div><label className="block text-sm font-semibold mb-1">รหัส (10 หลัก)</label><input name="sid" maxLength="10" inputMode="numeric" className="input font-mono" defaultValue={data.studentId} readOnly={!isNew} required /></div>
                  <div><label className="block text-sm font-semibold mb-1">ชื่อ - นามสกุล (พร้อมคำนำหน้า)</label><input name="fn" className="input" defaultValue={data.fullName} required /></div>
                  <div className="flex gap-2 pt-2"><button type="button" onClick={()=>setRosterModal(null)} className="btn btn-secondary flex-1">ยกเลิก</button><button type="submit" className="btn btn-primary flex-1">บันทึก</button></div>
                </form>
              </div>
            </div>
          )
        })()}
      </div>
    </>
  );
}
