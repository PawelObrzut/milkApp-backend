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
        const num = +req.query.limit;
        const pag = +req.query.page;
    }
    const result = milk_json_1.default.results.slice(0, 7);
    res.send(result);
});
app.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
});
