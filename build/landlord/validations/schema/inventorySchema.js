"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventorySchema = void 0;
const joi_1 = __importDefault(require("joi"));
const InventorySchemaType = ['UNAVIALABLE', 'AVAILABLE', 'UNDER_MAINTANACE'];
const inventorySchema = joi_1.default.object({
    itemName: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    quantity: joi_1.default.number().required(),
    itemLocation: joi_1.default.string().required(),
    status: joi_1.default.string().valid(...InventorySchemaType).required(),
    propertyId: joi_1.default.string().required()
});
exports.inventorySchema = inventorySchema;
