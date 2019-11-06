const generateMessage = (userName, text)=>{
    return {
        userName,
        text,
        createAt: new Date().getTime()
    }
}

const generateLocationMessage = (userName, url)=>{
    return {
        userName,
        url,
        createAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}