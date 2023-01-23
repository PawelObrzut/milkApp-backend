import mongoose from 'mongoose'

const milkSchema = new mongoose.Schema({
  name: String,
  type: String,
  storage: Number,
  id: String,
})

module.exports = mongoose.model('Milk', milkSchema)
