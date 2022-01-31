// Copyright 2021-2022, University of Colorado Boulder

/**
 * The two possible states of grouping for counting objects.
 *
 * @author Chris Klusendorf
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import countingCommon from '../../countingCommon.js';

class GroupType extends EnumerationValue {
  static UNGROUPED = new GroupType();
  static GROUPED = new GroupType();

  static enumeration = new Enumeration( GroupType );
}

countingCommon.register( 'GroupType', GroupType );
export default GroupType;