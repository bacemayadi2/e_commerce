const  JWT_SECRET= '7c.zKYAL%*PDS6CMiPxU3*Zr+,tZH*';
const RESET_CODE_EXPIRATION_MINUTES = 30;
const emailConfig = {
    EMAIL_SENDER: 'ayadibacem@gmail.com',
    APP_PASSWORD: 'zzfi lejj dgrl cgka',
};
module.exports = { useTestDatabase: process.env.NODE_ENV === 'test',JWT_SECRET,RESET_CODE_EXPIRATION_MINUTES ,emailConfig };
