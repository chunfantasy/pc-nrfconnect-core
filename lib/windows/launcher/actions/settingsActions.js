/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { remote } from 'electron';
import * as ErrorDialogActions from '../../../actions/errorDialogActions';
import * as AppsActions from './appsActions';
import * as AutoUpdateActions from './autoUpdateActions';

const settings = remote.require('./main/settings');

export const SETTINGS_LOAD = 'SETTINGS_LOAD';
export const SETTINGS_LOAD_SUCCESS = 'SETTINGS_LOAD_SUCCESS';
export const SETTINGS_LOAD_ERROR = 'SETTINGS_LOAD_ERROR';
export const SETTINGS_CHECK_UPDATES_AT_STARTUP_CHANGED = 'SETTINGS_CHECK_UPDATES_AT_STARTUP_CHANGED';
export const SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_SHOW = 'SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_SHOW';
export const SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_HIDE = 'SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_HIDE';

function loadSettingsAction() {
    return {
        type: SETTINGS_LOAD,
    };
}

function loadSettingsSuccessAction(settingsObj) {
    return {
        type: SETTINGS_LOAD_SUCCESS,
        settings: settingsObj,
    };
}

function loadSettingsErrorAction(error) {
    return {
        type: SETTINGS_LOAD_ERROR,
        error,
    };
}

function checkUpdatesAtStartupChangedAction(isEnabled) {
    return {
        type: SETTINGS_CHECK_UPDATES_AT_STARTUP_CHANGED,
        isEnabled,
    };
}

export function loadSettings() {
    return dispatch => {
        dispatch(loadSettingsAction());
        try {
            let shouldCheckForUpdatesAtStartup = settings.get('shouldCheckForUpdatesAtStartup');
            if (shouldCheckForUpdatesAtStartup === null) {
                shouldCheckForUpdatesAtStartup = true;
            }
            dispatch(loadSettingsSuccessAction({
                shouldCheckForUpdatesAtStartup,
            }));
        } catch (error) {
            dispatch(loadSettingsErrorAction(error));
            dispatch(ErrorDialogActions.showDialog(`Unable to load settings: ${error.message}`));
        }
    };
}

export function checkUpdatesAtStartupChanged(isEnabled) {
    return dispatch => {
        dispatch(checkUpdatesAtStartupChangedAction(isEnabled));
        try {
            settings.set('shouldCheckForUpdatesAtStartup', isEnabled);
        } catch (error) {
            dispatch(ErrorDialogActions.showDialog(`Unable to save settings: ${error.message}`));
        }
    };
}

export function showUpdateCheckCompleteDialog() {
    return {
        type: SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_SHOW,
    };
}

export function hideUpdateCheckCompleteDialog() {
    return {
        type: SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_HIDE,
    };
}

export function checkForUpdatesButtonClicked() {
    return dispatch => (
        dispatch(AppsActions.downloadLatestAppInfo({ rejectIfError: true }))
            .then(() => {
                dispatch(AutoUpdateActions.checkForCoreUpdates());
                dispatch(showUpdateCheckCompleteDialog());
            })
            .catch(error => (
                dispatch(ErrorDialogActions.showDialog(`Unable to check for updates: ${error.message}`))
            ))
    );
}
