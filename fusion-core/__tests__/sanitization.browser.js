/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {html, unescape} from '../src/sanitization';

test('sanitization api is not bundled', () => {
  expect(html).toBe(void 0);
  expect(typeof unescape).toBe('function');
});
