/* eslint-disable no-invalid-this */
import { observable, action } from 'mobx';
import { emojiIndex } from 'emoji-mart';
import ChatPreviewState from './ChatPreviewState';

export default class ChatInputState {

    constructor(dataStore, chatId, chatState) {
        this.dataStore = dataStore;
        this.previewState = new ChatPreviewState(dataStore);
        this.chatId = chatId;
        this.chatState = chatState;
    }

    @observable chatInput = '';
    @observable isRecord = false;
    @observable showEmojiList = false;
    @observable recognition = null;

    @action toggleEmojiList = () => {
        this.showEmojiList = !this.showEmojiList;
    };

    @action change = (inputText) => {
        this.chatInput = inputText;
    };

    @action toggleRecord = () => {
        this.isRecord = !this.isRecord;
    };

    @action submit = () => {
        if (!this.chatInput && this.previewState.attachments.length <= 0) {
            return;
        }

        if (this.previewState.uploadQueue.length > 0) {

            this.previewState.error = 'Wait until all files are loaded';

            return;
        }
        this.dataStore.sendMessage({
            chatId: this.chatId,
            text: this.chatInput,
            attachments: this.previewState.attachments.slice()
        });

        this.previewState.attachments = [];
        this.chatInput = '';
        this.chatState.scrollToEnd = true;
    };

    findEmoji = id => emojiIndex.search(id)
        .filter(x => x.id === id)
        .map(x => x.native);

    addEmojiIntoText(_, emojiValue) {
        this.chatInput += `${this.findEmoji(emojiValue.name)}`;
    }


}
