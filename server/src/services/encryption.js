const crypto = require("crypto");
var config = require('../../config');
const key = config.encryption.key;
const iv = config.encryption.iv;

class EncryptionService {
    constructor(){}
    encrypt(plainText) {
        try {
            if (config.encryption.enabled) {
                let cipher = crypto.createCipheriv(config.encryption.algorithm, key, iv.toString("hex").slice(0, 16));
                let encrypted = cipher.update(plainText);
                encrypted = Buffer.concat([encrypted, cipher.final()]);
                return encrypted.toString("hex");
            }
            else {
                return plainText;
            }
        } catch (error) {
            return plainText;
        }
        
    }
    decrypt(cipherText) {
        try {
            if (config.encryption.enabled) {
                let encryptedText = Buffer.from(cipherText, "hex");
                let decipher = crypto.createDecipheriv(config.encryption.algorithm, key, iv.toString("hex").slice(0, 16));
                let decrypted = decipher.update(encryptedText);
                decrypted = Buffer.concat([decrypted, decipher.final()]);
                return decrypted.toString();
            }
            else {
                return cipherText;
            }
        } catch (error) {
            return cipherText;
        }
      
    }
}
module.exports.EncryptionService = EncryptionService
