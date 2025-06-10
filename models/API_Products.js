const mongoose = require('../db/connect');

const { Schema } = mongoose;

/**
 * @description Sub-schema para o histórico de preços.
 * A opção `strict: false` permite adicionar campos de preço dinâmicos (ex: tokenPrice, sttSecondPrice)
 * que podem variar conforme o `pricingModel` do produto principal.
 * A opção `_id: false` evita que o Mongoose crie um ObjectId para cada entrada no histórico.
 */
const priceHistorySchema = new Schema({
    startDate: {
        type: Date,
        required: [true, 'A data de início da vigência é obrigatória.'],
    },
    endDate: {
        type: Date,
        default: null, // Um valor nulo significa que o preço está atualmente vigente.
    },
    // price: {
    //     type: String,
    //     required: [true, 'O preço é obrigatório'],
    // }
}, { _id: false, strict: false });

/**
 * @description Schema principal para os produtos da API.
 */
const apiProductSchema = new Schema({
    name: {
        type: String,
        required: [true, 'O nome do produto é obrigatório.'],
        trim: true,
        unique: true, // Garante que não hajam produtos com o mesmo nome.
    },
    description: {
        type: String,
        trim: true,
    },
    // pricingModel: {
    //     type: String,
    //     required: [true, 'O modelo de precificação é obrigatório.'],
    //     trim: true,
    // },
    priceHistory: {
        type: [priceHistorySchema],
        default: [], // O produto pode ser criado sem um histórico de preços inicial.
    },
}, {
    timestamps: true, // Adiciona os campos `createdAt` e `updatedAt` automaticamente.
});
 
const API_Products = mongoose.model('API_Products', apiProductSchema);

module.exports = API_Products;
