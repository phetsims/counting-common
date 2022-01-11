// Copyright 2021, University of Colorado Boulder

/**
 * A number like 120 is composed of 2 number images in this simulation. The baseNumber object represents the "parts"
 * In case of 120, we will have 2 base number one for 100 and another for 20.
 * Each base number is placed at a position within its composite (ex:120).
 *
 * @author Sharfudeen Ashraf
 */

import countingCommon from '../../countingCommon.js';
import CountingCommonUtils from '../CountingCommonUtils.js';
import BaseNumberNode from '../view/BaseNumberNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';

// Precompute bounds for each digit
const DIGIT_BOUNDS = [ 0, 1, 2, 3 ].map( place => {
  const dimension = BaseNumberNode.PAPER_NUMBER_DIMENSIONS[ place ];
  const offset = BaseNumberNode.IMAGE_OFFSETS[ place ];
  return dimension.toBounds( offset.x, offset.y );
} );

class BaseNumber {
  public readonly numberValue: number;
  public digitLength: number;
  public readonly place: number;
  public offset: Vector2;
  public bounds: Bounds2;
  public digit: number;

  /**
   * @param digit - The digit (1 to 9, won't create for a 0).
   * @param place - The decimal exponent for the number digit * 10^place.
   */
  constructor( digit: number, place: number ) {
    // The numeric value, e.g. 200 if digit is 2 and place is 2
    this.numberValue = digit * Math.pow( 10, place );

    // Number of digits in our numeric value
    this.digitLength = CountingCommonUtils.digitsInNumber( this.numberValue );

    // The place in the number (power of 10) that our digit would be multiplied by to sum, e.g. place 2 with a digit 3
    // has a numberValue = 300, i.e. 3 * 10^2.
    this.place = place;

    // The offset (relative to the number origin) for the placement of the upper-left corner of the image representing
    // this place value.
    this.offset = BaseNumberNode.IMAGE_OFFSETS[ this.place ];

    // The bounds (relative to the number origin) that this digit place will take up.
    this.bounds = DIGIT_BOUNDS[ this.place ];

    // The leading digit of the number, e.g. 2 for 200.
    this.digit = digit;
  }
}

countingCommon.register( 'BaseNumber', BaseNumber );

export default BaseNumber;