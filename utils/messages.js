const moment = require('moment');
const {v4 : uuidv4} = require('uuid')

function formatMessage(username, text) {
  const messageId = uuidv4();
  return {
    username,
    text,
    time: moment().format('h:mm a'),
    msgId: messageId
  };
}

module.exports = formatMessage;
