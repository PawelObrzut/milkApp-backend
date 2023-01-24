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
dotenv.config();
const mongoose_1 = __importDefault(require("mongoose"));
const Milk = require('./milk.schema');
// !! for proper error handling I guess these two lines should be in a separate middleware
mongoose_1.default.set('strictQuery', false);
mongoose_1.default.connect(process.env.MONGO_URI);
const port = process.env.PORT || 8080;
class ErrorMessage {
    constructor(status, message) {
        this.statusCode = status;
        this.message = message;
    }
}
const paginateData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.query.limit && req.query.page) {
            const limit = +req.query.limit;
            const page = +req.query.page;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const responseData = {
                result: yield Milk.find().limit(limit).skip(startIndex)
            };
            if (startIndex > 0) {
                responseData.previous = page - 1;
            }
            if (endIndex < (yield Milk.countDocuments())) {
                responseData.next = page + 1;
            }
            res.respondWithData = responseData;
            return next();
        }
        res.respondWithData = { result: yield Milk.find() };
        return next();
    }
    catch (error) {
        throw new ErrorMessage(404, 'milk not found');
    }
});
app.use(paginateData);
app.get('/', (req, res) => {
    return res.status(200).send({ message: 'api resources can be found at /api/milk' });
});
app.route('/api/milk')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(res.respondWithData);
}));
app.route('/api/milk/:id')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const result = yield Milk.findOne({ id: id });
        return res.status(200).json(result);
    }
    catch (err) {
        throw new ErrorMessage(404, 'milk not found');
    }
}));
app.get('*', (_req, _res, next) => {
    const error = new ErrorMessage(400, 'This endpoint is not served');
    return next(error);
});
app.use((error, _req, res, _next) => {
    return res.status(error.statusCode).send({ message: error.message });
});
app.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
});
