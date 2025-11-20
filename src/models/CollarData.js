const mongoose = require('mongoose');

const collarDataScheme = new mongoose.Schema(
    {
        _id: { type: String },

        lastLocation: {
            lat: Number,
            lon: Number,
            timestamp: Date
        },

        status: { type: String, default: 'unknow'},

        lastSeen: Date
    },
    { timestamps: true } //adds createdAt, updatedAt
);

module.exports = mongoose.model('collerData', collarDataScheme);