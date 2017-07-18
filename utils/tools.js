// getTextWidth(e.detail.value.value,100,18,18))
function getTextWidth(text,width,fontSize,lineHeight){
    var quotient = Math.floor(text.length * fontSize / width)
    
    var remainder = text.length * fontSize % width
    
    if(remainder > 0){
        quotient += 1
    }

    return quotient * lineHeight
}
module.exports = {
  getTextWidth: getTextWidth
}