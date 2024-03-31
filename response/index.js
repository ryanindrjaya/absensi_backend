'use strict'

//Generate JSON
const createJSON = (code, message, results) => {
    return {
        status: code === 200 ? true : false,
        code,
        message,
        results,
        createAt: Date.now()
    }
}

//Response handler
const success = (data, res) => res.status(200).send(createJSON(200, 'Success', data))

const successWithCustomMsg = (msg, data, res) => res.status(200).send(createJSON(200, msg, data))

const successWithErrorMsg = (msg, res) => res.status(200).send(createJSON(501, msg, null))

const notFound = (data, res) => res.status(404).send(createJSON(404, 'Not Found', data))

const internalServerError = (err, res) => res.status(501).send(createJSON(501, 'Something problem was happen', err))

const errorParams = (mssg, res) => res.status(403).send(createJSON(401, mssg, null))

const forbidden = (data, res) => res.status(403).send(createJSON(403, 'Forbidden', data))


//Export
module.exports = {
    success,
    successWithCustomMsg,
    successWithErrorMsg,
    notFound,
    internalServerError,
    forbidden,
    errorParams
}
