const google = require('googleapis');

const sendEmail = async (options) => {

  const oauth2client = new google.Auth.OAuth2Client(
    process.env.OAuth2ClientId,
    process.env.OAuth2ClientSecret,
    process.env.OAuth2ClientRedirect
  );

  oauth2client.setCredentials({
    refresh_token: process.env.refreshtoken
  });

  const gmail = new google.gmail_v1.Gmail({version: 'v1', auth: oauth2client});

  function bodyHelperFunction(to, from, subject, message) {
    const string = [
      `To: ${to}`,
      `From: ${from}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      message
    ].join('\n');

    return Buffer.from(string)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async function sendMainHttps() {
    try {
      const rawMessage = bodyHelperFunction(
        options.email,
        'compnesslife@gmail.com',
        options.subject,
        options.message
      );
      
      const res = gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: rawMessage
        }
      });
      return res.data;
    } catch(error) {
      console.log(error);
    }
  }

  const sentResponse = sendMainHttps();
  return sentResponse;
};

module.exports = sendEmail;
