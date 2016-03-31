import {
  ErrorType
} from 'netiam-errors'

export const ACL_ERROR = new ErrorType('ACL error.', 400, 'ACL_ERROR', 5000)
export const ACL_FORBIDDEN = new ErrorType('Request is not allowed.', 403, 'ACL_FORBIDDEN', 5001)
export const ACL_EMPTY_BODY = new ErrorType('Request body is empty.', 400, 'ACL_EMPTY_BODY', 5002)
