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
const express_1 = __importDefault(require("express"));
const dotenv = require('dotenv');
const app = (0, express_1.default)();
const milk_json_1 = __importDefault(require("./milk.json"));
dotenv.config();
const port = process.env.PORT || 8080;
const paginateData = (req, res, next) => {
    if (req.query.limit && req.query.page) {
        const limit = +req.query.limit;
        const page = +req.query.page;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const responseData = {
            result: milk_json_1.default.results.slice(startIndex, endIndex)
        };
        if (startIndex > 0) {
            responseData.previous = page - 1;
        }
        if (endIndex < milk_json_1.default.results.length) {
            responseData.next = page + 1;
        }
        res.respondWithData = responseData;
        next();
    }
    next();
};
app.use(paginateData);
app.get('/', (req, res) => {
    res.json(milk_json_1.default);
});
app.route('/api/milk')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(res.respondWithData);
}));
app.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
});
