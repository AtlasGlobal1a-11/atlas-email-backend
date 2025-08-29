import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Allow CORS for mobile + desktop
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      to,
      subject = "Package Status Updated",
      status,
      trackingNumber,
      recipientName,
      country
    } = req.body;

    if (!to || !status || !trackingNumber || !recipientName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // --- Translation Templates for 15 languages ---
    const emailTexts = {
      en: {
        greeting: (name) => `Dear ${name},`,
        intro: "We are pleased to provide you with the latest update on your package.",
        status: (status) => `Your package status is now: ${status}`,
        track: (trackingNumber) => `Track your package here: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "Thank you for choosing Atlas Global Shipping. We remain at your service for any inquiries.",
        closing: "Best regards,\nAtlas Global Shipping Team"
      },
      fr: {
        greeting: (name) => `Cher/Chère ${name},`,
        intro: "Nous sommes heureux de vous fournir la dernière mise à jour concernant votre colis.",
        status: (status) => `Le statut de votre colis est maintenant : ${status}`,
        track: (trackingNumber) => `Suivez votre colis ici : https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "Merci d'avoir choisi Atlas Global Shipping. Nous restons à votre disposition pour toute question.",
        closing: "Cordialement,\nÉquipe Atlas Global Shipping"
      },
      es: {
        greeting: (name) => `Estimado/a ${name},`,
        intro: "Nos complace informarle la última actualización de su paquete.",
        status: (status) => `El estado de su paquete es: ${status}`,
        track: (trackingNumber) => `Rastree su paquete aquí: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "Gracias por elegir Atlas Global Shipping. Estamos a su disposición para cualquier consulta.",
        closing: "Atentamente,\nEquipo de Atlas Global Shipping"
      },
      pt: {
        greeting: (name) => `Caro(a) ${name},`,
        intro: "Temos o prazer de fornecer a atualização mais recente do seu pacote.",
        status: (status) => `O status do seu pacote é: ${status}`,
        track: (trackingNumber) => `Acompanhe seu pacote aqui: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "Obrigado por escolher a Atlas Global Shipping. Estamos à disposição para quaisquer dúvidas.",
        closing: "Atenciosamente,\nEquipe Atlas Global Shipping"
      },
      de: {
        greeting: (name) => `Sehr geehrte/r ${name},`,
        intro: "Wir freuen uns, Ihnen das neueste Update zu Ihrem Paket mitzuteilen.",
        status: (status) => `Der aktuelle Status Ihres Pakets: ${status}`,
        track: (trackingNumber) => `Verfolgen Sie Ihr Paket hier: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "Vielen Dank, dass Sie Atlas Global Shipping gewählt haben. Für Fragen stehen wir Ihnen gerne zur Verfügung.",
        closing: "Mit freundlichen Grüßen,\nAtlas Global Shipping Team"
      },
      it: {
        greeting: (name) => `Gentile ${name},`,
        intro: "Siamo lieti di fornirle l'ultimo aggiornamento sul suo pacco.",
        status: (status) => `Lo stato del suo pacco è: ${status}`,
        track: (trackingNumber) => `Tracci il suo pacco qui: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "Grazie per aver scelto Atlas Global Shipping. Siamo sempre a sua disposizione per qualsiasi domanda.",
        closing: "Cordiali saluti,\nTeam Atlas Global Shipping"
      },
      th: {
        greeting: (name) => `เรียนคุณ ${name},`,
        intro: "เรามีความยินดีที่จะแจ้งให้คุณทราบความเคลื่อนไหวล่าสุดของพัสดุของคุณ",
        status: (status) => `สถานะพัสดุของคุณตอนนี้: ${status}`,
        track: (trackingNumber) => `ติดตามพัสดุของคุณได้ที่นี่: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "ขอบคุณที่เลือกใช้บริการ Atlas Global Shipping เรายินดีให้บริการคุณเสมอ",
        closing: "ด้วยความเคารพ,\nทีมงาน Atlas Global Shipping"
      },
      ko: {
        greeting: (name) => `${name}님께,`,
        intro: "귀하의 소포에 대한 최신 업데이트를 알려드립니다.",
        status: (status) => `귀하의 소포 상태: ${status}`,
        track: (trackingNumber) => `소포를 추적하려면 여기를 클릭하세요: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "Atlas Global Shipping을 이용해 주셔서 감사합니다. 문의 사항이 있으시면 언제든지 연락주세요.",
        closing: "감사합니다,\nAtlas Global Shipping 팀"
      },
      ja: {
        greeting: (name) => `${name}様,`,
        intro: "お客様の荷物の最新状況をご案内いたします。",
        status: (status) => `現在の荷物の状況: ${status}`,
        track: (trackingNumber) => `荷物の追跡はこちら: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "Atlas Global Shippingをご利用いただきありがとうございます。ご不明点があればお問い合わせください。",
        closing: "敬具,\nAtlas Global Shipping チーム"
      },
      zh: {
        greeting: (name) => `尊敬的${name},`,
        intro: "我们很高兴为您提供包裹的最新状态更新。",
        status: (status) => `您的包裹当前状态: ${status}`,
        track: (trackingNumber) => `点击此处跟踪您的包裹: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "感谢您选择 Atlas Global Shipping。如有任何疑问，请随时联系我们。",
        closing: "此致,\nAtlas Global Shipping 团队"
      },
      vi: {
        greeting: (name) => `Kính gửi ${name},`,
        intro: "Chúng tôi vui mừng thông báo cập nhật mới nhất về bưu kiện của bạn.",
        status: (status) => `Tình trạng bưu kiện của bạn hiện tại: ${status}`,
        track: (trackingNumber) => `Theo dõi bưu kiện của bạn tại đây: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "Cảm ơn bạn đã chọn Atlas Global Shipping. Chúng tôi luôn sẵn sàng hỗ trợ bạn.",
        closing: "Trân trọng,\nĐội ngũ Atlas Global Shipping"
      },
      tl: {
        greeting: (name) => `Mahal na ${name},`,
        intro: "Ikinalulugod naming ipaalam ang pinakabagong update tungkol sa iyong package.",
        status: (status) => `Ang status ng iyong package ay: ${status}`,
        track: (trackingNumber) => `Subaybayan ang iyong package dito: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "Salamat sa pagpili ng Atlas Global Shipping. Kami ay laging handang tumulong sa anumang katanungan.",
        closing: "Lubos na gumagalang,\nAtlas Global Shipping Team"
      },
      my: {
        greeting: (name) => `Yang dihormati ${name},`,
        intro: "Kami gembira untuk memberikan kemas kini terkini tentang pakej anda.",
        status: (status) => `Status pakej anda sekarang: ${status}`,
        track: (trackingNumber) => `Jejak pakej anda di sini: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`,
        thanks: "Terima kasih kerana memilih Atlas Global Shipping. Kami sentiasa sedia membantu anda.",
        closing: "Salam hormat,\nPasukan Atlas Global Shipping"
      }
    };

    // Map country to language, default English
    const countryLangMap = {
      "France": "fr",
      "Spain": "es",
      "Portugal": "pt",
      "Germany": "de",
      "Italy": "it",
      "Thailand": "th",
      "Korea": "ko",
      "Japan": "ja",
      "China": "zh",
      "Vietnam": "vi",
      "Philippines": "tl",
      "Malaysia": "my"
    };

    const lang = countryLangMap[country] || "en";
    const template = emailTexts[lang];

    const emailBody = `
${template.greeting(recipientName)}

${template.intro}
${template.status(status)}
${template.track(trackingNumber)}

${template.thanks}
${template.closing}
`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text: emailBody
    });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}