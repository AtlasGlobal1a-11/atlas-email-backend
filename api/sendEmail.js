import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // ---------- CORS ----------
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // ---------- Extract request body ----------
    const {
      to,
      recipientName = "Customer",
      subject = "Package Status Updated",
      status,
      trackingNumber,
      destination = "",
      houseAddress = "",
    } = req.body;

    if (!to || !status || !trackingNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ---------- Clean houseAddress ----------
    const cleanHouseAddress = (houseAddress || "").trim() || "Not provided";

    // ---------- Language templates ----------
    const messages = {
      en: (n, s, t, d, a) => `
Dear ${n},

Your package status is now: ${s}
Tracking Number: ${t}
Destination: ${d || "Not provided"}
Delivery Address: ${a || "Not provided"}

Track here: https://atlas-global-shippings.web.app/track.html?id=${t}

For more inquiries, contact Atlas Global Shipping Team.
`,
      es: (n, s, t, d, a) => `
Estimado/a ${n},

El estado de su paquete ahora es: ${s}
Número de seguimiento: ${t}
Destino: ${d || "No proporcionado"}
Dirección de entrega: ${a || "No proporcionada"}

Rastree aquí: https://atlas-global-shippings.web.app/track.html?id=${t}

Para más consultas, contacte al equipo de Atlas Global Shipping.
`,
      pt: (n, s, t, d, a) => `
Caro(a) ${n},

O status do seu pacote agora é: ${s}
Número de rastreamento: ${t}
Destino: ${d || "Não informado"}
Endereço de entrega: ${a || "Não informado"}

Acompanhe aqui: https://atlas-global-shippings.web.app/track.html?id=${t}

Para mais informações, entre em contato com a equipe da Atlas Global Shipping.
`,
      fr: (n, s, t, d, a) => `
Cher/Chère ${n},

Le statut de votre colis est maintenant : ${s}
Numéro de suivi : ${t}
Destination : ${d || "Non précisée"}
Adresse de livraison : ${a || "Non précisée"}

Suivez-le ici : https://atlas-global-shippings.web.app/track.html?id=${t}

Pour plus d'informations, contactez l'équipe Atlas Global Shipping.
`,
      de: (n, s, t, d, a) => `
Sehr geehrte/r ${n},

Der Status Ihres Pakets ist jetzt: ${s}
Sendungsnummer: ${t}
Zielort: ${d || "Nicht angegeben"}
Lieferadresse: ${a || "Nicht angegeben"}

Verfolgen Sie es hier: https://atlas-global-shippings.web.app/track.html?id=${t}

Für weitere Anfragen kontaktieren Sie bitte das Atlas Global Shipping Team.
`,
      it: (n, s, t, d, a) => `
Gentile ${n},

Lo stato del suo pacco è ora: ${s}
Numero di tracciamento: ${t}
Destinazione: ${d || "Non specificata"}
Indirizzo di consegna: ${a || "Non specificato"}

Traccia qui: https://atlas-global-shippings.web.app/track.html?id=${t}

Per ulteriori informazioni, contatta il team di Atlas Global Shipping.
`,
      th: (n, s, t, d, a) => `
เรียน ${n},

สถานะพัสดุของคุณตอนนี้คือ: ${s}
หมายเลขติดตาม: ${t}
ปลายทาง: ${d || "ไม่ได้ระบุ"}
ที่อยู่จัดส่ง: ${a || "ไม่ได้ระบุ"}

ติดตามได้ที่: https://atlas-global-shippings.web.app/track.html?id=${t}

หากต้องการสอบถามเพิ่มเติม กรุณาติดต่อทีม Atlas Global Shipping
`,
      ko: (n, s, t, d, a) => `
${n} 님께,

고객님의 배송 상태는 현재: ${s}
운송장 번호: ${t}
도착지: ${d || "미기재"}
배송 주소: ${a || "미기재"}

여기에서 추적하세요: https://atlas-global-shippings.web.app/track.html?id=${t}

추가 문의는 Atlas Global Shipping 팀에 문의해 주시기 바랍니다.
`,
      ja: (n, s, t, d, a) => `
${n} 様

お荷物の状況は現在: ${s}
追跡番号: ${t}
お届け先: ${d || "未記入"}
お届け先住所: ${a || "未記入"}

こちらから追跡できます: https://atlas-global-shippings.web.app/track.html?id=${t}

ご不明点は Atlas Global Shipping チームまでお問い合わせください。
`,
      zh: (n, s, t, d, a) => `
尊敬的 ${n},

您的包裹状态现在是: ${s}
追踪号码: ${t}
目的地: ${d || "未提供"}
收货地址: ${a || "未提供"}

在此跟踪: https://atlas-global-shippings.web.app/track.html?id=${t}

如需更多信息，请联系 Atlas Global Shipping 团队。
`,
      vi: (n, s, t, d, a) => `
Kính gửi ${n},

Tình trạng gói hàng của bạn hiện tại: ${s}
Mã vận đơn: ${t}
Điểm đến: ${d || "Chưa cung cấp"}
Địa chỉ giao hàng: ${a || "Chưa cung cấp"}

Theo dõi tại đây: https://atlas-global-shippings.web.app/track.html?id=${t}

Mọi thắc mắc vui lòng liên hệ nhóm Atlas Global Shipping.
`,
      ms: (n, s, t, d, a) => `
Yang dihormati ${n},

Status bungkusan anda kini: ${s}
Nombor penjejakan: ${t}
Destinasi: ${d || "Tidak diberikan"}
Alamat penghantaran: ${a || "Tidak diberikan"}

Jejaki di sini: https://atlas-global-shippings.web.app/track.html?id=${t}

Untuk maklumat lanjut, sila hubungi pasukan Atlas Global Shipping.
`,
      tl: (n, s, t, d, a) => `
Mahal na ${n},

Ang status ng iyong package ay ngayon: ${s}
Numero ng Pagsubaybay: ${t}
Destinasyon: ${d || "Hindi ibinigay"}
Tirahan ng Paghahatid: ${a || "Hindi ibinigay"}

I-track dito: https://atlas-global-shippings.web.app/track.html?id=${t}

Para sa karagdagang katanungan, makipag-ugnayan sa Atlas Global Shipping Team.
`,
      id: (n, s, t, d, a) => `
Yth. ${n},

Status paket Anda sekarang: ${s}
Nomor pelacakan: ${t}
Tujuan: ${d || "Tidak tersedia"}
Alamat pengiriman: ${a || "Tidak tersedia"}

Lacak di sini: https://atlas-global-shippings.web.app/track.html?id=${t}

Untuk pertanyaan lebih lanjut, silakan hubungi Tim Atlas Global Shipping.
`,
      hi: (n, s, t, d, a) => `
प्रिय ${n},

आपके पैकेज की स्थिति अब है: ${s}
ट्रैकिंग नंबर: ${t}
गंतव्य: ${d || "उपलब्ध नहीं"}
वितरण पता: ${a || "उपलब्ध नहीं"}

यहाँ ट्रैक करें: https://atlas-global-shippings.web.app/track.html?id=${t}

अधिक जानकारी के लिए कृपया Atlas Global Shipping टीम से संपर्क करें।
`,
      nl: (n, s, t, d, a) => `
Beste ${n},

De status van uw pakket is nu: ${s}
Trackingnummer: ${t}
Bestemming: ${d || "Niet opgegeven"}
Bezorgadres: ${a || "Niet opgegeven"}

Volg hier: https://atlas-global-shippings.web.app/track.html?id=${t}

Voor meer vragen kunt u contact opnemen met het Atlas Global Shipping-team.
`,
      pl: (n, s, t, d, a) => `
Szanowny/a ${n},

Status Twojej paczki to teraz: ${s}
Numer śledzenia: ${t}
Miejsce docelowe: ${d || "Brak danych"}
Adres dostawy: ${a || "Brak danych"}

Śledź tutaj: https://atlas-global-shippings.web.app/track.html?id=${t}

W razie pytań skontaktuj się z zespołem Atlas Global Shipping.
`,
      sv: (n, s, t, d, a) => `
Hej ${n},

Status för ditt paket är nu: ${s}
Spårningsnummer: ${t}
Destination: ${d || "Ej angivet"}
Leveransadress: ${a || "Ej angiven"}

Spåra här: https://atlas-global-shippings.web.app/track.html?id=${t}

För fler frågor, kontakta Atlas Global Shipping-teamet.
`,
    };

    // ---------- Detect language ----------
    const detectLang = (dest) => {
      const d = (dest || "").toLowerCase();
      if (/(mexico|spain|argentina|colombia|chile|peru|venezuela|ecuador|bolivia|uruguay|paraguay|guatemala|costa rica|panama|honduras|el salvador|nicaragua|dominican|puerto rico)/.test(d)) return "es";
      if (/(brazil|portugal|angola|mozambique|guinea-bissau|cabo verde|são tomé|sao tome|timor-leste)/.test(d)) return "pt";
      if (/(france|belgium|belgique|luxembourg|luxemburg|switzerland|suisse|monaco|canada.*quebec|quebec|tunisia|morocco|algeria|senegal|ivory coast|côte d'ivoire|cote d'ivoire)/.test(d)) return "fr";
      if (/(germany|austria|switzerland|liechtenstein)/.test(d)) return "de";
      if (/(italy|san marino|vatican)/.test(d)) return "it";
      if (/thailand|bangkok|phuket/.test(d)) return "th";
      if (/korea|seoul/.test(d)) return "ko";
      if (/japan|tokyo|osaka|kyoto/.test(d)) return "ja";
      if (/china|hong kong|hongkong|taiwan|macau|shanghai|beijing/.test(d)) return "zh";
      if (/vietnam|hanoi|ho chi minh|saigon/.test(d)) return "vi";
      if (/malaysia|kuala lumpur|sabah|sarawak/.test(d)) return "ms";
      if (/philippine|philippines|manila|cebu|davao/.test(d)) return "tl";
      if (/indonesia|jakarta|bali|surabaya|bandung/.test(d)) return "id";
      if (/india|delhi|mumbai|bangalore|bengaluru|kolkata|chennai|hyderabad/.test(d)) return "hi";
      if (/netherlands|holland|amsterdam|rotterdam|the hague|den haag|utrecht/.test(d)) return "nl";
      if (/poland|warsaw|warszawa|krakow|kraków|wroclaw|wrocław/.test(d)) return "pl";
      if (/sweden|stockholm|gothenburg|göteborg|malmö/.test(d)) return "sv";
      return "en";
    };

    const lang = detectLang(destination);
    const build = messages[lang] || messages.en;
    const text = build(recipientName, status, trackingNumber, destination, cleanHouseAddress);

    // ---------- Nodemailer ----------
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });

    await transporter.sendMail({
      from: `Atlas Global Shipping <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
    });

    return res.status(200).json({ message: "Email sent successfully", langUsed: lang });

  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}