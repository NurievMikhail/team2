/* eslint-disable no-invalid-this */
import { observable, computed, action } from 'mobx';
import * as States from '../enum/LoadState';
import ChatInputState from './states/ChatInputState';
import ChatState from './states/ChatState';
import ChatListState from './states/ChatListState';
import ChatPreviewState from './states/ChatPreviewState';
import ReactionSelectorState from './states/ReactionSelectorState';
import ChatCreateState from './states/ChatCreateState';

export default class UIStore {

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.chatState = new ChatState(this.rootStore.dataStore);
        this.chatListState = new ChatListState(this.rootStore.dataStore);
        this.chatCreateState = new ChatCreateState(this.rootStore.dataStore);
        this.chatPreviewState = new ChatPreviewState(this.rootStore.dataStore);
        this.chatInputState =
            new ChatInputState(this, this.rootStore.dataStore, this.chatPreviewState);
        this.reactionSelectorState = new ReactionSelectorState(this.rootStore.dataStore);
    }

    @observable mainView = {
        showContacts: true,
        showChat: true,
        showProfile: false
    };

    @computed
    get loaderState() {
        return getLoaderState(this.rootStore.dataStore.loadingState);
    }

    @action addAttachment = (attachment) => {
        this.chatPreviewState.addAttachment(attachment);
    };

    @action setSearchResults = (searchResults) => {
        if (searchResults) {
            this.chatListState.searchResults = searchResults
                .filter(chat => chat.login !== this.rootStore.dataStore.profile.login);
        } else {
            this.chatListState.searchResults = [];
        }
    };
}

function getLoaderState(loadingState) {
    let loaderState;
    let message = '';

    switch (loadingState) {
        case States.LOADED:
            loaderState = false;
            break;
        case States.LOAD_CONTACTS:
            loaderState = true;
            message = 'Loading contacts';
            break;
        case States.LOAD_PROFILE:
            loaderState = true;
            message = 'Loading profile';
            break;
        case States.ADD_CONTACT:
            loaderState = true;
            message = 'Adding contact';
            break;
        case States.ADD_CHAT:
            loaderState = true;
            message = 'Creating chat';
            break;
        default:
            break;
    }

    return { loaderState, message };
}
