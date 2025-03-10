import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                reject("Failed to create access token");
            }
            resolve(token);
        });
    });

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.GMAIL_EMAIL,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken: accessToken as string,
        },
    });

    return transporter;
};

export const sendVerificationEmail = async (email: string, verificationToken: string) => {
    const transporter = await createTransporter();

    const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: email,
        subject: "이메일 인증을 완료해주세요",
        html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>이메일 인증</h1>
        <p>아래의 인증 코드를 입력해주세요:</p>
        <h2 style="background: #f5f5f5; padding: 10px; text-align: center;">${verificationToken}</h2>
        <p>이 코드는 30분 동안 유효합니다.</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};