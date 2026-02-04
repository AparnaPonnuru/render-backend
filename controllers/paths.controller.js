const pathModel = require('../models/path.model');
const stepModel = require('../models/steps.model');
const userModel = require('../models/users.model');
const axios = require('axios');
const mongoose = require('mongoose')

const addPath = async (req, res) => {
  try {
    const body = req.body;

    // 🔹 1. Duplicate path check (unchanged)
    const existing = await pathModel.findOne({
      email: body.email,
      nameOfPath: body.nameOfPath,
      status: "waitingforapproval"
    });

    if (existing) {
      return res.status(400).json({
        status: false,
        message: "A path with this name already exists and is pending approval"
      });
    }

    // 🔹 2. STEP VALIDATION — START
    const stepIds = body.the_ids?.map(s => s.step_id) || [];

    // 2a. Prevent duplicate steps in same path
    const uniqueStepIds = new Set(stepIds.map(id => id.toString()));
    if (uniqueStepIds.size !== stepIds.length) {
      return res.status(400).json({
        status: false,
        message: "Duplicate steps are not allowed in a path"
      });
    }

    // 2b. Validate step existence & status
    if (stepIds.length > 0) {
      const steps = await stepModel.find({
        _id: { $in: stepIds },
        status: { $ne: "delete" }
      });

      if (steps.length !== stepIds.length) {
        return res.status(400).json({
          status: false,
          message: "One or more steps are invalid or deleted"
        });
      }
    }
    // 🔹 STEP VALIDATION — END

    // 🔹 3. Create path object (unchanged)
    const newPath = {
      email: body.email,

      nameOfPath: body.nameOfPath,
      name: body.nameOfPath,

      description: body.description || "",

      current_coordinates: body.current_coordinates,
      feature_coordinates: body.feature_coordinates,

      path_type: body.path_type,
      path_cat: body.path_cat,

      destination_institution: body.destination_institution,
      destination_degree: body.destination_degree,

      length: body.length,
      city: body.city,
      country: body.country,

      program: body.program,

      grade: body.grade || [],
      grade_avg: body.grade_avg || [],
      curriculum: body.curriculum || [],
      stream: body.stream || [],
      financialSituation: body.financialSituation || [],
      personality: body.personality || "",

      the_ids: body.the_ids?.map(step => ({
        step_id: step.step_id,
        stepName: step.stepName,
        stepDescription: step.stepDescription,
        backup_pathId: step.backup_pathId || null,
        backupPathName: step.backupPathName || "",
        backupPathDescription: step.backupPathDescription || ""
      })) || [],

      status: "waitingforapproval"
    };

    const saved = await pathModel.create(newPath);

    return res.status(200).json({
      status: true,
      message: "Path created successfully",
      data: saved
    });

  } catch (error) {
    console.error("Add Path Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};




const updatePath = async (req, res) => {
    try {
        let { pathId, ...updateData } = req.body;

        if (!pathId || !mongoose.Types.ObjectId.isValid(pathId)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid or missing pathId',
            });
        }

        // Update the path with the provided fields
        const updatedPath = await pathModel.findByIdAndUpdate(
            pathId,
            updateData,
            { new: true }
        );

        if (!updatedPath) {
            return res.status(404).json({
                status: false,
                message: 'Path not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Path updated successfully',
            data: updatedPath,
        });

    } catch (error) {
        console.error("Error updating path:", error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error',
        });
    }
};

const updatePathStatus = async (req, res) => {
    const pathId = req.params.id;
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
        return res.status(400).json({ 
            status: false,
            message: 'Invalid status'
        });
    }

    try {
        const updatedPath = await pathModel.findByIdAndUpdate(
            pathId,
            { $set: { status } },
            { new: true, runValidators: false }  // ⭐ DISABLE VALIDATION ⭐
        );

        if (!updatedPath) {
            return res.status(404).json({
                status: false,
                message: 'Path not found'
            });
        }

        return res.status(200).json({
            status: true,
            message: `Path has been marked as ${status === 'active' ? 'approved' : 'rejected'}.`,
            data: updatedPath
        });

    } catch (error) {
        console.error("Error updating path status:", error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};

const getPath = async (req, res) => {
    let filter = {}
    if (req.query.status) {
        filter.status = req.query.status;
        if (req.query.status == "all")
            filter = {};
    } else {
        filter.status = "active";
    }
    if (req.query.path_id) filter._id = new mongoose.Types.ObjectId(req.query.path_id)
    if (req.query.email) filter.email = req.query.email;
    if (req.query.nameOfPath) filter.nameOfPath = req.query.nameOfPath;
    //if (req.query.university) filter.UniversityDetails =  { $elemMatch : { "_id": req.query.university}};
    if (req.query.program) filter.program = req.query.program;
    
    console.log(filter)
    pathModel.aggregate([
        {
            $match: filter
        },
        {
            $sort: { "createdAt": -1 }
        },
        {
            $lookup: {
                from: "career_steps",
                let: { "the_ids": "$the_ids.step_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$_id", "$$the_ids"] },
                                    { $eq: ["$status", "active"] },
                                ],
                            }
                        }
                    },
                    // {
                    //     $group: {
                    //         "_id": "$_id",
                    //         StepDetails: {
                    //             $push: "$$ROOT"
                    //         }
                    //     }
                    // }
                ],
                as: "StepDetails"
            }
        },
        {
            $lookup: {
                from: "universities",
                let: { "u_ids": "$university" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$_id", "$$u_ids"] },
                                ],
                            }
                        }
                    },
                ],
                as: "UniversityDetails"
            }
        },
    ])
        .then(paths => {
           if (paths.length === 0) {
    return res.json({
        status: true,
        data: [],
        message: 'No data found'
    })
}

            return res.json({
                status: true,
                total: paths.length,
                message: 'Paths data found',
                data: paths
            })
        }).catch(err => {
            console.log('err=========>', err);
            res.json({
                status: false,
                message: err.message
            });
        });
}
const getPathSpecific = async (req, res) => {
    try {
        let filter = {};

        // Set default status if not provided
        filter.status = req.query.status === 'all' ? {} : req.query.status || 'active';

        // Add _id filter if path_id is provided
        if (req.query.path_id) filter._id = new mongoose.Types.ObjectId(req.query.path_id);

        // Get user details from user service based on email
        const users = await userModel.find({ email: req.query.email }).lean();
        const user = users[0];

        // Check and add filters based on query parameters
        ['curriculum', 'grade', 'stream', 'performance', 'financialSituation','personality'].forEach(param => {
            if (req.query[param] && req.query[param] === 'true') {
                // Check if the user[param] is an array before using $in
                if (Array.isArray(user[param])) {
                    filter[param] = { $in: user[param] };
                } else {
                    filter[param] = user[param];
                }
            }
        });

        // console.log("SDSd", filter);

        // Find paths with specified filter and projection
        const paths = await pathModel.find(filter).lean();
if (paths.length === 0) {
    return res.json({
        status: true,
        data: [],
        message: 'No data found'
    })
}


        return res.status(200).json({
            status: true,
            total: paths.length,
            message: 'Paths data found',
            data: paths,
        });
    } catch (err) {
        console.log('err=========>', err);
        res.status(500).json({
            status: false,
            message: err.message,
        });
    }
};

