import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import Notification from 'react-web-notification';
import { PropTypes } from 'mobx-react/index';

@inject('messageNotificationState') @observer
export default class MessageNotification extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        messageNotificationState: PropTypes.observableObject
    };

    render() {
        const state = this.props.messageNotificationState;

        return (
            <Notification
                ignore={state.ignore ||
                    !state.title ||
                    (!state.options.body && !state.options.image)}
                notSupported={state.handleNotSupported.bind(state)}
                onPermissionGranted={state.handlePermissionGranted.bind(state)}
                onPermissionDenied={state.handlePermissionDenied.bind(state)}
                onClick={state.handleNotificationOnClick.bind(state)}
                onError={state.handleNotificationOnError.bind(state)}
                timeout={5000}
                title={state.title}
                options={state.options}
            />
        );
    }
}
