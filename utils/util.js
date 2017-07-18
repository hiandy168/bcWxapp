function formatTime(date,isLong) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  if(isLong){
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }else {
    return [month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
}

function shortFormatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getRoomPage(city) {
    var urlPath = "pages/"+city+"/"+ city
    return getPage(urlPath)
}

function getPage(pageName) {
    var pages = getCurrentPages()
    return pages.find(function (page) {
            return page.__route__ == pageName
    })
}



module.exports = {
  formatTime: formatTime,
  formatNumber : formatNumber,
  getRoomPage : getRoomPage,
  shortFormatTime : shortFormatTime
}
