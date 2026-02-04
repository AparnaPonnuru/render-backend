const stepModel = require("../../models/steps.model");
const pathModel = require("../../models/path.model");
const mongoose = require("mongoose");


// ================= ADD STEP =================
const addStep = async (req, res) => {
  try {
    const pathId = req.body.path_id;

    if (!pathId) {
      return res.json({ status: false, message: "path_id is required" });
    }

    const pathExists = await pathModel.findById(pathId);
    if (!pathExists) {
      return res.json({ status: false, message: "Invalid path_id" });
    }

    const step = await stepModel.create({
      ...req.body,
      path_id: pathId,
      status: "active",
      created_by: req.user.id,
      user_role: "admin"
    });

    return res.json({ status: true, data: step });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};


// ================= GET STEPS =================
const getSteps = async (req, res) => {
  try {
    const steps = await stepModel
      .find({ status: { $ne: "delete" } })
      .sort({ createdAt: -1 });

    res.json({ status: true, total: steps.length, data: steps });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


// ================= GET BY ID =================
const getStepById = async (req, res) => {
  try {
    const step = await stepModel.findById(req.params.id);

    if (!step)
      return res.status(404).json({ status: false, message: "Step not found" });

    res.json({ status: true, data: step });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


// ================= UPDATE =================
const updateStep = async (req, res) => {
  try {
    const step = await stepModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json({ status: true, data: step });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


// ================= DELETE (HARD DELETE + unlink path) =================
const deleteStep = async (req, res) => {
  try {
    const stepId = req.params.id;

    await stepModel.findByIdAndDelete(stepId);

    // 🔥 unlink from path
    await pathModel.updateMany(
      { "the_ids.step_id": stepId },
      { $pull: { the_ids: { step_id: stepId } } }
    );

    res.json({ status: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


// ================= BULK UPLOAD =================
const bulkUploadSteps = async (req, res) => {
  try {
    const { email, records } = req.body;

    if (!email || !Array.isArray(records)) {
      return res.json({ status: false, message: "Invalid input" });
    }

    const formatted = records.map((r) => ({
      ...r,
      email,
      status: "active",
      created_by: req.user.id,
      user_role: "admin"
    }));

    await stepModel.insertMany(formatted);

    res.json({ status: true, message: "Bulk upload success" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


module.exports = {
  addStep,
  getSteps,
  getStepById,
  updateStep,
  deleteStep,
  bulkUploadSteps
};
