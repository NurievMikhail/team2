/* eslint-disable complexity*/
import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { observer, inject, Provider } from 'mobx-react';
import ChatList from '../ChatList';
import Profile from '../Profile';
import Chat from '../Chat';
import MessageNotification from '../MessageNotification';
import ServiceMessage from '../Chat/ChatHistory/ServiceMessage';
import styles from './index.css';
import ChatItem from '../ChatList/ChatItem/index';

import Popup from 'reactjs-popup';
import AlarmSound from './alarm.mp3';
import Sound from 'react-sound';

@inject('rootStore') @observer
export default class App extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        rootStore: ReactPropTypes.object
    };

    defaultStyleOverride = {
        width: '420px',
        padding: '0',
        'borderRadius': '4px'
    };

    render() {
        const { dataStore, state } = this.props.rootStore;
        const {
            chatCreateState,
            chatListState,
            reactionSelectorState,
            alarmState,
            messageNotificationState
        } = state;

        const chatList = chatListState.chatsToDisplay.map(chat => (
            <ChatItem key={chat._id}
                current={chat._id === chatListState.currentChat._id}
                photoURL={chat.avatar}
                name={chat.name}
                lastMessage={chat.lastMessage.body}
                lastMessageDate={chat.lastMessage.createdAt}
                onClick={chatListState.selectChat.bind(chatListState, chat)}/>
        ));

        const { loaderState, message } = state.loaderState;

        return (
            <Provider
                chatListState={chatListState}
                chatCreateState={chatCreateState}
                reactionSelectorState={reactionSelectorState}
                alarmState={alarmState}
                state={state}
                dataStore={dataStore}
                messageNotificationState={messageNotificationState}>
                <div className={styles.Wrapper}>
                    <MessageNotification/>
                    <div className={styles.LoadingScreen}
                        style={{ display: loaderState ? 'flex' : 'none' }}>
                        <div className={styles.LoaderWrapper}>
                            <div className={styles.Loader}/>
                        </div>
                        <div className={styles.LoaderText}>{message}</div>
                    </div>
                    {state.mainView.showContacts &&
                    <ChatList>
                        {chatList}
                    </ChatList>}
                    {chatListState.currentChat.name
                        ? <Chat name={chatListState.currentChat.name}
                            avatar={chatListState.currentChat.avatar}
                            inviteLink={chatListState.currentChat.inviteLink}
                            dialog={chatListState.currentChat.dialog}>
                        </Chat>
                        : <div className={state.mainView.isNightTheme
                            ? styles.StubWrapper : styles.StubWrapperNight}
                        onClick={state.closeProfile.bind(state)}>
                            <ServiceMessage text="Please select a chat to start messaging"/>
                        </div>}
                    {state.mainView.showProfile &&
                    <Profile
                        closeProfile={state.closeProfile.bind(state)}
                        profile={dataStore.profile}/>}
                    <Sound
                        url={`${process.env.STATIC}/${AlarmSound}`}
                        playStatus={
                            alarmState.alarmMessage !== null
                                ? Sound.status.PLAYING
                                : Sound.status.STOPPED
                        }
                        loop={true}
                    />
                    <Popup
                        open={alarmState.alarmMessage !== null}
                        modal
                        closeOnDocumentClick={false}
                        closeOnEscape={false}
                        contentStyle={this.defaultStyleOverride}
                    >
                        {close => (
                            <div className={state.mainView.isNightTheme
                                ? styles.PopupContainer : styles.PopupContainerNight}>
                                <span className={styles.PopupUserInfo}>
                            Alarm!
                                </span>
                                <span className={styles.PopupClose} onClick={() => {
                                    close();
                                    alarmState.close();
                                }}>
                            ❌
                                </span>
                                <span
                                    className={styles.PopupContent}
                                    dangerouslySetInnerHTML={{
                                        __html: alarmState.alarmMessage.body
                                    }}
                                >
                                </span>
                            </div>
                        )}
                    </Popup>
                </div>
            </Provider>
        );
    }
}
