const  JWT_SECRET= '7c.zKYAL%*PDS6CMiPxU3*Zr+,tZH*';
const RESET_CODE_EXPIRATION_MINUTES = 30;
const emailConfig = {
    EMAIL_SENDER: 'bacayadiv45@gmail.com    ',
    APP_PASSWORD: 'uuvt txct wasn jhjd',
};
module.exports = { useTestDatabase: process.env.NODE_ENV === 'test',JWT_SECRET,RESET_CODE_EXPIRATION_MINUTES ,emailConfig };
