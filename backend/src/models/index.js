const User = require('./User');
const Category = require('./Category');
const Image = require('./Image');
const Style = require('./Style');
const BaseModel = require('./BaseModel');
const Idea = require('./Idea');
const Tag = require('./Tag');
const Post = require('./Post');
const Recharge = require('./Recharge');
const ImageReport = require('./ImageReport');
const CreditUsageLog = require('./CreditUsageLog');

// 模型工厂函数
function createModels(db) {
    return {
        User: new User(db),
        Category: new Category(db),
        Image: new Image(db),
        Style: new Style(db),
        Idea: new Idea(db),
        Tag: new Tag(db),
        Post: new Post(db),
        Recharge: new Recharge(db),
        ImageReport: new ImageReport(db),
        CreditUsageLog: new CreditUsageLog(db)
    };
}

module.exports = {
    createModels,
    User,
    Category,
    Image,
    Style,
    Idea,
    Tag,
    Post,
    Recharge,
    ImageReport,
    CreditUsageLog,
    BaseModel
};