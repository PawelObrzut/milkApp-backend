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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv = require('dotenv');
const app = (0, express_1.default)();
const cors = require('cors');
dotenv.config();
const Milk = require('./milk.schema');
const port = process.env.PORT || 8080;
class ErrorMessage {
    constructor(status, message) {
        this.statusCode = status;
        this.message = message;
    }
}
const connectToMongoDB = (_req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.set('strictQuery', false);
        yield mongoose_1.default.connect(process.env.MONGO_URI);
        if (mongoose_1.default.connection.readyState !== 1) {
            return new ErrorMessage(500, 'Database is not available. Try again later');
        }
        return next();
    }
    catch (error) {
        return next(error);
    }
});
const formatResponseData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = '1', limit = '10' } = req.query;
        const startIndex = (+page - 1) * +limit;
        const endIndex = +page * +limit;
        const filter = req.query.filter;
        let result = [];
        let count = 0;
        if (filter) {
            result = yield Milk.find({ type: { $in: filter.split('+') } }).limit(limit).skip(startIndex).exec();
            count = yield Milk.find({ type: { $in: filter.split('+') } }).countDocuments().exec();
        }
        else {
            result = yield Milk.find().limit(+limit).skip(startIndex).exec();
            count = yield Milk.find().countDocuments().exec();
        }
        const responseData = {
            limit: +limit,
            page: +page,
            count,
            result,
        };
        if (startIndex > 0) {
            responseData.previous = +page - 1;
        }
        if (endIndex < count) {
            responseData.next = +page + 1;
        }
        res.respondWithData = responseData;
        next();
    }
    catch (error) {
        next(error);
    }
});
app.use(cors());
app.use(connectToMongoDB);
app.use(formatResponseData);
app.get('/', (_req, res) => res.status(200).send({ message: 'api resources can be found at /api/milks' }));
app.route('/api/milks')
    .get((_req, res) => res.status(200).json(res.respondWithData));
app.route('/api/milks/:name')
    .get((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.params;
        const result = yield Milk.find({ name: new RegExp(name, 'i') });
        if (!result) {
            return new ErrorMessage(404, 'Milk not found');
        }
        const respond = {
            result,
            count: result.length,
        };
        return res.status(200).json(respond);
    }
    catch (error) {
        return next(error);
    }
}));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get('*', (_req, _res, _next) => new ErrorMessage(400, 'This endpoint is not served'));
// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len
app.use((error, _req, res, _next) => res.status(error.statusCode).send({ message: error.message }));
app.listen(port);
