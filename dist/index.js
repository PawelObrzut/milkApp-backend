"use strict";
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
app.get('/', (req, res) => {
    res.json(milk_json_1.default);
});
app.route('/api/milk')
    .get((req, res) => {
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
        return res.status(200).send(responseData);
    }
    return res.status(200).send(milk_json_1.default.results);
});
app.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
});
