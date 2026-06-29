import '@testing-library/jest-dom';
import React from 'react';

if (typeof React.act !== 'function') {
    React.act = function (callback) {
        const result = callback();
        if (result !== null && typeof result === 'object' && typeof result.then === 'function') {
            return result;
        }
        return {
            then: function (resolve) {
                resolve(result);
            }
        };
    };
}
