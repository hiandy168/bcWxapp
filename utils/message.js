
class Message {
    constructor (argu){
        this.type1 = argu['type1']
        this.content = argu['content']
        this.CTime = argu['CTime']
        this.user = argu['user']
        this.textHeight = argu['textHeight']
        this.hiddenPadding = argu['hiddenPadding']
        this.color = argu['color'] || 'black'
    }
}

function createMessage(argu){
     return new Message(argu);
}

module.exports = {
  createMessage: createMessage
}