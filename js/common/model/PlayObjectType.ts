// Copyright 2021, University of Colorado Boulder

/**
 * Play object types for counting-common.
 *
 * @author Chris Klusendorf
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import RichEnumeration from '../../../../phet-core/js/RichEnumeration.js';
import countingCommon from '../../countingCommon.js';

class PlayObjectType extends EnumerationValue {
  static DOG = new PlayObjectType();
  static APPLE = new PlayObjectType();
  static TURTLE = new PlayObjectType();
  static BALL = new PlayObjectType();

  static enumeration = new RichEnumeration( PlayObjectType );
}

countingCommon.register( 'PlayObjectType', PlayObjectType );
export default PlayObjectType;