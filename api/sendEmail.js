import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end(); // Preflight
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      to,
      recipientName = "Customer",
      subject = "Package Status Updated",
      status,
      trackingNumber,
      destination,
      houseAddress = "Not provided",
    } = req.body;

    if (!to || !status || !trackingNumber || !destination) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Language map
    const messages = {
      en: (name, status, trackingNumber, houseAddress) => `
Dear ${name},

Your package status is now: ${status}
Tracking Number: ${trackingNumber}
Delivery Address: ${houseAddress}

Track here: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

For more inquiries, contact Atlas Global Shipping Team.
`,
      es: (name, status, trackingNumber, houseAddress) => `
Estimado/a ${name},

El estado de su paquete ahora es: ${status}
Número de seguimiento: ${trackingNumber}
Dirección de entrega: ${houseAddress}

Rastree aquí: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

Para más consultas, contacte al equipo de Atlas Global Shipping.
`,
      pt: (name, status, trackingNumber, houseAddress) => `
Caro(a) ${name},

O status do seu pacote agora é: ${status}
Número de rastreamento: ${trackingNumber}
Endereço de entrega: ${houseAddress}

Acompanhe aqui: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

Para mais informações, entre em contato com a equipe da Atlas Global Shipping.
`,
      fr: (name, status, trackingNumber, houseAddress) => `
Cher/Chère ${name},

Le statut de votre colis est maintenant : ${status}
Numéro de suivi : ${trackingNumber}
Adresse de livraison : ${houseAddress}

Suivez-le ici : https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

Pour plus d'informations, contactez l'équipe Atlas Global Shipping.
`,
      de: (name, status, trackingNumber, houseAddress) => `
Sehr geehrte/r ${name},

Der Status Ihres Pakets ist jetzt: ${status}
Sendungsnummer: ${trackingNumber}
Lieferadresse: ${houseAddress}

Verfolgen Sie es hier: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

Für weitere Anfragen kontaktieren Sie bitte das Atlas Global Shipping Team.
`,
      it: (name, status, trackingNumber, houseAddress) => `
Gentile ${name},

Lo stato del suo pacco è ora: ${status}
Numero di tracciamento: ${trackingNumber}
Indirizzo di consegna: ${houseAddress}

Traccia qui: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

Per ulteriori informazioni, contatta il team di Atlas Global Shipping.
`,
      th: (name, status, trackingNumber, houseAddress) => `
เรียน ${name},

สถานะพัสดุของคุณตอนนี้คือ: ${status}
หมายเลขติดตาม: ${trackingNumber}
ที่อยู่จัดส่ง: ${houseAddress}

ติดตามได้ที่: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

หากต้องการสอบถามเพิ่มเติม กรุณาติดต่อทีม Atlas Global Shipping
`,
      ko: (name, status, trackingNumber, houseAddress) => `
${name} 님께,

고객님의 배송 상태는 현재: ${status}
운송장 번호: ${trackingNumber}
배송 주소: ${houseAddress}

여기에서 추적하세요: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

추가 문의는 Atlas Global Shipping 팀에 연락해 주시기 바랍니다.
`,
      ja: (name, status, trackingNumber, houseAddress) => `
${name} 様

お荷物の状況は現在: ${status}
追跡番号: ${trackingNumber}
お届け先住所: ${houseAddress}

こちらから追跡できます: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

ご不明な点がございましたら、Atlas Global Shipping チームまでお問い合わせください。
`,
      zh: (name, status, trackingNumber, houseAddress) => `
尊敬的 ${name},

您的包裹状态现在是: ${status}
追踪号码: ${trackingNumber}
收货地址: ${houseAddress}

在此跟踪: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

如需更多信息，请联系 Atlas Global Shipping 团队。
`,
      vi: (name, status, trackingNumber, houseAddress) => `
Kính gửi ${name},

Tình trạng gói hàng của bạn hiện tại: ${status}
Mã vận đơn: ${trackingNumber}
Địa chỉ giao hàng: ${houseAddress}

Theo dõi tại đây: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

Mọi thắc mắc vui lòng liên hệ nhóm Atlas Global Shipping.
`,
      ms: (name, status, trackingNumber, houseAddress) => `
Yang dihormati ${name},

Status bungkusan anda kini: ${status}
Nombor penjejakan: ${trackingNumber}
Alamat penghantaran: ${houseAddress}

Jejaki di sini: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

Untuk maklumat lanjut, sila hubungi pasukan Atlas Global Shipping.
`,
      tl: (name, status, trackingNumber, houseAddress) => `
Mahal na ${name},

Ang status ng iyong package ay ngayon: ${status}
Tracking Number: ${trackingNumber}
Delivery Address: ${houseAddress}

I-track dito: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

Para sa karagdagang katanungan, makipag-ugnayan sa Atlas Global Shipping Team.
`,
    };

    // Destination → Language detection
    const destinationLower = destination.toLowerCase();
    let lang = "en";
    if (destinationLower.includes("mexico") || destinationLower.includes("spain")) lang = "es";
    else if (destinationLower.includes("brazil") || destinationLower.includes("portugal")) lang = "pt";
    else if (destinationLower.includes("france")) lang = "fr";
    else if (destinationLower.includes("germany")) lang = "de";
    else if (destinationLower.includes("italy")) lang = "it";
    else if (destinationLower.includes("thailand")) lang = "th";
    else if (destinationLower.includes("korea")) lang = "ko";
    else if (destinationLower.includes("japan")) lang = "ja";
    else if (destinationLower.includes("china")) lang = "zh";
    else if (destinationLower.includes("vietnam")) lang = "vi";
    else if (destinationLower.includes("malaysia")) lang = "ms";
    else if (destinationLower.includes("philippine")) lang = "tl";

    const text = messages[lang](recipientName, status, trackingNumber, houseAddress);

    // Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
    });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}