/* eslint-env browser */
import React from 'react';
import Styletron from 'styletron-client';
import {StyletronProvider} from 'styletron-react';

let styletron;

export default () => (ctx, next) => {
  if (ctx.element) {
    if (!styletron) {
      const styleElements = document.getElementsByClassName(
        '_styletron_hydrate_'
      );
      styletron = new Styletron(styleElements);
    }
    ctx.element = (
      <StyletronProvider styletron={styletron}>{ctx.element}</StyletronProvider>
    );
  }

  return next();
};