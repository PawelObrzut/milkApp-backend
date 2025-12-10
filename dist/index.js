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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const milk_schema_1 = __importDefault(require("./milk.schema"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
class ErrorMessage extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
const connectToMongoDB = (_req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        mongoose_1.default.set('strictQuery', false);
        yield mongoose_1.default.connect(process.env.MONGO_URI || '');
        if (mongoose_1.default.connection.readyState !== 1) {
            next(new ErrorMessage(500, 'Database is not available. Try again later'));
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const formatResponseData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const filter = req.query.filter;
        let query = {};
        if (filter) {
            query = { type: { $in: filter.split('+') } };
        }
        const result = yield milk_schema_1.default.find(query).limit(limit).skip(startIndex).exec();
        const count = yield milk_schema_1.default.countDocuments(query).exec();
        const responseData = {
            limit,
            page,
            count,
            result,
        };
        if (startIndex > 0)
            responseData.previous = page - 1;
        if (endIndex < count)
            responseData.next = page + 1;
        res.locals.respondWithData = responseData;
        next();
    }
    catch (error) {
        next(error);
    }
});
app.use((0, cors_1.default)());
app.use(connectToMongoDB);
app.use(formatResponseData);
app.use(express_1.default.json());
app.get('/', (_req, res) => {
    res.status(200).json({ message: 'API resources can be found at /api/milks' });
});
app.get('/api/milks', (_req, res) => {
    res.status(200).json(res.locals.respondWithData);
});
app.get('/api/milks/:name', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.params;
        const result = yield milk_schema_1.default.find({ name: new RegExp(name, 'i') }).exec();
        if (!result || result.length === 0) {
            throw new ErrorMessage(404, 'Milk not found');
        }
        res.status(200).json({
            count: result.length,
            result,
        });
    }
    catch (error) {
        next(error);
    }
}));
app.all('*', (_req, _res, next) => {
    next(new ErrorMessage(404, 'This endpoint is not served'));
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error, _req, res, _next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    res.status(statusCode).json({ message });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
