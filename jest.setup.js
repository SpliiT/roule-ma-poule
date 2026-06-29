import '@testing-library/jest-dom';
import React, { act } from 'react';

// Polyfill pour React 19 / @testing-library/react où React.act pourrait manquer
if (typeof React.act !== 'function') {
    React.act = act;
}