const getPathNormal = async (req, res) => {
    try {
        const { status, financialSituation, performance, curriculum, grade, stream, personality } = req.body;

        let filter = {};

        // Set default status if not provided
        filter.status = status === 'all' ? {} : status || 'active';

        // Add _id filter if financialSituation is provided
        if (financialSituation) {
            filter.financialSituation = { $in: financialSituation };
        }
        // Add performance filter if provided
        if (performance) {
            filter.performance = { $in: performance };
        }
        // Add curriculum filter if provided
        if (curriculum) {
            filter.curriculum = { $in: curriculum };
        }
        // Add grade filter if provided
        if (grade) {
            filter.grade = { $in: grade };
        }
        // Add stream filter if provided
        if (stream) {
            filter.stream = { $in: stream };
        }
        // Add personality filter if provided
        if (personality) {
            filter.personality = { $in: personality };
        }


        const paths = await pathModel.find(filter).lean();

      if (paths.length === 0) {
    return res.json({
        status: true,
        data: [],
        message: 'No data found'
    })
}


        return res.status(200).json({
            status: true,
            total: paths.length,
            message: 'Paths data found',
            data: paths,
        });
    } catch (err) {
        console.log('err=========>', err);
        res.status(500).json({ 
            status: false,
            message: err.message,
        });
    }
};



