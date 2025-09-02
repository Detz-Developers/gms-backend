/**
 * Import the necessary modules for Firebase Realtime Database and
 * Cloud Functions (2nd gen). The 'v2' in the import path indicates
 * the second generation of Cloud Functions.
 */
import {onValueCreated} from "firebase-functions/v2/database";
import {logger} from "firebase-functions";

// Define a function that triggers when new data is created at the
// specified path.
export const helloWorld = onValueCreated("/messages/{pushId}", (event) => {
  // Get the value of the new data.
  const snapshot = event.data;
  const data = snapshot?.val?.();

  // Log a "Hello, World!" message with the new data.
  logger.info("Hello, World!", {data});
});
