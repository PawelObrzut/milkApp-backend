"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const milkSchema = new mongoose_1.default.Schema({
    name: String,
    type: String,
    storage: Number,
    id: String,
});
module.exports = mongoose_1.default.model('Milk', milkSchema);
