import * as dotenv from 'dotenv'

dotenv.config()

export default {
  port: 1337,
  // dbUri: 'mongodb://localhost:27017/rest-api-1',
  dbUri: process.env.dbUri,
  saltWorkFactor: 10,
  accessTokenTtl: '15m',
  // accessTokenTtl: '-1',
  refreshTokenTtl: '1y',
  publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArT3nrBRimyGj+9R2NBc2
Sdj3RqhNLO11gNKhi5zoAiNcbXb3IVqiBLB1yUzzKjENfDHK2TrP6pg3o8Sal9dH
Ts8jh3B/yTTJufpYVbK/4Jcgjc9UeU5osZ6+EVOf9Hsl/sMARBbLZmuuzIV9Bymu
l4eRvOvILdEMIxbAHueA+g7nD6ja1Sux3v1D/pr4V/mrKU9edLU6fzz7VgNdwQaR
/qdmsWR2fxJqA8Zfi7C8dMbEUnVTgjALXDHpdDNcCKS0yqKDMHq7JU9LBr+9fvJX
ybqRuFNPUhHbPCno23hutowzVcAf7t/Xf/TXM5yirESPNuHUfz2Za6ELcDJubeAS
0wIDAQAB
-----END PUBLIC KEY-----`,
  privateKey: process.env.privateKey,
}
