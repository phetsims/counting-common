// Copyright 2021-2022, University of Colorado Boulder

/**
 * Play object types for counting-common.
 *
 * @author Chris Klusendorf
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import countingCommon from '../../countingCommon.js';

class PlayObjectType extends EnumerationValue {
  static DOG = new PlayObjectType();
  static APPLE = new PlayObjectType();
  static CUPCAKE = new PlayObjectType();
  static BALL = new PlayObjectType();

  static enumeration = new Enumeration( PlayObjectType );
}

countingCommon.register( 'PlayObjectType', PlayObjectType );
export default PlayObjectType;