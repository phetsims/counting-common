// Copyright 2021, University of Colorado Boulder

/**
 * The 3 possible states of grouping + linking in NumberPlayModel
 *
 * @author Chris Klusendorf
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import countingCommon from '../../countingCommon.js';

// @public
const GroupingLinkingType = Enumeration.byKeys( [ 'NO_GROUPING', 'GROUPING', 'GROUPING_AND_LINKED' ] );

countingCommon.register( 'GroupingLinkingType', GroupingLinkingType );
export default GroupingLinkingType;