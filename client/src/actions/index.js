import React from "react";

export const SELECT_IFRAME = 'SELECT_IFRAME';
export const SET_IFRAME_LOADED = 'SET_IFRAME_LOADED';
export const TEXT_REQUEST = 'TEXT_REQUEST';
export const TEXT_RESPONSE = 'TEXT_RESPONSE';
export const FETCH_TEXT_FAILED = 'FETCH_TEXT_FAILED';
export const POST_TEXT_FAILED = 'POST_TEXT_FAILED';

export const selectIframe = selectedIframe => ({
  type: SELECT_IFRAME,
  selectedIframe
});

export const setIframeLoaded = iframeLoaded => ({
  type: SET_IFRAME_LOADED,
  iframeLoaded
});

export const textRequest = () => ({
  type: TEXT_REQUEST
});

export const receivedText = (text, style) => ({
  type: TEXT_RESPONSE,
  text,
  style
});

export const receivedFetchTextError = err => ({
  type: FETCH_TEXT_FAILED,
  err
});

export const receivedPostTextError = err => ({
  type: POST_TEXT_FAILED,
  err
});