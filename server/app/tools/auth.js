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
        date: Date.now(),
        avatar: new GithubAvatar(profile.username, 200).toImgSrc()
    });

    await user.save();
    await user.addContact('OlesyaUserId');

    return user;
}

async function createChatWithOlesya(user) {
    const olesyaChat = new Chat({
        /* eslint-disable-next-line max-len */
        avatar: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSI1MDBweCIgaGVpZ2h0PSI1MDBweCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+ICAgIDxkZWZzPiAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSIxMDAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiIGlkPSJsaW5lYXJHcmFkaWVudC0xIj4gICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjNUYzN0ZDIiBvZmZzZXQ9IjAlIj48L3N0b3A+ICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI0I1MzhGQyIgb2Zmc2V0PSIxMDAlIj48L3N0b3A+ICAgICAgICA8L2xpbmVhckdyYWRpZW50PiAgICA8L2RlZnM+ICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPiAgICAgICAgPGcgaWQ9IjEwMDB4MTAwMCI+ICAgICAgICAgICAgPGNpcmNsZSBpZD0iT3ZhbCIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudC0xKSIgY3g9IjI1MCIgY3k9IjI1MCIgcj0iMjUwIj48L2NpcmNsZT4gICAgICAgICAgICA8cGF0aCBkPSJNMTY0LjI3NjU0NSwxNjQuNjg3MjQyIEMyMDcuMTQ0NDI3LDEyMS44MTkzNiAyOTIuODQwNDgsMTIxLjgzMjU5NyAzMzUuNjk1MTI1LDE2NC42ODcyNDIgQzM3OC41NDk3NywyMDcuNTQxODg3IDM3OC41NDk3NywyOTMuMjUxMTc3IDMzNS42OTUxMjUsMzM2LjEwNTgyMiBDMjkyLjg0MDQ4LDM3OC45NjA0NjcgMjA2LjAzMjM1MiwzNzcuODYxNjMgMTY0LjI3NjU0NSwzMzYuMTA1ODIyIEMxMjIuNTIwNzM3LDI5NC4zNTAwMTQgMTIxLjQwODY2MiwyMDcuNTU1MTI0IDE2NC4yNzY1NDUsMTY0LjY4NzI0MiBaIiBpZD0iUmVjdGFuZ2xlIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+ICAgICAgICA8L2c+ICAgIDwvZz48L3N2Zz4=',
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
