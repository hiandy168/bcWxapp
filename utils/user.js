class User {

    constructor (argu){    
        this.nickName = argu['nickName'] | ''
        this.tel = argu['tel'] | ''
        this.email = argu['email'] | ''
        this.wechat = argu['wechat'] | ''
        this.alipay = argu['alipay'] | ''
        this.avatarUrl = argu['avatarUrl'] | ''
    }
}

function createUser(argu){
     return new User(argu);
}

module.exports = {
  createUser: createUser
}