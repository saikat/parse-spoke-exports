#!/usr/bin/env node

var Baby = require('babyparse')
var fs = require('fs')

var path = process.argv[2]
var messages = []
var contacts = []

var files = fs.readdirSync(path)
var contactKeys = {}
var allQuestions = {}

function questionFromKey(key) {
  return key.substring(9, key.length - 1)
}

function parseFile(path, file) {
  if (file === '.DS_Store')
    return null
  var contents = Baby.parse(fs.readFileSync(`${path}/${file}`, 'utf8'), { header: true })
  if (contents.errors.length > 0) {
    throw new Error(`Got an error on ${file}`)
  }
  return contents
}

function isMessageFile(file) {
  return !!file.match(/.*-messages.csv$/)
}

// First make exhaustive list of all questions and keys
files.forEach((file) => {
  console.log('Creating keys for', file)
  var contents = parseFile(path, file)
  if (contents === null)
    return
  if (isMessageFile(file)) {
    messages = messages.concat(contents.data)
  } else {
    contents.data.forEach((ele) => {
      Object.keys(ele).forEach((key) => {
        if (key.match(/^question\[.*/)) {
          allQuestions[key] = true
        } else {
          contactKeys[key] = true
        }
      })
    })
  }
})

// Then read the files again (to speed this up, could cache in memory the first time around, but mem usage is already high)
allQuestions = Object.keys(allQuestions)
contactKeys = Object.keys(contactKeys)
console.log(allQuestions.length, contactKeys.length)

files.forEach((file) => {
  console.log('Parsing', file)
  var contents = parseFile(path, file)
  if (contents === null)
    return
  if (!isMessageFile(file)) {
    contents.data.forEach((ele) => {
      var rows = []
      var contactWithoutQuestions = {}
      contactKeys.forEach((key) => {
        contactWithoutQuestions[key] = ele[key]
      })
      allQuestions.forEach((key) => {
        if (ele.hasOwnProperty(key) && ele[key]) {
          var contact = {}
          Object.assign(contact, contactWithoutQuestions)
          contact['question'] = questionFromKey(key)
          contact['answer'] = ele[key]
          rows.push(contact)
        }
      })
      // Make sure we export contacts even if they never answered a question
      if (rows.length === 0) {
        var contact = {}
        Object.assign(contact, contactWithoutQuestions)
        contact['question'] = ''
        contact['answer'] = ''
        rows.push(contact)
      }
      contacts = contacts.concat(rows)
    })
  }
})

var messageCSV = Baby.unparse(messages, { header: true })
var contactsCSV = Baby.unparse(contacts, { header: true })

fs.writeFileSync('messages.csv', messageCSV)
fs.writeFileSync('survey-results.csv', contactsCSV)