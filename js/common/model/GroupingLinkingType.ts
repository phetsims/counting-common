// Copyright 2021, University of Colorado Boulder

/**
 * The 3 possible states of grouping + linking in a play area
 *
 * @author Chris Klusendorf
 */

import countingCommon from '../../countingCommon.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import RichEnumeration from '../../../../phet-core/js/RichEnumeration.js';

class GroupingLinkingType extends EnumerationValue {
  static NO_GROUPING = new GroupingLinkingType();
  static GROUPING = new GroupingLinkingType();
  static GROUPING_AND_LINKED = new GroupingLinkingType();

  static enumeration = new RichEnumeration<GroupingLinkingType>( GroupingLinkingType );

  private constructor() { super(); }
}

countingCommon.register( 'GroupingLinkingType', GroupingLinkingType );
export default GroupingLinkingType;