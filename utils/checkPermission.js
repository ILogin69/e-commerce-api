const CustomError = require('../errors')

const checkPermission = (requestUser, queryUserId) => {
  if (requestUser.role === 'admin') return
  if (requestUser.userId === queryUserId.toString()) return
  throw new CustomError.UnauthorizedError('Not authorized for this route')
}

module.exports = checkPermission
