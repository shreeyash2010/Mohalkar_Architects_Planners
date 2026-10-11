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

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');

function saveToCRM(enquiry) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let enquiries = [];
    if (fs.existsSync(ENQUIRIES_FILE)) {
      try {
        enquiries = JSON.parse(fs.readFileSync(ENQUIRIES_FILE, 'utf-8')) || [];
      } catch (e) {
        enquiries = [];
      }
    }
    const record = {
      id: 'enq-' + Date.now(),
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      location: enquiry.location,
      type: enquiry.type || 'Not specified',
      budget: enquiry.budget || 'Not specified',
      source: enquiry.source || 'Website',
      message: enquiry.message,
      status: 'new',
      timestamp: new Date().toISOString()
    };
    enquiries.unshift(record);
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2));

    // Log activity
    let activity = [];
    if (fs.existsSync(ACTIVITY_FILE)) {
      try {
        activity = JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf-8')) || [];
      } catch (e) {
        activity = [];
      }
    }
    activity.unshift({
      id: 'act-' + Date.now(),
      action: 'New Lead Inflow',
      details: `Received enquiry from ${record.name} (${record.location}) for ${record.type}`,
      user: 'Web Client',
      timestamp: record.timestamp,
      badge: 'gold'
    });
    fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(activity.slice(0, 50), null, 2));
    return record;
  } catch (err) {
    console.error('Error saving enquiry to CRM:', err);
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, location, type, budget, source, message } = req.body || {};
    if (!name || !email || !phone || !location || !message) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const enquiry = { name, email, phone, location, type, budget, source, message };
    const savedRecord = saveToCRM(enquiry);

    const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missing = requiredEnv.filter((key) => !process.env[key]);
    
    // If SMTP is not fully configured, record is still safely saved in CRM
    if (missing.length) {
      console.warn(`SMTP credentials not set (${missing.join(', ')}). Enquiry saved to CRM database.`);
      return res.status(200).json({ 
        success: true, 
        saved: true, 
        message: 'Enquiry received and saved to CRM.',
        data: savedRecord 
      });
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

    const workbookBuffer = createWorkbookBuffer(enquiry);

    const textBody =
`New enquiry received from website.

Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${location}
Project Type: ${type || 'Not specified'}
Budget: ${budget || 'Not specified'}

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

    return res.status(200).json({ success: true, saved: true, data: savedRecord });
  } catch (error) {
    console.error('Send enquiry error:', error);
    return res.status(500).json({ error: 'Unable to process enquiry email right now.' });
  }
};
