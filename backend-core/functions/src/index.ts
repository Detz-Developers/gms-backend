import { https } from "firebase-functions/v2";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK with production database URL
admin.initializeApp({
  databaseURL: "https://genizest-default-rtdb.firebaseio.com/"  // Production Firebase Realtime Database URL
});

const db = admin.database();  // Realtime Database instance

// Generate the next generator ID (e.g., G001, G002)
async function generateNextGeneratorId(): Promise<string> {
  const ref = db.ref('id_counter/last_generator_id'); // Path to the counter node

  // Get the current counter value
  const snapshot = await ref.once('value');
  let currentId = snapshot.val();

  // If no ID exists, start from G001
  if (!currentId) {
    currentId = 1;  // Start with G001
  } else {
    currentId++;  // Increment the last used ID
  }

  // Update the last used ID
  await ref.set(currentId);

  // Format the ID (e.g., G001, G002, G003)
  return `G${currentId.toString().padStart(3, '0')}`;
}

// Utility to parse and format date
function parseDate(dateString: string | undefined): string | null {
  if (!dateString) return null;
  // Try to parse the date in "YYYY-MM-DD" format
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null; // If invalid date, return null
  return date.toISOString(); // Convert to ISO string
}

// Create a new generator with a custom sequential ID
export const createGenerator = https.onRequest(async (req, res): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { 
    brand, 
    sizeKw, 
    serialNumber, 
    status, 
    location, 
    assignedShop, 
    issuedDate, 
    installedDate, 
    operatingHours, 
    warrantyExpiryDate,
    hasBatteryCharger,
    hasAutoStart
  } = req.body;

  try {
    // Generate the next sequential ID
    const generatorId = await generateNextGeneratorId();

    const newGenerator = {
      id: generatorId,  // Use the generated ID (G001, G002, ...)
      brand,
      sizeKw,
      serialNumber,
      status,
      location,
      assignedShop,
      issuedDate: parseDate(issuedDate) || new Date().toISOString(),  // Parse and use provided date or current date
      installedDate: parseDate(installedDate) || new Date().toISOString(),  // Parse and use provided date or current date
      operatingHours: operatingHours || 0,  // Default to 0 if not provided
      warrantyExpiryDate: parseDate(warrantyExpiryDate) || null,  // New: warranty expiry date
      hasBatteryCharger: hasBatteryCharger || false,  // New: battery charger status (default false)
      hasAutoStart: hasAutoStart || false,  // New: auto start status (default false)
    };

    // Push to Realtime Database (store by custom ID)
    await db.ref('generators').child(generatorId).set(newGenerator);

    // Log the generator ID
    logger.info("Generator created successfully", { generatorId });

    // Return the generator ID in the response
    res.status(201).json({
      message: 'Generator created successfully',
      generatorId,  // Return the generatorId here
    });

    return;
  } catch (error: any) {
    logger.error("Error occurred while creating generator:", error);
    res.status(500).json({ error: error.message });
    return;
  }
});

// Get all generators
export const getGenerators = https.onRequest(async (req, res): Promise<void> => {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const snapshot = await db.ref('generators').once('value');
    const data = snapshot.val();
    
    let generators: any[] = [];
    
    if (data) {
      // Convert object to array with IDs
      generators = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    }

    logger.info("Fetched all generators");

    res.status(200).json(generators);
    return;
  } catch (error: any) {
    logger.error("Error occurred while fetching generators:", error);
    res.status(500).json({ error: error.message });
    return;
  }
});

// Get generator by ID (using query parameter)
export const getGeneratorById = https.onRequest(async (req, res): Promise<void> => {
  const id = req.query.id as string;  // Get ID from query parameter (e.g., ?id=G001)

  if (!id) {
    res.status(400).json({ error: 'ID is required (use ?id=...)' });
    return;
  }

  try {
    const snapshot = await db.ref(`generators/${id}`).once('value');
    const data = snapshot.val();

    if (!data) {
      res.status(404).json({ message: 'Generator not found' });
      return;
    }

    logger.info("Fetched generator by ID", { id });

    res.status(200).json({ id, ...data });
    return;
  } catch (error: any) {
    logger.error("Error occurred while fetching generator by ID:", error);
    res.status(500).json({ error: error.message });
    return;
  }
});

// Update generator by ID (using query parameter)
export const updateGenerator = https.onRequest(async (req, res): Promise<void> => {
  const id = req.query.id as string;  // Get ID from query parameter (e.g., ?id=G001)

  if (!id) {
    res.status(400).json({ error: 'ID is required (use ?id=...)' });
    return;
  }

  const updatedData = req.body;

  // Parse dates in updated data if provided
  if (updatedData.warrantyExpiryDate) {
    updatedData.warrantyExpiryDate = parseDate(updatedData.warrantyExpiryDate);
  }
  if (updatedData.issuedDate) {
    updatedData.issuedDate = parseDate(updatedData.issuedDate);
  }
  if (updatedData.installedDate) {
    updatedData.installedDate = parseDate(updatedData.installedDate);
  }

  try {
    // Check if generator exists first
    const snapshot = await db.ref(`generators/${id}`).once('value');
    if (!snapshot.val()) {
      res.status(404).json({ message: 'Generator not found' });
      return;
    }

    // Update the generator
    await db.ref(`generators/${id}`).update(updatedData);

    logger.info("Generator updated successfully", { id, updatedData });

    res.status(200).json({
      message: 'Generator updated successfully',
      id,
      ...updatedData,
    });
    return;
  } catch (error: any) {
    logger.error("Error occurred while updating generator:", error);
    res.status(500).json({ error: error.message });
    return;
  }
});

// Delete generator by ID (using query parameter)
export const deleteGenerator = https.onRequest(async (req, res): Promise<void> => {
  const id = req.query.id as string;  // Get ID from query parameter (e.g., ?id=G001)

  if (!id) {
    res.status(400).json({ error: 'ID is required (use ?id=...)' });
    return;
  }

  try {
    // Check if generator exists first
    const snapshot = await db.ref(`generators/${id}`).once('value');
    if (!snapshot.val()) {
      res.status(404).json({ message: 'Generator not found' });
      return;
    }

    await db.ref(`generators/${id}`).remove();

    logger.info("Generator deleted successfully", { id });

    res.status(200).json({ message: 'Generator deleted successfully', id });
    return;
  } catch (error: any) {
    logger.error("Error occurred while deleting generator:", error);
    res.status(500).json({ error: error.message });
    return;
  }
});