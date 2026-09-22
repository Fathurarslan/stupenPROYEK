import type { IsiToken } from "./utils/token.js";

// Menambahkan req.admin, diisi oleh middleware wajibLogin
declare global {
    namespace Express {
        interface Request {
            admin?: IsiToken;
        }
    }
}
