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
  var date = moment(message.attemptedAt)
  var month = date.get('month')
  if (!charges.hasOwnProperty(month)) {
    charges[month] = {}
  }
  charges[month][message.contactNumber] = 0.07
})

Object.keys(charges).forEach((month) => {
  if (!totals.hasOwnProperty(month)) {
    totals[month] = 0
  }
  Object.keys(charges[month]).forEach((number) => {
    totals[month] += charges[month][number]
  })
})

console.log(totals)
