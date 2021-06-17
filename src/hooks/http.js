import React from 'react';
import {useReducer, useCallback} from 'react';

const httpReducer =(currhttpState,action) => {
    switch (action.type){
      case 'SEND':
        return {loading: true, error: null, data: null, extra: action.extra};
      case 'RESPONSE':
        return { ...currhttpState, loading: false, data: action.reponseData};
      case 'ERROR':
        return {loading: false, error: action.errorMessage};
      case 'CLEAR':
        return{...currhttpState, error: null};
      default:
        throw new Error ('getting here is impossible!');
    };
  };


const useHttp = () => {
    const [httpState, dispatchHttp] = useReducer(httpReducer, {
      loading: false,
      error: null,
      data: null,
      extra: null,
      identifier: null
    });
  
    const sendRequest = useCallback(
      (url, method, body, reqExtra, reqIdentifer) => {
        dispatchHttp({ type: 'SEND', extra: reqExtra, identifier: reqIdentifer });
        fetch(url, {
          method: method,
          body: body,
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            return response.json();
          })
          .then(responseData => {
            dispatchHttp({
              type: 'RESPONSE',
              responseData: responseData,
              extra: reqExtra
            });
          })
          .catch(error => {
            dispatchHttp({
              type: 'ERROR',
              errorMessage: 'Something went wrong!'
            });
          });
      },
      []
    );
  
    return {
      isLoading: httpState.loading,
      data: httpState.data,
      error: httpState.error,
      sendRequest: sendRequest,
      reqExtra: httpState.extra,
      reqIdentifer: httpState.identifier
    };
};



export default useHttp;

