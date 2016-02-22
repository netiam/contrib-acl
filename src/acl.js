import adapter from './adapters/json'

function req({acl}) {
}

function res({acl}) {
}

export const jsonAdapter = adapter

export default Object.freeze({
  req,
  res
})
