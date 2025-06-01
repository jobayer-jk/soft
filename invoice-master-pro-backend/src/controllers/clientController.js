const clientService = require("../services/clientService");

// Controller to handle creating a new client
const createClient = async (req, res, next) => {
  const clientData = req.body;
  const orgId = req.user?.orgId; // Assumes orgId is attached to the user object by auth middleware

  if (!orgId) {
    return res.status(400).json({ message: "Organization context is missing. Ensure user is properly authenticated and associated with an organization." });
  }
  if (!clientData.email || !clientData.name) {
      return res.status(400).json({ message: "Client name and email are required." });
  }

  try {
    const client = await clientService.createClient(clientData, orgId);
    res.status(201).json(client);
  } catch (error) {
    if (error.message.includes("already exists")) {
        return res.status(409).json({ message: error.message });
    }
    next(error); // Pass other errors to the global error handler
  }
};

// Controller to get all clients for the user's organization
const getClients = async (req, res, next) => {
  const orgId = req.user?.orgId;
  const filters = req.query; // Get filters from query parameters (e.g., /clients?status=active)

  if (!orgId) {
    return res.status(400).json({ message: "Organization context is missing." });
  }

  try {
    const clients = await clientService.getClients(orgId, filters);
    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
};

// Controller to get a single client by ID
const getClientById = async (req, res, next) => {
  const { clientId } = req.params;
  const orgId = req.user?.orgId;

  if (!orgId) {
    return res.status(400).json({ message: "Organization context is missing." });
  }

  try {
    const client = await clientService.getClientById(clientId, orgId);
    res.status(200).json(client);
  } catch (error) {
     if (error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// Controller to update a client
const updateClient = async (req, res, next) => {
  const { clientId } = req.params;
  const updateData = req.body;
  const orgId = req.user?.orgId;

   if (!orgId) {
    return res.status(400).json({ message: "Organization context is missing." });
  }
  // Basic validation: ensure there's something to update
  if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided." });
  }

  try {
    const updatedClient = await clientService.updateClient(clientId, updateData, orgId);
    res.status(200).json(updatedClient);
  } catch (error) {
    if (error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("already exists")) {
        return res.status(409).json({ message: error.message });
    }
     if (error.message.includes("Cannot change")) {
        return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// Controller to delete a client
const deleteClient = async (req, res, next) => {
  const { clientId } = req.params;
  const orgId = req.user?.orgId;

  if (!orgId) {
    return res.status(400).json({ message: "Organization context is missing." });
  }

  try {
    const result = await clientService.deleteClient(clientId, orgId);
    res.status(200).json(result); // Or return 204 No Content
  } catch (error) {
    if (error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
    }
    // Handle potential constraint errors if deletion is blocked
    next(error);
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
};

