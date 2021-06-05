// Copyright 2015-2021, University of Colorado Boulder

/**
 * Utility methods for Counting Common code
 *
 * @author Sharfudeen Ashraf
 */

import countingCommon from '../countingCommon.js';

const CountingCommonUtils = {
  /**
   * Common way of determining number of digits in a number.
   * @public
   *
   * @param {number} number - Should be an integer.
   */
  digitsInNumber( number ) {
    assert && assert( number % 1 === 0, 'Should be an integer' );

    // Not using log10, since phet.dot.Utils.log10( 1000 ) => 2.9999999999999996, which behaved badly with floor.
    return ( `${number}` ).length;
  }
};

countingCommon.register( 'CountingCommonUtils', CountingCommonUtils );

export default CountingCommonUtils;