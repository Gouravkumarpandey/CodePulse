// Controller for manual repository creation
const FirestoreService = require('../services/firestore.service');
const response = require('../utils/response.util');

const addManualRepository = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, owner, url, language, description } = req.body;
    if (!name || !owner || !url) {
      return response.error(res, 'Repository name, owner, and URL are required', 400);
    }
    // Create a new repo doc with a generated ID
    const repoData = {
      userId,
      name,
      owner,
      url,
      language: language || '',
      description: description || '',
      isActive: false,
      isConnected: false, // Not connected via OAuth
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Add to Firestore (auto-ID)
    const db = require('../config/firebase').db;
    const docRef = await db.collection('repositories').add(repoData);
    return response.success(res, { id: docRef.id }, 'Repository added successfully');
  } catch (error) {
    return response.error(res, error.message || 'Failed to add repository', 500);
  }
};

module.exports = { addManualRepository };
