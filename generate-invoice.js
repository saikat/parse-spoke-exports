var Baby = require('babyparse')
var fs = require('fs')
var moment = require('moment')

var path = process.argv[2]
var charges = {}
var totals = {}
const messages = Baby.parse(fs.readFileSync(path, 'utf8'), { header: true })
if (messages.errors.length > 0) {
  console.log(messages.errors)
  throw new Error('Error')
}

messages.data.forEach((message) => {
  if (message.isFromContact === 'false') {
    var date = moment(message.attemptedAt).utc()
    var month = date.get('month')
    if (!charges.hasOwnProperty(month)) {
      charges[month] = {}
    }
    charges[month][message.contactNumber] = 0.07
  }
})

Object.keys(charges).forEach((month) => {
  console.log("JS month, ", month, ": ", Object.keys(charges[month]).length, " unique numbers")
  if (!totals.hasOwnProperty(month)) {
    totals[month] = 0
  }
  Object.keys(charges[month]).forEach((number) => {
    totals[month] += charges[month][number]
  })
})

console.log(totals)
