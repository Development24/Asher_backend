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
const client_1 = require("@prisma/client");
const __1 = require("../..");
class TaskService {
    createTask(taskData) {
        return __awaiter(this, void 0, void 0, function* () {
            //NOTE: Check the property ID if it exist before inserting into the table
            return yield __1.prismaClient.taskManagement.create({
                data: taskData,
            });
        });
    }
    ;
    updateTask(taskId, taskData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedData = Object.assign({}, taskData);
            if (taskData.status === client_1.StatusType.COMPLETED) {
                updatedData.completed = true;
            }
            return yield __1.prismaClient.taskManagement.update({
                where: { id: taskId },
                data: updatedData,
            });
        });
    }
    deleteTask(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.taskManagement.delete({
                where: { id: taskId },
            });
        });
    }
    getAllTasksByProperty(propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.taskManagement.findMany({
                where: { propertyId },
            });
        });
    }
    getTaskById(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.taskManagement.findUnique({
                where: { id: taskId },
            });
        });
    }
    getAllTask() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.taskManagement.findMany({
                include: {
                    property: true,
                }
            });
        });
    }
}
exports.default = new TaskService();
