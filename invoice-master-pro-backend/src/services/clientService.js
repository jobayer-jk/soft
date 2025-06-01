const prisma = require("../config/prisma");

// Service to create a new client
const createClient = async (clientData, orgId) => {
  if (!orgId) {
    throw new Error("Organization ID is required to create a client.");
  }
  // Check if client email already exists for this organization
  const existingClient = await prisma.client.findFirst({
    where: {
      email: clientData.email,
      orgId: orgId,
    },
  });

  if (existingClient) {
    throw new Error("Client with this email already exists in this organization.");
  }

  const client = await prisma.client.create({
    data: {
      ...clientData,
      orgId: orgId, // Associate client with the user's organization
    },
  });
  return client;
};

// Service to get all clients for an organization (with potential filtering/pagination)
const getClients = async (orgId, filters = {}) => {
  if (!orgId) {
    throw new Error("Organization ID is required to fetch clients.");
  }
  // Basic implementation: Fetch all clients for the org
  // TODO: Add filtering (by name, email, etc.) and pagination
  const clients = await prisma.client.findMany({
    where: {
      orgId: orgId,
      // Add filter conditions here based on `filters` object
    },
    orderBy: {
        createdAt: 'desc' // Default sort order
    }
    // TODO: Add pagination logic (skip, take)
  });
  return clients;
};

// Service to get a single client by ID
const getClientById = async (clientId, orgId) => {
  if (!orgId) {
    throw new Error("Organization ID is required.");
  }
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      orgId: orgId, // Ensure client belongs to the correct organization
    },
  });
  if (!client) {
    throw new Error("Client not found or access denied.");
  }
  return client;
};

// Service to update a client
const updateClient = async (clientId, updateData, orgId) => {
  if (!orgId) {
    throw new Error("Organization ID is required.");
  }
  // First, verify the client exists and belongs to the organization
  const existingClient = await prisma.client.findFirst({
    where: {
      id: clientId,
      orgId: orgId,
    },
  });

  if (!existingClient) {
    throw new Error("Client not found or access denied.");
  }

  // Prevent changing the organization ID
  if (updateData.orgId && updateData.orgId !== orgId) {
      throw new Error("Cannot change the client's organization.");
  }

  // Prevent changing email to one that already exists in the org (unless it's the same client)
  if (updateData.email && updateData.email !== existingClient.email) {
      const conflictingClient = await prisma.client.findFirst({
          where: {
              email: updateData.email,
              orgId: orgId,
              NOT: {
                  id: clientId
              }
          }
      });
      if (conflictingClient) {
          throw new Error("Another client with this email already exists in this organization.");
      }
  }

  const updatedClient = await prisma.client.update({
    where: {
      id: clientId,
      // No need to check orgId here again as update is based on unique id
    },
    data: updateData,
  });
  return updatedClient;
};

// Service to delete a client
const deleteClient = async (clientId, orgId) => {
  if (!orgId) {
    throw new Error("Organization ID is required.");
  }
  // First, verify the client exists and belongs to the organization
  const existingClient = await prisma.client.findFirst({
    where: {
      id: clientId,
      orgId: orgId,
    },
  });

  if (!existingClient) {
    throw new Error("Client not found or access denied.");
  }

  // TODO: Add checks here - e.g., cannot delete client with existing invoices?
  // Or handle cascading deletes/archiving based on business rules.

  await prisma.client.delete({
    where: {
      id: clientId,
    },
  });

  return { message: "Client deleted successfully." };
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
};

