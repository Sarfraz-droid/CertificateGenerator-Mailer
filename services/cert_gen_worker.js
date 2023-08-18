const { workerData, parentPort } = require("worker_threads")

const {sendMail} = require("../utils/sendMail") 


const { args } = workerData

const { name, email, body, subject, files, accessToken } = args

sendMail(name, email, body, subject, files, accessToken).then(() => {
    parentPort.postMessage("Mail Sent Successfully!", name)
}).catch(() => {
    parentPort.postMessage("Error Sending Mail!", name)
})

