// Copyright 2022, University of Colorado Boulder

/**
 * Counting object types for counting-common.
 *
 * @author Chris Klusendorf
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import countingCommon from '../../countingCommon.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';

class CountingObjectType extends EnumerationValue {
  static DOG = new CountingObjectType();
  static APPLE = new CountingObjectType();
  static BUTTERFLY = new CountingObjectType();
  static BALL = new CountingObjectType();
  static PAPER_NUMBER = new CountingObjectType();

  static enumeration = new Enumeration( CountingObjectType );
}

countingCommon.register( 'CountingObjectType', CountingObjectType );
export default CountingObjectType;