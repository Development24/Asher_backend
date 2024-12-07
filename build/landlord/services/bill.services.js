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
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const helpers_1 = require("../../utils/helpers");
class BillService {
    constructor() { }
    createBill(billData, landlordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const billId = (0, helpers_1.generateIDs)('BILL');
            return __1.prismaClient.bills.create({
                data: Object.assign({ landlordId,
                    billId, description: `Created ${billData.billName}` }, billData),
            });
        });
    }
    createTenantBill(billData, landlordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const billId = (0, helpers_1.generateIDs)('BILL');
            return __1.prismaClient.bills.create({
                data: Object.assign({ landlordId,
                    billId, description: `Created ${billData.billName}` }, billData),
            });
        });
    }
    getAllBills(landlordId) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.prismaClient.bills.findMany({
                where: {
                    landlordId
                },
            });
        });
    }
    getBillById(billId, landlordId) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.prismaClient.bills.findUnique({
                where: { id: billId, landlordId },
            });
        });
    }
    updateBill(billId, billData, landlordId) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.prismaClient.bills.update({
                where: { id: billId, landlordId },
                data: billData,
            });
        });
    }
    deleteBill(billId, landlordId) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.prismaClient.bills.delete({
                where: { id: billId, landlordId },
            });
        });
    }
    getBillByPropertyId(propertyId, landlordId) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.prismaClient.bills.findMany({
                where: {
                    propertyId,
                    landlordId
                },
            });
        });
    }
}
exports.default = new BillService();
