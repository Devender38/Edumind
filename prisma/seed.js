"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const seedDatabase_1 = require("../dist-backend/db/seedDatabase.js");

async function seedDatabase() {
  return (0, seedDatabase_1.seedDatabase)();
}
