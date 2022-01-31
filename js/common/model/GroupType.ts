// Copyright 2021-2022, University of Colorado Boulder

/**
 * The 3 possible states of grouping + linking in a play area
 *
 * @author Chris Klusendorf
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import countingCommon from '../../countingCommon.js';

class GroupingLinkingType extends EnumerationValue {
  static UNGROUPED = new GroupingLinkingType();
  static GROUPED = new GroupingLinkingType();
  static GROUPED_AND_LINKED = new GroupingLinkingType();

  static enumeration = new Enumeration( GroupingLinkingType );
}

countingCommon.register( 'GroupingLinkingType', GroupingLinkingType );
export default GroupingLinkingType;