'use strict';

const config = require('config');
const passportGithub = require('passport-github');
const User = require('../models/User');
const Chat = require('../models/Chat');
const GithubAvatar = require('./github-avatar');

async function createUser(profile) {
    const user = new User({
        login: profile.username,
        name: profile.displayName,
        githubId: profile.id,
        contacts: [],
        chats: [],
        avatar: new GithubAvatar(profile.username, 200).toImgSrc()
    });

    await user.save();
    await user.addContact('OlesyaUserId');

    return user;
}

async function createChatWithOlesya(user) {
    const olesyaChat = new Chat({
        name: 'Olesya',
        dialog: true,
        users: []
    });

    await olesyaChat.save();

    await olesyaChat.addUser(user._id);
    await olesyaChat.addUser('OlesyaUserId');

    return olesyaChat;
}

module.exports.setSerializers = passport => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id).exec();

            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

module.exports.strategy = new passportGithub.Strategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${config.get('host')}/login/return`
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await User.findOne({ githubId: profile.id }).exec();
            if (user === null) {
                throw new Error('User doesnt exist, creating');
            }
            console.info(`User exist ${user.login}`);
            done(null, user);
        } catch (error) {
            console.info(error.message);

            const user = createUser(profile);

            const olesyaChat = createChatWithOlesya(user);

            const olesya = await User.findById('OlesyaUserId').exec();
            await olesya.addContact(user._id);
            await olesya.addChat(olesyaChat._id);

            await user.addChat(olesyaChat._id);

            done(null, user);
        }
    }
);
