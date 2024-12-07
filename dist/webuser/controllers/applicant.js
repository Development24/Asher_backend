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
const applicantService_1 = __importDefault(require("../services/applicantService"));
const propertyServices_1 = __importDefault(require("../../services/propertyServices"));
const schemas_1 = require("../schemas");
const error_service_1 = __importDefault(require("../../services/error.service"));
const client_1 = require("@prisma/client");
class ApplicantControls {
    constructor() {
        this.getPendingApplications = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(403).json({ error: 'kindly login as applicant' });
                }
                const pendingApplications = yield applicantService_1.default.getApplicationBasedOnStatus(userId, client_1.ApplicationStatus.PENDING);
                res.status(200).json({ pendingApplications });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.completeApplication = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const applicationId = req.params.applicationId;
                if (!applicationId) {
                    return res.status(400).json({ error: 'Application ID is required' });
                }
                // check for the existance of application before proceeding
                const applicationExist = yield applicantService_1.default.getApplicationById(applicationId);
                if (!applicationExist)
                    return res.status(500).json({ message: "Application Doesn't Exist" });
                const application = yield applicantService_1.default.updateApplicationStatus(applicationId, client_1.ApplicationStatus.COMPLETED);
                res.status(200).json(application);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.createOrUpdateApplicantBioData = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = String(req.user.id);
                const propertiesId = req.params.propertiesId;
                // check for property existance
                const propertyExist = yield propertyServices_1.default.getPropertiesById(propertiesId);
                if (!propertyExist)
                    return res.status(404).json({ message: `property with the id : ${propertiesId} doesn't exist` });
                const { error } = schemas_1.applicantPersonalDetailsSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({ error: error.details[0].message });
                }
                const application = yield applicantService_1.default.createOrUpdatePersonalDetails(Object.assign(Object.assign({}, req.body), { userId }), propertiesId, userId);
                return res.status(201).json({ application });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.createOrUpdateGuarantor = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const applicationId = req.params.applicationId;
                const { error } = schemas_1.guarantorInformationSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({ error: error.details[0].message });
                }
                const existingApplication = yield applicantService_1.default.checkApplicationExistance(applicationId);
                if (!existingApplication) {
                    return res.status(400).json({ error: "wrong application id supplied" });
                }
                const isCompletd = yield applicantService_1.default.checkApplicationCompleted(applicationId);
                if (isCompletd) {
                    return res.status(400).json({ error: "application completed" });
                }
                const application = yield applicantService_1.default.createOrUpdateGuarantor(Object.assign(Object.assign({}, req.body), { applicationId }));
                return res.status(201).json({ application });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.createOrUpdateEmergencyContact = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const applicationId = req.params.applicationId;
                const existingApplication = yield applicantService_1.default.checkApplicationExistance(applicationId);
                if (!existingApplication) {
                    return res.status(400).json({ error: "wrong application id supplied" });
                }
                const isCompletd = yield applicantService_1.default.checkApplicationCompleted(applicationId);
                if (isCompletd) {
                    return res.status(400).json({ error: "application completed" });
                }
                const { error } = schemas_1.emergencyContactSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({ error: error.details[0].message });
                }
                const application = yield applicantService_1.default.createOrUpdateEmergencyContact(Object.assign(Object.assign({}, req.body), { applicationId }));
                return res.status(201).json({ application });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.createApplicantionDocument = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { error, value } = schemas_1.documentSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({ error: error.details[0].message });
                }
                const applicationId = req.params.applicationId;
                const { cloudinaryUrls, cloudinaryVideoUrls, cloudinaryDocumentUrls } = value;
                // Check if all three URLs are empty
                if (!cloudinaryUrls && !cloudinaryVideoUrls && !cloudinaryDocumentUrls) {
                    // Prompt the user for the document URL if all are empty
                    return res.status(400).json({
                        message: "Please provide a document URL. Either cloudinaryUrls, cloudinaryVideoUrls, or cloudinaryDocumentUrls must be supplied."
                    });
                }
                // Proceed with the rest of your logic
                const documentUrl = cloudinaryUrls || cloudinaryVideoUrls || cloudinaryDocumentUrls;
                delete value['cloudinaryUrls'];
                delete value['cloudinaryVideoUrls'];
                delete value['cloudinaryDocumentUrls'];
                const existingApplication = yield applicantService_1.default.checkApplicationExistance(applicationId);
                if (!existingApplication) {
                    return res.status(400).json({ error: "wrong application id supplied" });
                }
                const isCompletd = yield applicantService_1.default.checkApplicationCompleted(applicationId);
                if (isCompletd) {
                    return res.status(400).json({ error: "application completed" });
                }
                const application = yield applicantService_1.default.createOrUpdateApplicationDoc(Object.assign(Object.assign({}, value), { documentUrl: documentUrl[0], applicationId }));
                return res.status(201).json({ application });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.createOrUpdateResidentialInformation = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = schemas_1.residentialInformationSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({ error: error.details[0].message });
                }
                const applicationId = req.params.applicationId;
                const data = req.body;
                const existingApplication = yield applicantService_1.default.checkApplicationExistance(applicationId);
                if (!existingApplication) {
                    return res.status(400).json({ error: "wrong application id supplied" });
                }
                const isCompletd = yield applicantService_1.default.checkApplicationCompleted(applicationId);
                if (isCompletd) {
                    return res.status(400).json({ error: "application completed" });
                }
                const result = yield applicantService_1.default.createOrUpdateResidentialInformation(Object.assign(Object.assign({}, data), { applicationId }));
                res.status(200).json(result);
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
        this.createOrUpdateEmploymentInformation = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate request body
                const { error } = schemas_1.employmentInformationSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({ error: error.details[0].message });
                }
                const applicationId = req.params.applicationId;
                const data = req.body;
                const existingApplication = yield applicantService_1.default.checkApplicationExistance(applicationId);
                if (!existingApplication) {
                    return res.status(400).json({ error: "wrong application id supplied" });
                }
                const isCompletd = yield applicantService_1.default.checkApplicationCompleted(applicationId);
                if (isCompletd) {
                    return res.status(400).json({ error: "application completed" });
                }
                const employmentInformation = yield applicantService_1.default.createOrUpdateEmploymentInformation(Object.assign(Object.assign({}, data), { applicationId }));
                return res.status(200).json(employmentInformation);
            }
            catch (err) {
                error_service_1.default.handleError(err, res);
            }
        });
        this.getApplication = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const application = yield applicantService_1.default.getApplicationById(id);
                if (!application) {
                    return res.status(404).json({ error: 'Application not found' });
                }
                return res.status(200).json({ application });
            }
            catch (err) {
                error_service_1.default.handleError(err, res);
            }
        });
        this.deleteApplicant = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const applicant = yield applicantService_1.default.deleteApplicant(id);
                return res.status(200).json({ applicant });
            }
            catch (error) {
                error_service_1.default.handleError(error, res);
            }
        });
    }
}
exports.default = new ApplicantControls();