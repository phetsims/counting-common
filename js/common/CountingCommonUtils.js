// Copyright 2015-2021, University of Colorado Boulder

/**
 * Utility methods for Counting Common code
 *
 * @author Sharfudeen Ashraf
 */

import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
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
  },

  /**
   * Creates an icon using an image over a background fill.
   * @public
   *
   * @param {HTMLImageElement} image
   * @param {scenery.fill} backgroundFill
   * @returns {Node}
   */
  createIconWithBackgroundColor( image, backgroundFill ) {
    const imageNode = new Image( image );

    return new ScreenIcon( new Node( {
      children: [
        new Rectangle( 0, 0, imageNode.imageWidth, imageNode.imageHeight, {
          fill: backgroundFill
        } ),
        imageNode
      ]
    } ), {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    } );
  }
};

countingCommon.register( 'CountingCommonUtils', CountingCommonUtils );

export default CountingCommonUtils;