// controllers/services.controller.js

const serviceModel = require("../models/services.model");
const mongoose = require("mongoose");

/**
 * Add a new service
 */
const addService = async (req, res) => {
  try {
    console.log("SERVICE CREATE PAYLOAD:", req.body);

    const createService = {
      productcreatoremail: req.body.productcreatoremail,
      name: req.body.name,
      icon: req.body.product_icon || req.body.icon || "",
      description: req.body.description || "",
      chargingtype: req.body.chargingtype || "",

      revenue_account: req.body.revenue_account || "",
      client_app: req.body.client_app || "",
      product_category_code: req.body.product_category_code || "",
      sub_category_code: req.body.sub_category_code || "",
      custom_product_label: req.body.custom_product_label || "",
      points_creation: req.body.points_creation || false,
      sub_text: req.body.sub_text || "",

      first_purchase: req.body.first_purchase || {},
      billing_cycle: req.body.billing_cycle || {},
      grace_period: req.body.grace_period || 0,
      first_retry: req.body.first_retry || 0,
      second_retry: req.body.second_retry || 0,

      staking_allowed: req.body.staking_allowed || false,
      staking_details: req.body.staking_details || {},

      step_id: req.body.step_id ? String(req.body.step_id) : null,
      serviceProvider: req.body.serviceProvider || "",
      access: req.body.access || "",
      goal: req.body.goal || "",

      grade: req.body.gradeData || req.body.grade || [],
      financialSituation:
        req.body.financialData || req.body.financialSituation || "",
      stream: req.body.stream || "",

      cost: req.body.cost || 0,
      price: req.body.price || 0,
      discountType: req.body.discountType || "",
      discountAmount: req.body.discountAmount || 0,
      duration: req.body.duration || 0,
      features: req.body.features || [],

      status: req.body.status || "active",
      outcome: req.body.outcome || "",
      type: req.body.type || "",
      iterations: req.body.iterations || [],
      ServiceDetails: req.body.ServiceDetails || [],
    };

    const service = await serviceModel.create(createService);

    return res.json({
      status: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return res.status(500).json({
      status: false,
      message: "Internal error while creating service",
      error: error.message,
    });
  }
};

/**
 * Get services by creator email
 */
const getServices = async (req, res) => {
  if (!req.query.productcreatoremail) {
    return res.json({
      status: false,
      message: "Product creator email required",
    });
  }

  try {
    const services = await serviceModel.find({
      productcreatoremail: req.query.productcreatoremail,
      status: "active", // 👈 KEY FIX
    });

    return res.status(200).json({
      status: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({
      status: false,
      message: "Error fetching services",
      error: error.message,
    });
  }
};


/**
 * Update service
 */
const updateService = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid service id" });
    }

    const updated = await serviceModel.findOneAndUpdate(
      { _id: id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ status: false, message: "Service not found" });
    }

    return res.json({ status: true, message: "Service updated", data: updated });
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({ status: false, message: "Error updating service", error: error.message });
  }
};

/**
 * Soft delete service
 */
const deleteService = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid service id" });
    }

    const deleted = await serviceModel.findOneAndUpdate(
      { _id: id },
      { status: "inactive" },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ status: false, message: "Service not found" });
    }

    return res.json({ status: true, message: "Service marked inactive", data: deleted });
  } catch (error) {
    console.error("Error deleting service:", error);
    return res.status(500).json({ status: false, message: "Error deleting service", error: error.message });
  }
};

/**
 * Restore service
 */
const restoreService = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid service id" });
    }

    const restored = await serviceModel.findOneAndUpdate(
      { _id: id },
      { status: "active" },
      { new: true }
    );

    if (!restored) {
      return res.status(404).json({ status: false, message: "Service not found" });
    }

    return res.json({ status: true, message: "Service restored", data: restored });
  } catch (error) {
    console.error("Error restoring service:", error);
    return res.status(500).json({ status: false, message: "Error restoring service", error: error.message });
  }
};

const getAllServicesForAdmin = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    const services = await serviceModel
      .find(filter)
      .sort({ createdAt: -1 });

    return res.json({
      status: true,
      total: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Admin get services error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch services",
    });
  }
};



/**
 * Get services by step
 */
const getServicesByStep = async (req, res) => {
  try {
    const { step_id } = req.query;
    if (!step_id) {
      return res.status(400).json({ status: false, message: "step_id is required" });
    }

    const services = await serviceModel.find({ step_id });

    return res.json({
      status: true,
      total: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services by step:", error);
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

/**
 * Bulk upload services
 */
const bulkUploadServices = async (req, res) => {
  try {
    const { email, records } = req.body;

    if (!email || !Array.isArray(records)) {
      return res.status(400).json({ status: false, message: "Invalid payload" });
    }

    const formatted = records.map(r => ({
      ...r,
      productcreatoremail: email,
      status: "active",
    }));

    const inserted = await serviceModel.insertMany(formatted);

    return res.json({
      status: true,
      message: "Bulk services inserted",
      count: inserted.length,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

/**
 * Update service icon
 */
const updateServiceIcon = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { icon } = req.body;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ status: false, message: "Invalid serviceId" });
    }

    const updated = await serviceModel.findByIdAndUpdate(
      serviceId,
      { icon },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ status: false, message: "Service not found" });
    }

    return res.json({ status: true, message: "Icon updated", data: updated });
  } catch (error) {
    console.error("Error updating icon:", error);
    return res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  addService,
  getServices,
  updateService,
  deleteService,
  restoreService,
  getServicesByStep,
  bulkUploadServices,
  updateServiceIcon,    
  getAllServicesForAdmin,
};
