"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.Milk = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
require('dotenv').config();
const milkSchema = new Schema({
    name: String,
    type: String,
    storage: Number,
    id: String
});
exports.Milk = model('Milk', milkSchema);
mongoose_1.default.set("strictQuery", false);
mongoose_1.default.connect(`mongodb+srv://Pawel:${process.env.MONGO_KEY}@cluster0.czc7qsk.mongodb.net/j?retryWrites=true&w=majority`);
exports.db = mongoose_1.default.connection;
module.exports = {
    db: exports.db,
    Milk: exports.Milk,
};
