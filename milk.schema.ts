import mongoose from 'mongoose'

const milkSchema = new mongoose.Schema({
  name: String,
  type: String,
  storage: Number,
  id: String,
})

const Milk = mongoose.model('Milk', milkSchema);

export default Milk;