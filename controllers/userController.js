const catchAsync = require(`./../utils/catchAsync`);
const userData = require('../models/userModel');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((field) => {
    if (allowedFields.includes(field)) newObj[field] = obj[field];
  });
  return newObj;
};
exports.getAllUsers = catchAsync(async (req, res, next) => {
  try {
    const users = await userData.find();
    res.status(200).json({
      status: 'success',
      users: users,
    });
  } catch (e) {
    res.status(500).json({
      status: 'error',
      message: e.message,
    });
  }
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Create error if user  POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  //2. Filtered out unwanted fields that are not allowed to be updated
  const filterBody = filterObj(req.body, 'name', 'email');

  //3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getUser = async (req, res) => {
  try {
    const user = await userData.findOne({ _id: res.params.id });
    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet developed',
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await userData.create(req.body);
    res.status(200).json({
      status: 'success',
      user: user,
    });
  } catch (error) {
    res.status(501).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await userData.findByIdAndDelete({ _id: req.params.id });
    res.status(200).json({
      status: 'deletion successfully done!',
      user: user,
    });
  } catch (error) {
    res.status(501).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await userData.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
