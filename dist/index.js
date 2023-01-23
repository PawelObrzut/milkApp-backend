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
mongoose_1.default.set('strictQuery', false);
mongoose_1.default.connect(process.env.MONGO_URI);
// !! To be removed
// ** populating mongoDB database with simple loop on json mock data.
// const db = mongoose.connection
// db.once('open', async () => {
//   milkData.results.forEach( async result => {
//    await Milk.create({
//       name: result.name,
//       type: result.type,
//       storage: result.storage,
//       id: result.id
//     })
//   })
//   console.log('done')
// })
const port = process.env.PORT || 8080;
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
            next();
        }
        res.respondWithData = { result: yield Milk.find() };
        next();
    }
    catch (err) {
        // next write custom error middleware
    }
});
app.use(paginateData);
app.get('/', (req, res) => {
    res.status(200).send({ message: "api resources can be found at /api/milk" });
});
app.route('/api/milk')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json(res.respondWithData);
}));
app.route('/api/milk/:id')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield Milk.findOne({ id: id });
    res.status(200).json(result);
}));
app.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
});
