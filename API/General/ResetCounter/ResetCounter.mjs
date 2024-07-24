import mongoose from "mongoose";

// Connect to your MongoDB

const counterSchema = new mongoose.Schema({
  id: String,
  seq: Number,
});

const Counter = mongoose.model("Counter", counterSchema);

// Function to reset the counter
export const resetCounter = async (counterId) => {
  try {
    await Counter.findOneAndUpdate(
      { id: counterId }, // Find the document by ID
      { seq: 0 }, // Reset the sequence value to 0
      { new: true, upsert: true } // Create a new document if it doesn't exist
    );
    console.log(`Counter ${counterId} has been reset.`);
  } catch (error) {
    console.error(`Error resetting counter ${counterId}:`, error);
  }
};

// Call the function to reset the counter for 'radiologyNo'
