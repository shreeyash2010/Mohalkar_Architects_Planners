const nodemailer = require('nodemailer');
const XLSX = require('xlsx');

function createWorkbookBuffer(enquiry) {
  const row = [{
    Timestamp: new Date().toISOString(),
    Name: enquiry.name,
    Email: enquiry.email,
    Phone: enquiry.phone,
    Location: enquiry.location,
    ProjectType: enquiry.type || 'Not specified',
    ProjectDetails: enquiry.message
  }];

  const worksheet = XLSX.utils.json_to_sheet(row);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiry');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, location, type, message } = req.body || {};
    if (!name || !email || !phone || !location || !message) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missing = requiredEnv.filter((key) => !process.env[key]);
    if (missing.length) {
      return res.status(500).json({ error: `Missing environment variables: ${missing.join(', ')}` });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const enquiry = { name, email, phone, location, type, message };
    const workbookBuffer = createWorkbookBuffer(enquiry);

    const textBody =
`New enquiry received from website.

Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${location}
Project Type: ${type || 'Not specified'}

Project Details:
${message}
`;

    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'abhimohalkar.designstudio@gmail.com';
    const toEmail = process.env.TO_EMAIL || 'mohalkararchitectsandplanners@gmail.com';

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `New Enquiry from ${name}`,
      text: textBody,
      attachments: [
        {
          filename: `enquiry-${Date.now()}.xlsx`,
          content: workbookBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ]
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to send enquiry email right now.' });
  }
};
