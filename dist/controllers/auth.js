"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = require("bcrypt");
// custom libs
const Jtoken_1 = require("../middlewares/Jtoken");
const secrets_1 = require("../secrets");
const user_services_1 = __importDefault(require("../services/user.services"));
const verification_token_service_1 = require("../services/verification_token.service");
// import { SignUpIF } from "../interfaces/authInt";
// import { GoogleService } from "../middlewares/google";
const email_1 = __importDefault(require("../templates/email"));
const emailer_1 = __importDefault(require("../utils/emailer"));
const helpers_1 = require("../utils/helpers");
const error_service_1 = __importDefault(require("../services/error.service"));
const auth_1 = require("../validations/schemas/auth");
class AuthControls {
    // protected googleService: GoogleService;
    constructor() {
        this.verificationTokenCreator = (userId, email) => __awaiter(this, void 0, void 0, function* () {
            const token = yield (0, verification_token_service_1.createVerificationToken)(userId, helpers_1.generateOtp);
            (0, emailer_1.default)(email, "EMAIL VERIFICATION", (0, email_1.default)(token));
        });
        this.register = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                let user = yield user_services_1.default.findUserByEmail(email);
                if (user)
                    return res.status(400).json({ message: "user exists" });
                let newUser = yield user_services_1.default.createUser(req.body);
                // Create verification token
                yield this.verificationTokenCreator(newUser.id, email);
                // const serializedUser = serializeBigInt(user);
                return res.status(201).json({ message: "User registered successfully, check your email for verification code", user: newUser });
            }
            catch (error) {
                if (error instanceof Error) {
                    console.log(error);
                    return res.status(400).json({ message: error });
                }
                else {
                    return res.status(500).json({ message: "An unknown error occurred" });
                }
            }
        });
        this.confirmation = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, token } = req.body;
            try {
                // Find user by email
                const user = yield user_services_1.default.findUserByEmail(email);
                if (!user) {
                    res.status(404).json({ message: 'User not found' });
                    return;
                }
                // Validate verification token
                const isValidToken = yield (0, verification_token_service_1.validateVerificationToken)(token, user.id);
                if (!isValidToken) {
                    res.status(400).json({ message: 'Invalid or expired token' });
                    return;
                }
                // Update user's isVerified status to true
                const updatedUser = yield user_services_1.default.updateUserVerificationStatus(user.id, true);
                const tokenRet = yield (0, verification_token_service_1.getTokensByUserId)(user.id, token);
                yield (0, verification_token_service_1.deleteVerificationToken)(Number(tokenRet.id));
                const userResponse = updatedUser;
                const { password } = userResponse, userWithoutId = __rest(userResponse, ["password"]);
                res.status(200).json({ message: 'User verified successfully', user: userWithoutId });
            }
            catch (error) {
                console.error('Error verifying user:', error);
                res.status(500).json({ message: 'Failed to verify user' });
            }
        });
        this.sendPasswordResetCode = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                const user = yield user_services_1.default.findUserByEmail(email);
                if (!user)
                    res.status(400).json({ message: "user does exists" });
                // Ensure user is not null
                if (user && typeof user !== 'boolean' && 'id' in user) {
                    // Create verification token
                    yield this.verificationTokenCreator(user.id, email);
                }
                return res.status(201).json({ message: "password reset code sent, check your email for verification code" });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.passwordReset = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, newPassword, token } = req.body;
            try {
                let user = yield user_services_1.default.findUserByEmail(email);
                if (!user)
                    return res.status(400).json({ message: "user doesnt exists" });
                // Validate verification token
                let isValidToken = null;
                if (user) {
                    isValidToken = yield (0, verification_token_service_1.validateVerificationToken)(token, user.id);
                }
                if (!isValidToken) {
                    res.status(400).json({ message: 'Invalid or expired token' });
                    return;
                }
                // Ensure user is not null
                if (user && typeof user !== 'boolean' && 'id' in user)
                    // Update user's password
                    yield user_services_1.default.updateUserPassword(user.id, newPassword);
                return res.status(200).json({ message: 'Password Updated successfully' });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                const { error } = auth_1.LoginSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({ error: error.details[0].message });
                }
                let user = yield user_services_1.default.findUserByEmail(email);
                if (!user) {
                    return res.status(400).json({ message: "User does not exist" });
                }
                if (!(0, bcrypt_1.compareSync)(req.body.password, user.password)) {
                    return res.status(400).json({ message: "Invalid login credentials" });
                }
                if (!user.isVerified) {
                    yield this.verificationTokenCreator(user.id, email);
                    return res.status(400).json({ message: "Account not verified, a verification code was sent to your email" });
                }
                const token = yield this.tokenService.createToken({ id: user.id, role: String(user.role), email: String(user.email) });
                const { password, id } = user, userDetails = __rest(user, ["password", "id"]);
                return res.status(200).json({ message: "User logged in successfully", token, userDetails });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.registerTenant = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { tenantId, password } = req.body;
                if (!tenantId && !password)
                    return res.status(500).json({ message: "No tenant Id or password found" });
                const otp = yield (0, verification_token_service_1.createVerificationToken)(tenantId, helpers_1.generateOtp);
                // send the email
                console.log(otp);
                return res.status(200).json({ message: "Email sent successfully" });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.tokenService = new Jtoken_1.Jtoken(secrets_1.JWT_SECRET);
        // this.googleService = new GoogleService()
    }
}
exports.default = new AuthControls();
