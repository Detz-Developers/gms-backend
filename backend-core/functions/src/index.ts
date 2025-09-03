import { https } from "firebase-functions/v2";  // Import HTTP functions from v2
import { logger } from "firebase-functions";   // Logger for logging
import * as admin from "firebase-admin";       // Firebase Admin SDK to interact with Firestore

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();  // Firestore database instance

// Create a new generator
export const createGenerator = https.onRequest(async (req, res): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { brand, sizeKw, serialNumber, status, location, assignedShop } = req.body;

  try {
    const newGenerator = {
      brand,
      sizeKw,
      serialNumber,
      status,
      location,
      assignedShop,
      issuedDate: new Date(),
      installedDate: new Date(),
      operatingHours: 0,
      lastServiceDate: null,
      nextServiceDate: null,
    };

    const generatorRef = await db.collection('generators').add(newGenerator);

    logger.info("Generator created successfully", { generatorId: generatorRef.id });

    res.status(201).json({
      message: 'Generator created successfully',
      generatorId: generatorRef.id,
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
    const snapshot = await db.collection('generators').get();
    let generators: any[] = [];

    snapshot.forEach(doc => {
      generators.push({ id: doc.id, ...doc.data() });
    });

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
  const id = req.query.id as string;  // Get ID from query parameter (e.g., ?id=ABC123)

  if (!id) {
    res.status(400).json({ error: 'ID is required (use ?id=...)' });
    return;
  }

  try {
    const generatorDoc = await db.collection('generators').doc(id).get();

    if (!generatorDoc.exists) {
      res.status(404).json({ message: 'Generator not found' });
      return;
    }

    logger.info("Fetched generator by ID", { id });

    res.status(200).json({ id: generatorDoc.id, ...generatorDoc.data() });
    return;
  } catch (error: any) {
    logger.error("Error occurred while fetching generator by ID:", error);
    res.status(500).json({ error: error.message });
    return;
  }
});

// Update generator by ID (using query parameter)
export const updateGenerator = https.onRequest(async (req, res): Promise<void> => {
  const id = req.query.id as string;  // Get ID from query parameter (e.g., ?id=ABC123)

  if (!id) {
    res.status(400).json({ error: 'ID is required (use ?id=...)' });
    return;
  }

  const updatedData = req.body;

  try {
    const generatorRef = db.collection('generators').doc(id);

    await generatorRef.update(updatedData);

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
  const id = req.query.id as string;  // Get ID from query parameter (e.g., ?id=ABC123)

  if (!id) {
    res.status(400).json({ error: 'ID is required (use ?id=...)' });
    return;
  }

  try {
    await db.collection('generators').doc(id).delete();

    logger.info("Generator deleted successfully", { id });

    res.status(200).json({ message: 'Generator deleted successfully', id });
    return;
  } catch (error: any) {
    logger.error("Error occurred while deleting generator:", error);
    res.status(500).json({ error: error.message });
    return;
  }
});
