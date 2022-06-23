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
  public static DOG = new CountingObjectType();
  public static APPLE = new CountingObjectType();
  public static BUTTERFLY = new CountingObjectType();
  public static BALL = new CountingObjectType();
  public static PAPER_NUMBER = new CountingObjectType();

  public static enumeration = new Enumeration( CountingObjectType );
}

countingCommon.register( 'CountingObjectType', CountingObjectType );
export default CountingObjectType;