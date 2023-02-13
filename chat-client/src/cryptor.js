import { AES, enc } from 'crypto-js'

export const encrypt = (ciphertext) => {
    if (ciphertext !== null) {
        const encrypted = AES.encrypt(JSON.stringify(ciphertext), 'secret key 123').toString()
        return encrypted
    }
}

export const decrypt = (ciphertext) => {
    if (ciphertext !== null) {
        const decrypted = AES.decrypt(ciphertext, 'secret key 123').toString(enc.Utf8)
        return decrypted
    }
}