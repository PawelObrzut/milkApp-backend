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
const cors = require('cors');
const mongoose_1 = __importDefault(require("mongoose"));
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
            throw new ErrorMessage(500, 'Database is not available. Try again later');
        }
        return next();
    }
    catch (error) {
        return next(error);
    }
});
const validatingQuery = (query) => {
    // refactor paginateData => to be continued...
};
const paginateData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.query.limit && req.query.page && req.query.filter) {
            const request = req.query.filter;
            const filter = request.split('+');
            const limit = +req.query.limit;
            const page = +req.query.page;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const count = yield Milk.find({ type: { $in: filter } }).countDocuments().exec();
            const responseData = {
                limit,
                page,
                count,
                result: yield Milk.find({ type: { $in: filter } }).limit(limit).skip(startIndex).exec()
            };
            if (startIndex > 0) {
                responseData.previous = page - 1;
            }
            if (endIndex < count) {
                responseData.next = page + 1;
            }
            res.respondWithData = responseData;
            return next();
        }
        if (req.query.limit && req.query.page) {
            const limit = +req.query.limit;
            const page = +req.query.page;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const count = yield Milk.countDocuments().exec();
            const responseData = {
                limit,
                page,
                count,
                result: yield Milk.find().limit(limit).skip(startIndex).exec()
            };
            if (startIndex > 0) {
                responseData.previous = page - 1;
            }
            if (endIndex < count) {
                responseData.next = page + 1;
            }
            res.respondWithData = responseData;
            return next();
        }
        res.respondWithData = { count: yield Milk.countDocuments().exec(), result: yield Milk.find().exec() };
        return next();
    }
    catch (error) {
        return next(error);
    }
});
app.use(cors());
app.use(connectToMongoDB);
app.use(paginateData);
app.get('/', (_req, res) => {
    return res.status(200).send({ message: 'api resources can be found at /api/milk' });
});
app.route('/api/milk')
    .get((_req, res) => {
    return res.status(200).json(res.respondWithData);
});
app.route('/api/milk/:name')
    .get((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.params.name;
        const result = yield Milk.find({ name: new RegExp(name, 'i') });
        if (!result) {
            throw new ErrorMessage(404, 'Milk not found');
        }
        const respond = {
            result: result,
            count: result.length,
        };
        return res.status(200).json(respond);
    }
    catch (error) {
        return next(error);
    }
}));
app.get('*', (_req, _res, next) => {
    throw new ErrorMessage(400, 'This endpoint is not served');
});
app.use((error, _req, res, _next) => {
    return res.status(error.statusCode).send({ message: error.message });
});
app.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
});
