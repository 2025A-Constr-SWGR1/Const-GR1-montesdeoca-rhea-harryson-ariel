import mongoose from 'mongoose';
import connectDB from '../data/database';

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for all tests
jest.setTimeout(30000);

// Global setup - runs once before all tests
beforeAll(async () => {
  try {
    // Close any existing connections
    await mongoose.disconnect();
    // Connect to test database
    await connectDB();
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
});

// Global teardown - runs once after all tests
afterAll(async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error disconnecting from test database:', error);
    throw error;
  }
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});