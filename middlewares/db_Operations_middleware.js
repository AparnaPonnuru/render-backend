const mongodb = require("mongodb");
const dbConnection = require('../mongodb_connection');
const database = dbConnection.makeDb();

// Create a Record
const createRecord = (collectionName, recordObj) => {
  return new Promise(async function (resolve, reject) {
    const collection_name = collectionName;
    const db = await database;
    let record = {
      ...recordObj,
    };
    db.collection(collection_name)
      .insertOne(record)
      .then((result) => {
        if (result) {
          resolve({
            status: true,
            data: result,
          });
        } else {
          reject({
            status: false,
            message: "No record found",
          });
        }
      })
      .catch((err) => {
        reject({
          status: false,
          message: err.message,
        });
      });
  });
};

// Create a Record Bulk
const createBulkRecordRecords = (collectionName, recordArrayObj) => {
  return new Promise(async function (resolve, reject) {
    const collection_name = collectionName;
    const db = await database;
    let records = [...recordArrayObj];
    db.collection(collection_name)
      .insertMany(records)
      .then((result) => {
        if (result) {
          resolve({
            status: true,
            data: result,
          });
        } else {
          reject({
            status: false,
            message: "No record found",
          });
        }
      })
      .catch((err) => {
        reject({
          status: false,
          message: err.message,
        });
      });
  });
};

// Get all Record
const getAllRecord = (collectionName, condObj, projectObj, sortObj) => {
  return new Promise(async function (resolve, reject) {
    const collection_name = collectionName;
    const db = await database;
    let condition = {
      ...condObj,
    };
    let project = {
      ...projectObj,
    };
    let sort = {
      ...sortObj,
    };
    // console.log("sort");
    //limit is undefined if not passed
    let limit = sort.limit?sort.limit:0
    //
    // console.log("sort", limit);
    let skip =  sort.skip?sort.skip:0
    delete sort.limit;
    delete sort.skip;
    // console.log("condition", condition);
    db.collection(collection_name)
      .find(condition, { projection: project })
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .toArray()
      .then((result) => {
        if (result) {
          resolve({
            status: true,
            data: result,
          });
        } else {
          reject({
            status: false,
            message: "No Record Found",
          });
        }
      })
      .catch((err) => {
        reject({
          status: false,
          message: err.message,
        });
      });
  });
};

// Get One Record
const getRecord = async (collectionName, condObj, projectObj) => {
  const collection_name = collectionName;
  const db = await database;
  let condition = {
    ...condObj,
  };
  let project = {
    ...projectObj,
  };
  let result = await db.collection(collection_name).findOne(condition, { projection: project });
  if (result) {
    return {
      status: true,
      data: result,
      message: "Record Found",
    };
  } else {
    return {
      status: false,
      message: "No Record Found",
    };
  }

};

//Update Record
const updateRecord = async (collectionName, condObj, updateObj) => {
  const collection_name = collectionName;
  const db = await database;
  let condition = {
    ...condObj,
  };
  let updateObject = {};
  let objForUpdate = updateObj;
  if (objForUpdate.incObj) {
    updateObject["$inc"] = objForUpdate.incObj;
    delete objForUpdate["incObj"];
  }
  if (objForUpdate.pushObj) {
    updateObject["$push"] = objForUpdate.pushObj;
    delete objForUpdate["pushObj"];
  }
  if (objForUpdate.addToSetObj) {
    updateObject["$addToSet"] = objForUpdate.addToSetObj;
    delete objForUpdate["addToSetObj"];
  }
  if (objForUpdate.pullObj) {
    updateObject["$pull"] = objForUpdate.pullObj;
    delete objForUpdate["pullObj"];
  }
  if (objForUpdate.unsetObj) {
    updateObject["$unset"] = objForUpdate.unsetObj;
    delete objForUpdate["unsetObj"];
  }
  if (Object.keys(objForUpdate).length > 0) updateObject["$set"] = objForUpdate;
  let result = await db.collection(collection_name).updateOne(condition, updateObject);

  if (result) {
    return {
      status: true,
      data: result,
      message: "Record Updated",
    };
  } else {
    return {
      status: false,
      message: "No Record Found",
    };
  }
};

// Update Record Bulk
const updateBulkRecords = (collectionName, condObj, updateObj) => {
  return new Promise(async function (resolve, reject) {
    const collection_name = collectionName;
    const db = await database;
    let condition = {
      ...condObj,
    };

    let updateObject = {};
    let objForUpdate = updateObj;
    if (objForUpdate.incObj) {
      updateObject["$inc"] = objForUpdate.incObj;
      delete objForUpdate["incObj"];
    }
    if (objForUpdate.pushObj) {
      updateObject["$push"] = objForUpdate.pushObj;
      delete objForUpdate["pushObj"];
    }
    if (objForUpdate.pullObj) {
      updateObject["$pull"] = objForUpdate.pullObj;
      delete objForUpdate["pullObj"];
    }
    if (Object.keys(objForUpdate).length > 0)
      updateObject["$set"] = objForUpdate;
    if (Object.keys(updateObject).length === 0)
      reject({
        status: false,
        message: "Couldn't update the object",
      });
    db.collection(collection_name)
      .updateMany(condition, updateObject)
      .then((result) => {
        if (result) {
          resolve({
            status: true,
            data: result,
          });
        } else {
          reject({
            status: false,
            message: "No Record Found",
          });
        }
      })
      .catch((err) => {
        reject({
          status: false,
          message: err.message,
        });
      });
  });
};

//count records
const countRecords = async (collectionName, condObj) => {
  const collection_name = collectionName;
  const db = await database;
  let condition = {
    ...condObj,
  };
  let result = await db.collection(collection_name).countDocuments(condition);
  if (result) {
    return {
      status: true,
      data: result,
      message: "Record Found",
    };
  } else {
    return {
      status: false,
      message: "No Record Found",
    };
  }
};



// Aggregate Records
const aggregateRecordFunction = (collectionName, aggregateArrayObj) => {
  return new Promise(async function (resolve, reject) {
    const collection_name = collectionName;
    const db = await database;
    let aggregatePipelineArray = [...aggregateArrayObj];
    db.collection(collection_name)
      .aggregate(aggregatePipelineArray)
      .toArray()
      .then((result) => {
        if (result) {
          resolve({
            status: true,
            data: result,
          });
        } else {
          reject({
            status: false,
            message: "No Record Found",
          });
        }
      })
      .catch((err) => {
        reject({
          status: false,
          message: err.message,
        });
      });
  });
};

//delete Record
const deleteRecord = async (collectionName, condObj) => {
  const collection_name = collectionName;
  const db = await database;
  let condition = {
    ...condObj,
  };
  let result = await db.collection(collection_name).deleteOne(condition);
  if (result) {
    return {
      status: true,
      data: result,
      message: "Record Deleted",
    };
  } else {
    return {
      status: false,
      message: "No Record Found",
    };
  }
};

module.exports = {
  createRecord,
  createBulkRecordRecords,
  getAllRecord,
  getRecord,
  updateRecord,
  updateBulkRecords,
  aggregateRecordFunction,
  deleteRecord,
  countRecords
};
