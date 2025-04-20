import { storage } from "../storage";

// This file would typically contain database model definitions
// Since we're using in-memory storage, this is just a placeholder
// In a real MongoDB implementation, this would have Mongoose models

export const models = {
  // Example of how we would expose models in a real implementation
  getStorage() {
    return storage;
  }
};
