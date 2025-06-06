// src/models/adoptionRequestModel.js
const mongoose = require("mongoose");

const adoptionRequestSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    idNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    schedule: {
      type: String,
      trim: true,
    },
    maritalStatus: {
      type: String,
      trim: true,
    },

    // Housing Information
    city: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    housing: {
      type: String,
      trim: true,
    },
    floor: {
      type: String,
      trim: true,
    },
    houseDescription: {
      type: String,
      trim: true,
    },

    // Family Information
    haveKids: {
      type: String,
      enum: ["yes", "no"],
      trim: true,
    },
    many: {
      type: String,
      trim: true,
    },
    ages: {
      type: String,
      trim: true,
    },

    // Pet Information
    havePets: {
      type: String,
      enum: ["yes", "no"],
      trim: true,
    },
    currentPets: {
      type: String,
      trim: true,
    },
    hoursAlone: {
      type: String,
      trim: true,
    },
    vetName: {
      type: String,
      trim: true,
    },
    adoptBefore: {
      type: String,
      enum: ["yes", "no"],
      trim: true,
    },
    committed: {
      type: String,
      enum: ["yes", "no"],
      trim: true,
    },

    // Adoption Information
    whyAdopt: {
      type: String,
      trim: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
    },

    // Pet being adopted (reference)
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
    },

    // PDF document
    pdfUrl: {
      type: String,
      trim: true,
    },
    pdfPublicId: {
      type: String,
      trim: true,
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    
    // Review information (for admins/managers)
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewDate: {
      type: Date,
    },
    reviewComments: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("AdoptionRequest", adoptionRequestSchema);
