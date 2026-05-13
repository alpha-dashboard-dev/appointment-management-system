import repo from "../repositories/user.repository";
import sessionRepo from "../repositories/session.repository";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../utils/jwt";
import { validateUser } from "../utils/validator";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import {generateCode} from "../utils/codeGenerator";

class AuthService {

    async register(payload: any) {
        validateUser(payload);

        const existing = await repo.findByEmail(payload.email);
        if (existing) {
            throw new Error("Email is already registered");
        }
        const user_code = generateCode();

        const hashedPassword = await hashPassword(payload.password);

        const userData = {
            user_code,
            organization_code: payload.organization_code,
            business_code: payload.business_code || null,
            user_type: payload.user_type,
            email: payload.email.trim().toLowerCase(),
            password: hashedPassword,
            is_active: payload.is_active,
            name: payload.name || null,
            phone: payload.phone || null,
        };

        return await repo.create(userData);
    }

    async login(email: string, password: string) {

        const user = await repo.findByEmail(email.trim().toLowerCase());

        if (!user) {
            throw new Error("Invalid email or password");
        }

        const passwordMatch = await comparePassword(password, user.password);

        if (!passwordMatch) {
            throw new Error("Invalid email or password");
        }
        const payload = {
            user_code: user.user_code,
            user_type: user.user_type,
            business_code: user.business_code,
            organization_code: user.organization_code,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await sessionRepo.create(user.user_code, refreshToken);

        return {
            user: payload,
            accessToken,
            refreshToken,
        };
    }

    async refresh(oldToken: string) {
        const decoded: any = verifyRefreshToken(oldToken);

        const session = await sessionRepo.findByToken(oldToken);
        if (!session) throw new Error("Invalid or expired session");

        const user = await repo.findByCode(decoded.user_code);
        if (!user) throw new Error("User not found");

        const payload = {
            user_code: user.user_code,
            user_type: user.user_type,
            business_code: user.business_code,
            organization_code: user.organization_code,
        };

        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        await sessionRepo.updateToken(session.id, newRefreshToken);

        return {
            user: payload,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    async logout(userCode: string) {
        await sessionRepo.deleteByUserCode(userCode);
        return true;
    }
}

export default new AuthService();