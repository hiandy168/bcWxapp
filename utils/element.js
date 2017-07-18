class Element {
    constructor (argu){
        this.id = argu['id']
        this.firstNum = argu['firstNum']
        this.secondNum = argu['secondNum']
        this.thirdNum = argu['thirdNum']
        this.sum = argu['sum']
        this.sumlevel = argu['sumlevel']
        this.sumType = argu['sumType']
        this.beginTime = argu['beginTime']
        this.duration = argu['duration']
        this.residue = argu['residue']
    }
}

function createElement(argu){
      return  new Element(argu)
}

module.exports = {
  createElement: createElement
}