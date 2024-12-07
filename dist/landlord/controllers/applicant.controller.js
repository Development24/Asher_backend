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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_service_1 = __importDefault(require("../../services/error.service"));
const applicantService_1 = __importDefault(require("../../webuser/services/applicantService"));
const application_services_1 = __importDefault(require("../services/application.services"));
const tenant_service_1 = __importDefault(require("../../services/tenant.service"));
const client_1 = require("@prisma/client");
const applicationInvitesSchema_1 = require("../validations/schema/applicationInvitesSchema");
const emailer_1 = __importDefault(require("../../utils/emailer"));
class ApplicationControls {
    constructor() {
        this.getApplicationStatistics = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const landlordId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.landlords) === null || _b === void 0 ? void 0 : _b.id;
                const applicationStatistics = yield applicantService_1.default.countApplicationStatsForLandlord(landlordId);
                res.status(200).json({ applicationStatistics });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.getApplicationsPending = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const landlordId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.landlords) === null || _b === void 0 ? void 0 : _b.id;
                const application = yield applicantService_1.default.getPendingApplicationsForLandlord(landlordId);
                return res.status(200).json({ application });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.getApplicationsCompleted = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const landlordId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.landlords) === null || _b === void 0 ? void 0 : _b.id;
                const application = yield applicantService_1.default.getCompletedApplications(landlordId);
                return res.status(200).json({ application });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.makeApplicationPaymentRequest = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const applicationId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.applicationId;
                const application = yield applicantService_1.default.updateApplicationStatus(applicationId, client_1.ApplicationStatus.MAKEPAYMENT);
                if (!application)
                    return res.status(400).json({ message: "application doesn't exist" });
                return res.status(200).json({ application });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.declineApplication = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const applicationId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.applicationId;
                const application = yield applicantService_1.default.updateApplicationStatus(applicationId, client_1.ApplicationStatus.DECLINED);
                if (!application)
                    return res.status(400).json({ message: "property doesn't exist" });
                return res.status(200).json({ application });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.approveApplication = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const landlordId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.landlords) === null || _b === void 0 ? void 0 : _b.id;
                const applicationId = (_c = req.params) === null || _c === void 0 ? void 0 : _c.applicationId;
                if (!req.body.email)
                    return res.status(400).json({ message: "kindly supply the new tenant email" });
                const application = yield applicantService_1.default.getApplicationById(applicationId);
                if (!application)
                    return res.status(400).json({ message: "property doesn't exist" });
                const tenant = yield applicantService_1.default.approveApplication(Object.assign(Object.assign({}, req.body), { propertyId: application.propertiesId, applicationId, password: (_d = application === null || application === void 0 ? void 0 : application.personalDetails) === null || _d === void 0 ? void 0 : _d.firstName, landlordId }));
                return res.status(200).json({ tenant });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.createInvite = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { error, value } = applicationInvitesSchema_1.createApplicationInviteSchema.validate(req.body);
                if (error)
                    return res.status(400).json({ error: error.details[0].message });
                const invitedByLandordId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.landlords) === null || _b === void 0 ? void 0 : _b.id;
                const invite = yield application_services_1.default.createInvite(Object.assign(Object.assign({}, value), { invitedByLandordId }));
                // TODO:
                // send message to the tenants
                const tenantInfor = yield tenant_service_1.default.getUserInfoByTenantId(value.tenantId);
                const htmlContent = `
                <h2>Invitation for Property Viewing</h2>
                <p>Hello,</p>
                <p>You have been invited to a property viewing. Here are the details:</p>
                <ul>
                <li><strong>Scheduled Date:</strong> ${(value === null || value === void 0 ? void 0 : value.scheduleDate) ? value === null || value === void 0 ? void 0 : value.scheduleDate : "To be determined"}</li>
                <li><strong>Status:</strong> PENDING</li>
                </ul>
                <p>Please respond to this invitation as soon as possible.</p>
            `;
                yield (0, emailer_1.default)(tenantInfor.email, "Asher Rentals Invites", htmlContent);
                return res.status(201).json({ invite });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.getInvite = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { id } = req.params;
                const invitedByLandordId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.landlords) === null || _b === void 0 ? void 0 : _b.id;
                const invite = yield application_services_1.default.getInvite(id, invitedByLandordId);
                if (!invite)
                    return res.status(404).json({ message: 'Invite not found' });
                return res.status(200).json({ invite });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.updateInvite = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { error, value } = applicationInvitesSchema_1.updateApplicationInviteSchema.validate(req.body);
                if (error)
                    return res.status(400).json({ error: error.details[0].message });
                const updatedInvite = yield application_services_1.default.updateInvite(id, value);
                return res.status(200).json({ updatedInvite });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.deleteInvite = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { id } = req.params;
                // check if the invites was created by the current landlord
                const invitedByLandordId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.landlords) === null || _b === void 0 ? void 0 : _b.id;
                const createdByLandlord = yield application_services_1.default.getInviteById(id);
                if (createdByLandlord.invitedByLandordId != invitedByLandordId)
                    return res.status(200).json({ message: "cannot delete invites not made by you" });
                const deletedInvite = yield application_services_1.default.deleteInvite(id, invitedByLandordId);
                return res.status(200).json({ deletedInvite });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
    }
}
exports.default = new ApplicationControls();