const deletePath = async (req, res) => {
    try {
        // Check if the path exists
        const path = await pathModel.findById(req.params.id);

        if (!path) {
            return res.json({
                status: false,
                message: 'Path not found',
            });
        }

        if (path.status === "waitingforapproval") {
            // Soft delete for paths in "Pending Approval"
            const updatedPath = await pathModel.findOneAndUpdate(
                { _id: req.params.id },
                { status: "inactive" },  // Move to Inactive Paths
                { new: true }
            );
            return res.json({
                status: true,
                message: 'Path moved to Inactive Paths',
                data: updatedPath,
            });
        } else {
            // Soft delete for paths already in other statuses (mark as "delete")
            const updatedPath = await pathModel.findOneAndUpdate(
                { _id: req.params.id },
                { status: "delete" },  // Soft delete (mark as deleted)
                { new: true }
            );
            return res.json({
                status: true,
                message: 'Path marked as deleted',
                data: updatedPath,
            });
        }
    } catch (error) {
        console.error("Error in deletePath:", error);
        return res.status(500).json({
            status: false,
            message: 'An error occurred while deleting the path',
        });
    }
};



const restorePath = async (req, res) => {
    let restorePathData = await pathModel.findOneAndUpdate({ _id: req.params.id, status: "delete" }, { status: "active" }, { new: true });
    if (!restorePathData) {
        return res.json({
            status: false,
            message: 'Data not found',
        })
    }
    return res.json({
        status: true,
        message: 'Step restored',
        data: restorePathData
    })
}


// YourModel.updateMany({}, { $set: { city: 'Hyderabad' } }, (err, result) => {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log(`Updated ${result.nModified} documents`);
//     }


const updateFields = async (req, res) => {
    let updateAll = await pathModel.updateMany({}, { $set: { personality: "realistic" } }, { new: true });
    if (!updateAll) {
        return res.json({
            status: false,
            message: 'Data not found',
        })
    }
    return res.json({
        status: true,
        message: 'Details updated',
        data: updateAll
    })
}


const getActivePaths = async (req, res) => {
  try {
    const query = { status: "active" };

    // 🔑 ARRAY FIELDS — MUST USE $in
    if (req.query.grade) {
      query.grade = { $in: [req.query.grade] };
    }

    if (req.query.curriculum) {
      query.curriculum = { $in: [req.query.curriculum] };
    }

    if (req.query.stream) {
      query.stream = { $in: [req.query.stream] };
    }

    if (req.query.financial) {
      query.financialSituation = { $in: [req.query.financial] };
    }

    if (req.query.performance) {
      query.grade_avg = { $in: [req.query.performance] };
    }

    if (req.query.personality) {
      query.personality = req.query.personality;
    }

    console.log("ACTIVE PATH FILTER 👉", query);

    const activePaths = await pathModel.find(query);

    return res.status(200).json({
      success: true,
      total: activePaths.length,
      data: activePaths
    });
  } catch (error) {
    console.error("Error fetching active paths:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getPathById = async (req, res) => {
  try {
    const pathId = req.params.path_id;

    if (!mongoose.Types.ObjectId.isValid(pathId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid path ID provided",
      });
    }

    const objId = new mongoose.Types.ObjectId(pathId);

    const result = await pathModel.aggregate([
      { $match: { _id: objId } },
      {
        $lookup: {
          from: "career_steps",
          let: { stepIds: "$the_ids.step_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$stepIds"] },
                    { $ne: ["$status", "delete"] }
                  ]
                }
              }
            },
            { $sort: { createdAt: 1 } }
          ],
          as: "StepDetails",
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Path not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Path data found",
      data: result[0],
    });

  } catch (err) {
    console.error("Error fetching path:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const uploadBulkPaths = async (req, res) => {
    try {
        const { email, records } = req.body;

        if (!email) {
            return res.status(400).json({
                status: false,
                message: "Email is required"
            });
        }

        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({
                status: false,
                message: "Records array is required"
            });
        }

        const formatted = records.map(r => ({
            ...r,
            email,
            status: "active"
        }));

        const inserted = await pathModel.insertMany(formatted);

        return res.status(200).json({
            status: true,
            message: "Bulk paths inserted successfully",
            count: inserted.length
        });

    } catch (error) {
        console.error("Bulk upload error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


  
module.exports = {
    addPath,
    getPath,
    deletePath,
    restorePath,
    getPathSpecific,
    getPathNormal,
    updateFields,
    updatePath,
    getActivePaths,
    updatePathStatus,
    getPathById,
    uploadBulkPaths,
}







