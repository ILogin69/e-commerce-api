const { StatusCodes } = require('http-status-codes')
const User = require('../models/User')
const CustomError = require('../errors')
const { attachCookiesToResponse, createUserToken } = require('../utils')

const register = async (req, res) => {
  const { email, name, password } = req.body
  const emailExists = await User.findOne({ email })
  if (emailExists) {
    throw new CustomError.BadRequestError('Email already exists')
  }
  //first user is the admin
  const isFirstAccount = (await User.countDocuments({})) === 0
  const role = isFirstAccount ? 'admin' : 'user'
  const user = await User.create({ email, name, password, role })

  const userTokenInfo = createUserToken(user)
  attachCookiesToResponse({ res, user: userTokenInfo })
  res.status(StatusCodes.CREATED).json({ user: userTokenInfo })
}
const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password')
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }
  const userTokenInfo = createUserToken(user)
  attachCookiesToResponse({ res, user: userTokenInfo })
  res.status(StatusCodes.OK).json({ user: userTokenInfo })
}

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  // for tests in dev mode
  res.status(StatusCodes.OK).json({ msg: 'user logged out' })
}

module.exports = { register, login, logout }
