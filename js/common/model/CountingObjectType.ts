// Copyright 2022, University of Colorado Boulder

/**
 * Counting object types for counting-common.
 *
 * @author Chris Klusendorf
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import countingCommon from '../../countingCommon.js';
import PlayObjectType from './PlayObjectType.js';

class CountingObjectType extends PlayObjectType {
  static PAPER_NUMBER = new CountingObjectType();

  static enumeration = new Enumeration( CountingObjectType, {
    instanceType: PlayObjectType
  } );
}

countingCommon.register( 'CountingObjectType', CountingObjectType );
export default CountingObjectType;