import crypto from "crypto";
import repo from "../repositories/user.repository";
import sessionRepo from "../repositories/session.repository";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../utils/jwt";
import { validateUser } from "../utils/validator";
import { hashPassword, comparePassword } from "../utils/hashPassword";

class AuthService {

    async register(payload: any) {
        validateUser(payload);

        const existing = await repo.findByEmail(payload.email);
        if (existing) {
            throw new Error("Email is already registered");
        }

        payload.password = await hashPassword(payload.password);

        return await repo.create(payload);
    }

    async login(email: string, password: string) {

        const user = await repo.findByEmail(email.trim().toLowerCase());

        if (!user) {
            throw new Error("Invalid email or password");
        }

        console.log(password);
        console.log(user.password)
        const passwordMatch = await comparePassword(password, user.password);

        if (!passwordMatch) {
            throw new Error("Invalid email or password");
        }
        const payload = {
            user_code: user.userCode,
            user_type: user.userType,
            business_code: user.businessCode,
            organization_code: user.organizationCode,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await sessionRepo.create(user.userCode, refreshToken);

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
            user_code: user.userCode,
            user_type: user.userType,
            business_code: user.businessCode,
            organization_code: user.organizationCode,
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